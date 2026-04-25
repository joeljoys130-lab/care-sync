const express = require("express");
const router = express.Router();

const { registerUser, loginUser, sendOtp, verifyOtp } = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const { registerValidator, loginValidator, sendOtpValidator, otpValidator } = require("../validators/authValidator");

router.post("/register", registerValidator, validate, registerUser);
router.post("/login", loginValidator, validate, loginUser);
router.post("/send-otp", sendOtpValidator, validate, sendOtp);
router.post("/verify-otp", otpValidator, validate, verifyOtp);

module.exports = router;