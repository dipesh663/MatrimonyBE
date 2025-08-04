const express = require('express');
const router = express.Router();
const { educationCareer, getEducationCareer, getEducationCareerById } = require('../../Controller/Matrimony/educationCareerController');
const { authenticateToken } = require('../../Middleware/authMiddleware');

// Route to create or update education and career details
router.post('/education-career', authenticateToken, educationCareer);

// Route to get education and career details
router.get('/education-career', authenticateToken, getEducationCareer);

// Route to get education and career details by userId
router.get('/education-career/:userId', authenticateToken, getEducationCareerById);

module.exports = router;
