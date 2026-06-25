const express = require('express');
const router = express.Router();
const { getDailyLogs, createDailyLog, updateDailyLog, toggleLockLog, getProductionStats } = require('../controllers/dailyLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getDailyLogs);
router.post('/', protect, authorize('FACTORY_SUPERVISOR', 'STAFF', 'ADMIN', 'CEO'), createDailyLog);
router.put('/:id', protect, authorize('FACTORY_SUPERVISOR', 'ADMIN', 'CEO'), updateDailyLog);
router.patch('/:id/lock', protect, authorize('FACTORY_SUPERVISOR', 'ADMIN', 'CEO'), toggleLockLog);
router.get('/production-stats', protect, authorize('FACTORY_SUPERVISOR', 'ADMIN', 'CEO'), getProductionStats);

module.exports = router;
