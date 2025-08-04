const express = require('express');
const router = express.Router();
const { userDetail, getUserDetail, getUserDetailById } = require('../../Controller/Matrimony/userDetailController');
const { authenticateToken } = require('../../Middleware/authMiddleware');
const upload = require('../../Middleware/upload');
const matchRoutes = require('./matchRoutes');

// Route to create or update user details
router.post('/user-detail', authenticateToken, upload.single('profilePicture'), userDetail);

// Route to get user details
router.get('/user-detail', authenticateToken, getUserDetail);

// Route to get user details by user ID
router.get('/user-detail/:userId', authenticateToken, getUserDetailById);

// Register matchRoutes
router.use('/matches', matchRoutes);

module.exports = router;
