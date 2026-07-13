const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('ADMIN', 'CEO'), getNotifications);
router.get('/unread-count', protect, authorize('ADMIN', 'CEO'), getUnreadCount);
router.patch('/read-all', protect, authorize('ADMIN', 'CEO'), markAllAsRead);
router.patch('/:id/read', protect, authorize('ADMIN', 'CEO'), markAsRead);

module.exports = router;
