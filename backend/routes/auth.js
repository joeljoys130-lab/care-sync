const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['patient', 'doctor']).withMessage('Invalid role'),
  ],
  validate,
  ctrl.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  ctrl.login
);

// OTP Verification
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  ctrl.verifyOTP
);

// Resend OTP
router.post(
  '/resend-otp',
  [body('email').isEmail().withMessage('Valid email required').normalizeEmail()],
  validate,
  ctrl.resendOTP
);

// Forgot Password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email required').normalizeEmail()],
  validate,
  ctrl.forgotPassword
);

// Reset Password
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  ctrl.resetPassword
);

// Refresh Token
router.post('/refresh-token', ctrl.refreshToken);

// Logout (requires auth)
router.post('/logout', protect, ctrl.logout);

module.exports = router;
