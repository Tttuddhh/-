/**
 * Resend 邮件发送服务
 * 封装 Resend API，提供与 nodemailer 兼容的接口
 * 文档: https://resend.com/docs/send-with-nodejs
 */
const { Resend } = require('resend');

/**
 * 使用 Resend API 发送邮件
 * @param {Object} params
 * @param {string} params.resendApiKey - Resend API Key (re_xxxxx)
 * @param {string} params.from - 发件人地址，格式: "Name <user@domain.com>"
 * @param {string|string[]} params.to - 收件人地址
 * @param {string} params.subject - 邮件主题
 * @param {string} params.text - 纯文本正文
 * @param {string} [params.html] - HTML 正文
 * @param {string|string[]} [params.cc] - 抄送
 * @param {string|string[]} [params.bcc] - 密送
 * @param {string|string[]} [params.replyTo] - 回复地址
 * @returns {Promise<{id: string}>} Resend 返回的邮件 ID
 */
async function sendWithResend({
  resendApiKey,
  from,
  to,
  subject,
  text,
  html,
  cc,
  bcc,
  replyTo,
}) {
  const resend = new Resend(resendApiKey);

  const payload = {
    from,
    to,
    subject,
    text: text || '',
  };

  if (html) payload.html = html;
  if (cc) payload.cc = cc;
  if (bcc) payload.bcc = bcc;
  if (replyTo) payload.reply_to = replyTo;

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(`Resend 发送失败: ${error.message}`);
  }

  return data;
}

module.exports = { sendWithResend };