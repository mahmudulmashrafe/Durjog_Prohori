const mongoose = require('mongoose');

const UserNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['disaster', 'alert', 'info'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'usernotifications'
});

// Create index for userId and createdAt for efficient querying
UserNotificationSchema.index({ userId: 1, createdAt: -1 });

const UserNotification = mongoose.model('UserNotification', UserNotificationSchema);

module.exports = UserNotification; 