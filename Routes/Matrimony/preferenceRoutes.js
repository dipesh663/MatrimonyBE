const express = require('express');
const router = express.Router();
const preferenceController = require('../../Controller/Matrimony/preferenceController');
const { authenticateToken } = require('../../Middleware/authMiddleware');


// Route to update preferences
router.put('/', authenticateToken, preferenceController.updatePreferences);

// Route to get preferences
router.get('/', authenticateToken, preferenceController.getPreferences);

// Route to find matches based on preferences
router.get('/matches/preference', authenticateToken, preferenceController.findMatchesByPreference);

module.exports = router;
