const prisma = require('../lib/prisma');
const { sendNotificationEmail } = require('./emailService');

const notifyAdmin = async (title, message, activityType, userId = null) => {
  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        type: activityType,
        userId
      }
    });

    sendNotificationEmail(title, message, activityType).catch(err => {
      console.error('[NotificationService] Email send failed:', err.message);
    });
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
  }
};

module.exports = { notifyAdmin };
