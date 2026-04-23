const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/paymentController');

// Razorpay mock endpoints
router.post('/razorpay/order', protect, authorize('patient'), ctrl.createRazorpayOrder);
router.post('/confirm', protect, authorize('patient'), ctrl.confirmPayment);
router.get('/history', protect, authorize('patient', 'doctor'), ctrl.getPaymentHistory);

module.exports = router;
