const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const {
  createRazorpayOrder,
  confirmPayment,
  getPaymentHistory,
} = require("../controllers/paymentController");

// Razorpay payment flow
router.post('/razorpay/order', protect, authorize('patient'), createRazorpayOrder);
router.post('/razorpay/confirm', protect, authorize('patient'), confirmPayment);

// Payment history
router.get('/history', protect, authorize('patient', 'doctor'), getPaymentHistory);

module.exports = router;