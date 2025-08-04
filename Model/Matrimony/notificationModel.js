const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
  type: { type: String, required: true }, // e.g., 'request', 'accept', 'message'
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  link: { type: String } // optional: link to related resource (e.g., request/chat)
});

module.exports = mongoose.model('Notification', notificationSchema); 