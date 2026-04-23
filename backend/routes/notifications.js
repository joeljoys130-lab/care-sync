const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.get('/', protect, ctrl.getNotifications);
router.put('/read-all', protect, ctrl.markAllAsRead);
router.put('/:id/read', protect, ctrl.markAsRead);
router.delete('/:id', protect, ctrl.deleteNotification);

module.exports = router;
