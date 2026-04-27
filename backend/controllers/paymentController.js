const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { createNotification } = require('../utils/notificationHelper');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// ─── Initialize Razorpay SDK ──────────────────────────────────────────────
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ─── Create Razorpay Order ──────────────────────────────────────────────
exports.createRazorpayOrder = async (req, res, next) => {
  try {
  const { appointmentId } = req.body;

  const appointment = await Appointment.findById(appointmentId).populate('doctorId');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  if (!razorpay) {
    console.warn('Razorpay keys missing. Running in DEMO payment mode.');
  }

  if (appointment.isPaid) {
    return res.status(400).json({ success: false, message: 'Appointment is already paid.' });
  }

  const patient = await Patient.findOne({ userId: req.user.id });

  // 1. Create our internal pending Payment Record
  const payment = await Payment.create({
    appointmentId,
    patientId: patient._id,
    doctorId: appointment.doctorId._id,
    amount: appointment.fees,
    method: 'razorpay',
    currency: 'inr',
    status: 'pending',
    transactionId: uuidv4(),
  });

  // 2. Initialize the Razorpay Order Request Parameters
  const amountPaisa = appointment.fees * 100; // Razorpay requires lowest denomination
  const options = {
    amount: amountPaisa,
    currency: 'INR',
    receipt: payment._id.toString(),
  };

  try {
    let order;
    if (razorpay) {
      // 3. Issue Network Request to Official Razorpay Endpoint
      order = await razorpay.orders.create(options);
    } else {
      // Mock order for demo mode
      order = {
        id: `demo_${uuidv4().replace(/-/g, '')}`,
        amount: amountPaisa,
        currency: 'INR'
      };
    }
    
    // Save the tracking order ID in DB
    payment.razorpayOrderId = order.id;
    await payment.save();

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo', // Fallback key
        isDemo: !razorpay
      },
    });
  } catch (error) {
    console.error('Razorpay Order error:', error);
    res.status(500).json({ success: false, message: 'Payment gateway error while creating order.' });
  }
} catch (err) {
    next(err);
  }
};

// ─── Confirm & Verify Real Razorpay Payment ────────────────────────────────────────
exports.confirmPayment = async (req, res, next) => {
  try {
  // We extract matching fields injected by the frontend Razorpay callback widget
  const { paymentId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Incomplete payment payload' });
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });

  if (payment.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Payment already completed.' });
  }

  // 1. Implement Highly Secure Hash Verification Process (HMAC SHA-256)
  const isDemo = razorpay_order_id.startsWith('demo_');
  let isAuthentic = false;

  if (isDemo) {
    isAuthentic = true;
  } else {
    const bodyString = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(bodyString.toString())
      .digest('hex');
    isAuthentic = expectedSignature === razorpay_signature;
  }

  if (!isAuthentic) {
    return res.status(400).json({ success: false, message: 'Payment verification failed due to invalid signature.' });
  }

  // 2. Verified - Update Status Models
  console.log(`Payment ${paymentId} verified. Updating status...`);
  payment.status = 'completed';
  payment.razorpayPaymentId = razorpay_payment_id;
  await payment.save();

  // Update appointment success
  try {
    const updatedAppt = await Appointment.findByIdAndUpdate(payment.appointmentId, {
      isPaid: true,
      paymentId: payment._id,
      status: 'confirmed',
    }, { new: true });
    console.log(`Appointment ${payment.appointmentId} updated to confirmed.`);
  } catch (apptErr) {
    console.error('Failed to update appointment status:', apptErr);
  }

  // Credit doctor earnings
  try {
    await Doctor.findByIdAndUpdate(payment.doctorId, {
      $inc: { totalEarnings: payment.amount },
    });
    console.log(`Credited ₹${payment.amount} to doctor ${payment.doctorId}.`);
  } catch (docErr) {
    console.error('Failed to update doctor earnings:', docErr);
  }

  // Notify via sockets/push alerts
  try {
    await createNotification({
      userId: req.user.id,
      title: 'Payment Successful',
      message: `Payment of ₹${payment.amount} was verified and successful. Your appointment is confirmed.`,
      type: 'payment_success',
      refId: payment._id,
      refModel: 'Payment',
    });
  } catch (notifErr) {
    console.error('Failed to send payment notification:', notifErr);
  }

  res.json({
    success: true,
    message: 'Payment verified successfully and Appointment confirmed.',
    data: { payment },
  });
} catch (err) {
    next(err);
  }
};

// ─── Get Payment History ──────────────────────────────────────────────────────
exports.getPaymentHistory = async (req, res, next) => {
  try {
  const { page = 1, limit = 10 } = req.query;

  let query = {};
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (patient) query.patientId = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (doctor) query.doctorId = doctor._id;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name' }
    })
    .populate('appointmentId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: {
      payments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
} catch (err) {
    next(err);
  }
};
