const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

let transporter = null;

function initialize() {
  if (config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass, // app password (not real Gmail password)
      },
    });
    logger.info('✅ Gmail SMTP service initialized');
  } else {
    logger.error('❌ Gmail credentials missing — please set config.email.user and config.email.pass');
  }
}

/**
 * Gửi email bằng Gmail SMTP
 * @param {string} email - người nhận
 * @param {string} subject - tiêu đề
 * @param {string} html - nội dung HTML
 */
async function send(email, subject, html) {
  if (!transporter) {
    throw new Error('SMTP transporter not initialized');
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from || `"Your App" <${config.email.user}>`,
      to: email,
      subject,
      html,
    });

    logger.info(`✅ Email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    logger.error(`❌ Failed to send email to ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Kiểm tra kết nối SMTP
 */
async function verifyConnection() {
  if (!transporter) return false;
  try {
    await transporter.verify();
    logger.info('✅ Gmail SMTP connection verified');
    return true;
  } catch (err) {
    logger.error('❌ SMTP verification failed: ' + err.message);
    return false;
  }
}

initialize();

module.exports = { send, verifyConnection };
