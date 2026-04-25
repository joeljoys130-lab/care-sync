const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");       // adjust path if different
const Appointment = require("../models/Appointment"); // adjust path if different

// ── Razorpay instance ─────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── @desc    Create a Razorpay order
// ── @route   POST /api/payments/razorpay/order
// ── @access  Private (patient)
const createRazorpayOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    // 1. Fetch appointment to get the consultation fee
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // 2. Guard: only the patient who booked can pay
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to pay for this appointment",
      });
    }

    // 3. Guard: don't create a duplicate order if already paid
    const existing = await Payment.findOne({
      appointment: appointmentId,
      status: "success",
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This appointment has already been paid for",
      });
    }

    // 4. Amount in paise (Razorpay requires smallest currency unit)
    //    Assumes appointment.fee is stored in INR (e.g. 500 → ₹500)
    const amountInPaise = appointment.fee * 100;

    // 5. Create order on Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${appointmentId}`,
    });

    // 6. Create a pending Payment record so we can confirm it later
    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user._id,
      amount: appointment.fee,         // store in INR for display
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });

    // 7. Return everything Payment.jsx needs
    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,   // order_id for Razorpay checkout
        amount: amountInPaise,               // in paise, passed to Razorpay SDK
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,  // public key for frontend
        paymentId: payment._id,              // our DB record id, sent back in confirm
      },
    });
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
    });
  }
};

// ── @desc    Confirm payment after Razorpay checkout success
// ── @route   POST /api/payments/razorpay/confirm
// ── @access  Private (patient)
const confirmPayment = async (req, res) => {
  try {
    const {
      paymentId,             // our DB _id from createRazorpayOrder response
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment confirmation fields",
      });
    }

    // 1. Verify Razorpay signature to ensure the response is genuine
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch → mark payment as failed
      await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
      return res.status(400).json({
        success: false,
        message: "Payment verification failed — invalid signature",
      });
    }

    // 2. Signature valid → mark payment as success
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // 3. Optional: mark the appointment as paid
    await Appointment.findByIdAndUpdate(payment.appointment, {
      isPaid: true,
    });

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: { payment },
    });
  } catch (error) {
    console.error("confirmPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while confirming payment",
    });
  }
};

// ── @desc    Get payment history for logged-in patient
// ── @route   GET /api/payments/history
// ── @access  Private (patient)
const getPaymentHistory = async (req, res) => {
  try {
    // PaymentHistory.jsx reads: res.data.data.payments[].{ amount, status, createdAt }
    const payments = await Payment.find({ patient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("appointment", "date doctor") // optional, handy for future UI
      .lean();

    return res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error("getPaymentHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment history",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  confirmPayment,
  getPaymentHistory,
};
