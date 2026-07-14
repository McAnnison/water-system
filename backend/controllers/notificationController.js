const prisma = require('../lib/prisma');

// @desc    Get all notifications
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { isRead: false }
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
