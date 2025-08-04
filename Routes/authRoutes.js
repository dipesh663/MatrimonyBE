const express = require('express');
const router = express.Router();
const { signup, login, verifyToken } = require('../Controller/authController');

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

// Route to verify token
router.get('/verify-token', verifyToken);

module.exports = router;
