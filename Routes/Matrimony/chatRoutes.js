const express = require('express');
const router = express.Router();
const chatController = require('../../Controller/Matrimony/chatController');
const { protect } = require('../../Middleware/authMiddleware');

router.post('/messages', protect, chatController.sendMessage);
router.get('/messages/:userId', protect, chatController.getMessages);

module.exports = router;
