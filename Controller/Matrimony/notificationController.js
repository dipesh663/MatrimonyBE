const Notification = require('../../Model/Matrimony/notificationModel');

exports.getNotifications = async (req, res) => {
  try {
    const user = req.userId;
    const notifications = await Notification.find({ user }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as read', error: err.message });
  }
}; 