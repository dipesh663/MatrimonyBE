const express = require('express');
const router = express.Router();
const notificationController = require('../../Controller/Matrimony/notificationController');
const { authenticateToken } = require('../../Middleware/authMiddleware');

// Get all notifications for the current user
router.get('/', authenticateToken, notificationController.getNotifications);
// Mark a notification as read
router.put('/read/:notificationId', authenticateToken, notificationController.markAsRead);

module.exports = router; 