const express = require('express');
const router = express.Router();
const preferenceController = require('../../Controller/Matrimony/userPreferenceController');
const { protect } = require('../../Middleware/authMiddleware');

router.post('/createPreferences', protect, preferenceController.createPreference);
router.get('/getPreferences/:userId', protect, preferenceController.getPreferenceByUserId);

// Optional route to get current user's preference
router.get('/userPreferences/me', protect, preferenceController.getMyPreference);

module.exports = router;
