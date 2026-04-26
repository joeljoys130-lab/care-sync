const express = require("express");
const router = express.Router();

const { registerUser, loginUser, sendOtp, verifyOtp, resetPassword, forgotPassword } = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const { registerValidator, loginValidator, sendOtpValidator, otpValidator, resetPasswordValidator } = require("../validators/authValidator");

router.post("/register",   registerValidator,  validate, registerUser);
router.post("/login",      loginValidator,     validate, loginUser);
router.post("/send-otp",  sendOtpValidator,   validate, sendOtp);
router.post("/verify-otp",otpValidator,      validate, verifyOtp);
router.post("/forgot-password", sendOtpValidator, validate, forgotPassword);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);



module.exports = router;