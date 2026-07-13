const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', protect, authorize('CEO', 'ADMIN'), registerUser);
router.get('/users', protect, authorize('CEO', 'ADMIN'), getUsers);

module.exports = router;
