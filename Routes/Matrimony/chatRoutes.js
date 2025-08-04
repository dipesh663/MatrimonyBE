const express = require('express');
const router = express.Router();
const chatController = require('../../Controller/Matrimony/chatController');
const { authenticateToken } = require('../../Middleware/authMiddleware');

// Send a message: { receiver: userId, message: '...' }
router.post('/messages', authenticateToken, chatController.sendMessage);
// Get all messages between current user and another user
router.get('/messages/:userId', authenticateToken, chatController.getMessages);

module.exports = router;
