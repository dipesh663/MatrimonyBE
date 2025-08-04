const express = require('express');
const { createHoroscope, getHoroscope, getCompatibleMatches, getHoroscopeById, updateHoroscopeById } = require('../../Controller/Matrimony/horoscopeController');
const { authenticateToken } = require('../../Middleware/authMiddleware');
const router = express.Router();

router.post('/horoscope', authenticateToken, createHoroscope);
router.get('/horoscope', authenticateToken, getHoroscope);
router.get('/compatible-matches', authenticateToken, getCompatibleMatches);
router.get('/horoscope/:userId', authenticateToken, getHoroscopeById);
router.put('/horoscope/:id', authenticateToken, updateHoroscopeById);

module.exports = router;