/**
 * Brevo 邮件发送服务
 * 只需验证邮箱地址即可发送，无需域名验证，每日免费 300 封
 * 文档: https://developers.brevo.com/reference/sendtransacemail
 * SDK: @getbrevo/brevo
 */
const Brevo = require('@getbrevo/brevo');

/**
 * 使用 Brevo API 发送邮件
 * @param {Object} params
 * @param {string} params.brevoApiKey - Brevo API Key (xkeysib-xxxxx)
 * @param {string} params.from - 发件人邮箱
 * @param {string} [params.fromName] - 发件人名称
 * @param {string|Array<{email:string,name?:string}>} params.to - 收件人
 * @param {string} params.subject - 主题
 * @param {string} params.text - 纯文本正文
 * @param {string} [params.html] - HTML 正文
 * @param {Array<{email:string,name?:string}>} [params.cc] - 抄送
 * @param {Array<{email:string,name?:string}>} [params.bcc] - 密送
 * @returns {Promise<{messageId: string}>}
 */
async function sendWithBrevo({
  brevoApiKey,
  from,
  fromName,
  to,
  subject,
  text,
  html,
  cc,
  bcc,
}) {
  const apiClient = new Brevo.TransactionalEmailsApi();
  apiClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.sender = { email: from, name: fromName || '' };
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.textContent = text || '';

  if (html) sendSmtpEmail.htmlContent = html;

  // 标准化收件人格式
  if (typeof to === 'string') {
    sendSmtpEmail.to = [{ email: to }];
  } else if (Array.isArray(to)) {
    sendSmtpEmail.to = to.map(t => (typeof t === 'string' ? { email: t } : t));
  }

  if (cc) {
    sendSmtpEmail.cc = typeof cc === 'string'
      ? [{ email: cc }]
      : cc.map(c => (typeof c === 'string' ? { email: c } : c));
  }

  if (bcc) {
    sendSmtpEmail.bcc = typeof bcc === 'string'
      ? [{ email: bcc }]
      : bcc.map(b => (typeof b === 'string' ? { email: b } : b));
  }

  const response = await apiClient.sendTransacEmail(sendSmtpEmail);

  return {
    messageId: response.body?.messageId || 'sent',
  };
}

module.exports = { sendWithBrevo };