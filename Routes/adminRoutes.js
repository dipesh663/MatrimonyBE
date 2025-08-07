const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../Middleware/authMiddleware');
const adminController = require('../Controller/adminController');

// Get all users
router.get('/users', authenticateToken, isAdmin, adminController.getAllUsers);
// Delete user
router.delete('/users/:id', authenticateToken, isAdmin, adminController.deleteUser);
// Analytics summary
router.get('/analytics/summary', authenticateToken, isAdmin, adminController.getAnalyticsSummary);

module.exports = router;