const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 * @param {Object} data - { userId, title, message, type, link, refId, refModel }
 */
const createNotification = async ({ userId, title, message, type = 'system', link = '', refId, refModel }) => {
  try {
    await Notification.create({ userId, title, message, type, link, refId, refModel });
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = { createNotification };
