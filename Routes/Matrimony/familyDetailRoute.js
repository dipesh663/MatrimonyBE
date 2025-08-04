const express = require('express');
const router = express.Router();
const { familyDetail, getFamilyDetail,getFamilyDetailById } = require('../../Controller/Matrimony/familyDetailController');
const { authenticateToken } = require('../../Middleware/authMiddleware');

// Route to create or update family details
router.post('/family-detail', authenticateToken, familyDetail);

// Route to get family details
router.get('/family-detail', authenticateToken, getFamilyDetail);

// Route to get family detail by userId (for frontend profile page)
router.get('/family-detail/:userId', authenticateToken, getFamilyDetailById);

module.exports = router;
