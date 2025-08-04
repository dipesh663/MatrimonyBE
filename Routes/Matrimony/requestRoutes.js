const express = require('express');
const router = express.Router();
const requestController = require('../../Controller/Matrimony/requestController');
const { authenticateToken } = require('../../Middleware/authMiddleware');

// Send a request: { receiver: userId }
router.post('/send', authenticateToken, requestController.sendRequest);
// Get all requests received by the current user
router.get('/received', authenticateToken, requestController.getRequests);
// Get all requests sent by the current user
router.get('/sentRequest', authenticateToken, requestController.getSentRequests);
// Accept a request by requestId
router.post('/accept/:requestId', authenticateToken, requestController.acceptRequest);
// Reject a request by requestId
router.post('/reject/:requestId', authenticateToken, requestController.rejectRequest);
// Cancel a pending request by requestId
router.delete('/cancel/:requestId', authenticateToken, requestController.cancelRequest);
// Unfriend a user by requestId
router.delete('/unfriend/:requestId', authenticateToken, requestController.unfriendUser);

module.exports = router;