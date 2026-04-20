const express = require("express");
const router = express.Router();

const { createPayment, getPayments } = require("../controllers/payment.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createPayment);
router.get("/history", protect, getPayments);


module.exports = router;