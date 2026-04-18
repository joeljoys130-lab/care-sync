const express = require("express");
const router = express.Router();

const { createPayment, getPayments } = require("../controllers/payment.controller");
const auth = require("../middleware/authMiddleware");

router.post("/create", auth, createPayment);
router.get("/history", auth, getPayments);

module.exports = router;