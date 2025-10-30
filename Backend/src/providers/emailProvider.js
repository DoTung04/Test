const { Resend } = require('resend')
const config = require('../config/config')
const logger = require('../config/logger')

let resend = null

function initialize() {
  if (config.email.resendApiKey) {
    resend = new Resend(config.email.resendApiKey)
    logger.info('✅ Resend email service initialized')
  } else {
    logger.error('❌ Resend API key missing — please set config.email.resendApiKey')
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
    logger.error('❌ Resend service not initialized')
    throw new Error('Email service not configured')
  }

  try {
    const { data, error } = await resend.emails.send({
      from: config.email.from || 'Your App <onboarding@resend.dev>', // ✅ fallback an toàn
      to: email,
      subject,
      html
    })

    if (error) {
      logger.error(`❌ Failed to send email to ${email}: ${error.message}`)
      return { success: false, error: error.message }
    }

    logger.info(`✅ Email sent to ${email}: ${data.id}`)
    return { success: true, messageId: data.id }

  } catch (err) {
    logger.error(`🔥 Unexpected error sending email: ${err.stack}`)
    return { success: false, error: err.message }
  }
}

/**
 * Resend không cần verify SMTP, nhưng ta log cho rõ
 */
async function verifyConnection() {
  logger.info('ℹ️ Resend uses HTTPS API — no SMTP verification needed')
  return true
}

initialize()

module.exports = {
  send,
  verifyConnection
}
