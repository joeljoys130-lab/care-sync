const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { createNotification } = require('../utils/notificationHelper');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// ─── Initialize Razorpay SDK ──────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay Order ──────────────────────────────────────────────
exports.createRazorpayOrder = async (req, res) => {
  const { appointmentId } = req.body;

  const appointment = await Appointment.findById(appointmentId).populate('doctorId');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

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
    // 3. Issue Network Request to Official Razorpay Endpoint
    const order = await razorpay.orders.create(options);
    
    // Save the official tracking order ID in DB
    payment.razorpayOrderId = order.id;
    await payment.save();

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID, // Provide the public string so frontend handles it dynamically
      },
    });
  } catch (error) {
    console.error('Razorpay Order error:', error);
    res.status(500).json({ success: false, message: 'Payment gateway error while creating order.' });
  }
};

// ─── Confirm & Verify Real Razorpay Payment ────────────────────────────────────────
exports.confirmPayment = async (req, res) => {
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
  const bodyString = razorpay_order_id + '|' + razorpay_payment_id;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(bodyString.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    return res.status(400).json({ success: false, message: 'Payment verification failed due to invalid signature.' });
  }

  // 2. Verified - Update Status Models
  payment.status = 'completed';
  payment.razorpayPaymentId = razorpay_payment_id;
  await payment.save();

  // Update appointment success
  await Appointment.findByIdAndUpdate(payment.appointmentId, {
    isPaid: true,
    paymentId: payment._id,
    status: 'confirmed',
  });

  // Credit doctor earnings
  await Doctor.findByIdAndUpdate(payment.doctorId, {
    $inc: { totalEarnings: payment.amount },
  });

  // Notify via sockets/push alerts
  await createNotification({
    userId: req.user.id,
    title: 'Payment Successful',
    message: `Payment of ₹${payment.amount} was verified and successful. Your appointment is confirmed.`,
    type: 'payment_success',
    refId: payment._id,
    refModel: 'Payment',
  });

  res.json({
    success: true,
    message: 'Payment verified successfully and Appointment confirmed.',
    data: { payment },
  });
};

// ─── Get Payment History ──────────────────────────────────────────────────────
exports.getPaymentHistory = async (req, res) => {
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
};
