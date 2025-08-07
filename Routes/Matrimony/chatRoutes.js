const express = require('express');
const router = express.Router();
const chatController = require('../../Controller/Matrimony/chatController');
const { authenticateToken } = require('../../Middleware/authMiddleware');

// Send a message: { receiver: userId, message: '...' }
router.post('/messages', authenticateToken, chatController.sendMessage);

// Get all messages between current user and another user
router.get('/messages/:userId', authenticateToken, chatController.getMessages);

// Get unread message count for current user
router.get('/unread-count', authenticateToken, chatController.getUnreadMessageCount);

// Mark messages as read from a specific sender
router.put('/messages/read/:senderId', authenticateToken, chatController.markMessagesAsRead);

// Track profile view
router.post('/track-profile-view/:viewedUserId', authenticateToken, chatController.trackProfileView);

module.exports = router;
