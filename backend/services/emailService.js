const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('[Email] Skipped - email credentials not configured');
      return false;
    }

    const transport = getTransporter();
    const mailOptions = {
      from: `"SDK Alkaline Water System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    await transport.sendMail(mailOptions);
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send: ${error.message}`);
    return false;
  }
};

const sendNotificationEmail = async (title, message, activityType) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!adminEmail) return;

  const priorityColors = {
    USER_REGISTERED: '#2563eb',
    USER_LOGIN: '#6b7280',
    TRANSACTION_CREATED: '#059669',
    LOG_CREATED: '#7c3aed',
    LOG_UPDATED: '#d97706',
    LOG_LOCK_TOGGLED: '#dc2626'
  };

  const color = priorityColors[activityType] || '#334155';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600;">SDK Alkaline Water</h1>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">System Notification</p>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="width: 4px; height: 40px; background: ${color}; border-radius: 4px; margin-right: 12px;"></div>
          <div>
            <h2 style="margin: 0; font-size: 16px; color: #0f172a;">${title}</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8; text-transform: uppercase;">${activityType.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <p style="color: #475569; line-height: 1.6; margin: 0;">${message}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
        </p>
      </div>
      <div style="background: #f8fafc; padding: 16px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">SDK Alkaline Water Limited &mdash; Water Management System</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `[SDK Water] ${title}`,
    html
  });
};

module.exports = { sendEmail, sendNotificationEmail };
