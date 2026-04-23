const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const ctrl = require('../controllers/userController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
], validate, ctrl.updateProfile);
router.put('/avatar', protect, uploadAvatar, ctrl.uploadAvatar);
router.put('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], validate, ctrl.changePassword);
router.delete('/account', protect, ctrl.deleteAccount);

module.exports = router;
