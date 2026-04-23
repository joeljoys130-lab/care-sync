const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, (req, res) => {
  res.json({ message: "Payment route working" });
});

const { createPayment, getPayments } = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

router.post("/create", protect, authorize("patient"), createPayment);
router.get("/history", protect, authorize("patient"), getPayments);


module.exports = router;