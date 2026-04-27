const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', loginUser);

// Only CEO can register new users
router.post('/register', protect, authorize('CEO'), registerUser);

module.exports = router;