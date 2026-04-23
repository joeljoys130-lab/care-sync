const Notification = require('../models/Notification');

// ─── Get User Notifications ───────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { userId: req.user.id };
  if (unreadOnly === 'true') query.isRead = false;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
};

// ─── Mark Single Notification as Read ────────────────────────────────────────
exports.markAsRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true }
  );
  res.json({ success: true, message: 'Marked as read.' });
};

// ─── Mark All as Read ─────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read.' });
};

// ─── Delete a Notification ────────────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ success: true, message: 'Notification deleted.' });
};
