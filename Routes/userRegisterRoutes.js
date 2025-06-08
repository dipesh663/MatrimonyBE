const express = require('express');
const router = express.Router();
const userRegisterController = require('../Controller/userRegistrationController');
const { protect } = require('../Middleware/authMiddleware');


// Register or update registration details (protected)
router.post('/register', protect, userRegisterController.createRegister);

// Get all registered users (protected, or admin only)
router.get('/all-register-details', protect, userRegisterController.getAllRegisteredDetails);

// Get current user's registration details (protected)
router.get('/getcurrentRegisteredDetails/:userId', protect, userRegisterController.getcurrentRegisteredDetails);
module.exports = router;