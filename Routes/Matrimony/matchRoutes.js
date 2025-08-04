const express = require('express');
const router = express.Router();
const { getRecommendations, getMatchesByGender, searchUsers } = require('../../Controller/Matrimony/matchController');
const { authenticateToken } = require('../../Middleware/authMiddleware');

// GET /api/matrimony/matches/recommendations
router.get('/recommendations', authenticateToken, getRecommendations);
// GET /api/matrimony/matches/gender-matches
router.get('/gender-matches', authenticateToken, getMatchesByGender);
// GET /api/matrimony/matches/search?query=searchterm
router.get('/search', authenticateToken, searchUsers);

module.exports = router;
