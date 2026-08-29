const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later' }
});
const { registerUser, loginUser, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', loginLimiter, loginUser);
router.post('/register', protect, authorize('CEO', 'ADMIN'), registerUser);
router.get('/users', protect, authorize('CEO', 'ADMIN'), getUsers);

module.exports = router;
