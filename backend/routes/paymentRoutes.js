const express = require("express");
const router = express.Router();

const { createPayment, getPayments } = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { createRazorpayOrder, confirmPayment } = require('../controllers/paymentController');

router.post("/create", protect, authorize("patient"), createPayment);
router.get("/history", protect, authorize("patient"), getPayments);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/confirm', confirmPayment);


module.exports = router;