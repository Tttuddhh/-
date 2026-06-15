/**
 * SendGrid 邮件发送服务
 * 只需验证单个邮箱地址即可发送，无需域名验证
 * 文档: https://docs.sendgrid.com/api-reference/mail-send/mail-send
 * 免费额度: 100封/天
 */
const sgMail = require('@sendgrid/mail');

/**
 * 使用 SendGrid API 发送邮件
 * @param {Object} params
 * @param {string} params.sendgridApiKey - SendGrid API Key (SG.xxxxx)
 * @param {string} params.from - 发件人邮箱
 * @param {string|string[]} params.to - 收件人
 * @param {string} params.subject - 主题
 * @param {string} params.text - 纯文本正文
 * @param {string} [params.html] - HTML 正文
 * @param {string|string[]} [params.cc] - 抄送
 * @param {string|string[]} [params.bcc] - 密送
 * @returns {Promise<{messageId: string, statusCode: number}>}
 */
async function sendWithSendGrid({
  sendgridApiKey,
  from,
  to,
  subject,
  text,
  html,
  cc,
  bcc,
}) {
  sgMail.setApiKey(sendgridApiKey);

  const msg = {
    to,
    from,
    subject,
    text: text || '',
  };

  if (html) msg.html = html;
  if (cc) msg.cc = cc;
  if (bcc) msg.bcc = bcc;

  const [response] = await sgMail.send(msg);

  return {
    messageId: response.headers['x-message-id'] || 'sent',
    statusCode: response.statusCode,
  };
}

module.exports = { sendWithSendGrid };