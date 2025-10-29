const { Resend } = require('resend')
const config = require('../config/config')
const logger = require('../config/logger')

let resend = null

function initialize() {
  if (config.email.resendApiKey) {
    resend = new Resend(config.email.resendApiKey)
    logger.info('Resend email service initialized')
  } else {
    logger.error('Resend API key missing — please set config.email.resendApiKey')
  }
}

/**
 * Gửi email bằng Resend API
 * @param {string} email - người nhận
 * @param {string} subject - tiêu đề
 * @param {string} html - nội dung HTML
 */
async function send(email, subject, html) {
  if (!resend) {
    logger.error('Resend service not initialized')
    throw new Error('Email service not configured')
  }

  try {
    const result = await resend.emails.send({
      from: config.email.from,  // ví dụ: 'Your App <no-reply@yourdomain.com>'
      to: email,
      subject,
      html
    })

    logger.info(`✅ Email sent to ${email}: ${result.data.id}`)
    return { success: true, messageId: result.data.id }
  } catch (error) {
    logger.error(`❌ Failed to send email to ${email}: ${error.message}`)
    throw error
  }
}

/**
 * Hàm verifyConnection (Resend không cần)
 */
async function verifyConnection() {
  logger.info('Resend uses HTTPS API — no SMTP verification needed')
  return true
}

initialize()

module.exports = {
  send,
  verifyConnection
}
