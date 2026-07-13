const express = require('express');
const router = express.Router();
const { getDashboardStats, getAIInsights, getTransactions, createTransaction } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('ADMIN', 'CEO'), getDashboardStats);
router.get('/ai-insights', protect, authorize('ADMIN', 'CEO'), getAIInsights);
router.get('/transactions', protect, authorize('ADMIN', 'CEO'), getTransactions);
router.post('/transactions', protect, authorize('ADMIN', 'CEO'), createTransaction);

module.exports = router;
