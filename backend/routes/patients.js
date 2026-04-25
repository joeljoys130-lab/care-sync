const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
 
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/patientController');
 
// ── Security Fix 1: Rate Limiter ─────────────────────────────────────────────
// Limits profile update to 10 requests per 15 minutes per user
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per window
  keyGenerator: (req) => req.user?.id || req.ip, // rate limit per user, not IP
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many profile update requests. Please try again after 15 minutes.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
 
// ── Security Fix 2: Multer — MIME validation + filename sanitization ──────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    // Sanitize: strip original name entirely, generate a random safe filename
    const ext = path.extname(file.originalname).toLowerCase(); // e.g. .jpg
    const safeName = `avatar_${req.user.id}_${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});
 
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
 
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});
 
// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/profile',      protect, authorize('patient'), ctrl.getPatientProfile);
 
// Rate limiter applied to profile update
router.put('/profile',      protect, authorize('patient'), profileUpdateLimiter, ctrl.updatePatientProfile);
 
// Avatar upload route — multer runs first, then controller
router.post('/avatar',      protect, authorize('patient'), avatarUpload.single('avatar'), ctrl.uploadAvatar);
 
router.get('/appointments', protect, authorize('patient'), ctrl.getPatientAppointments);
router.post('/favorites/:doctorId', protect, authorize('patient'), ctrl.toggleFavorite);
router.get('/favorites',    protect, authorize('patient'), ctrl.getFavorites);
 
module.exports = router;