const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('./controllers/adminController');
const { protect, authorize } = require('./middleware/authMiddleware');

// Only Administrator and CEO can view financial work rates
router.get('/stats', protect, authorize('ADMIN', 'CEO'), getDashboardStats);

module.exports = router;