const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [200],
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000],
    },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_confirmed',
        'appointment_cancelled',
        'appointment_reminder',
        'appointment_completed',
        'payment_success',
        'payment_failed',
        'review_received',
        'doctor_approved',
        'doctor_rejected',
        'system',
      ],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Optional link to related resource
    link: {
      type: String,
      default: '',
    },
    // Related resource reference
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    refModel: {
      type: String,
      enum: ['Appointment', 'Payment', 'Review', 'Doctor', ''],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
