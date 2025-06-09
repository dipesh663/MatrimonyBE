const express = require('express');
const router = express.Router();
const requestController = require('../../Controller/Matrimony/requestController');
const { protect } = require('../../Middleware/authMiddleware');

router.post('/send', protect, requestController.sendRequest);
router.get('/received', protect, requestController.getRequests);
router.get('/sentRequest', protect, requestController.getSentRequests);
router.post('/accept/:requestId', protect, requestController.acceptRequest);
// router.post('/reject/:requestId', protect, requestController.rejectRequest);
router.delete('/cancel/:requestId', protect, requestController.cancelRequest);
router.delete('/unfriend/:requestId', protect, requestController.unfriendUser);


module.exports = router;