const express = require('express');
const router = express.Router();
const shortlistController = require('../../Controller/Matrimony/shortlistController');
const { protect } = require('../../Middleware/authMiddleware');

// Add to shortlist
router.post('/add', protect, shortlistController.addToShortlist);
// Get shortlist
router.get('/list', protect, shortlistController.getShortlist);
// Remove from shortlist
router.delete('/remove/:shortlistedUserId', protect, shortlistController.removeFromShortlist);


module.exports = router;
