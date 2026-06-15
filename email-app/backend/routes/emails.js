const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../database');
const { sendWithBrevo } = require('../services/brevo');
const { sendWithSendGrid } = require('../services/sendgrid');
const { sendWithResend } = require('../services/resend');

const router = express.Router();

// Helper: get the active email account for a user (including resend_api_key)
function getActiveAccount(userId) {
  return db.prepare(
    'SELECT * FROM email_accounts WHERE user_id = ? AND is_active = 1'
  ).get(userId);
}

/**
 * 统一发送邮件：Brevo → SendGrid → Resend → SMTP 四级回退
 * Brevo:    只需验证邮箱地址，无需域名 (300封/天免费)  ⬅ 推荐
 * SendGrid: 只需验证单个邮箱 (100封/天免费)
 * Resend:   需验证域名 DNS
 * SMTP:     需邮箱密码/授权码
 */
async function sendEmail(account, { to, subject, body, cc, bcc, replyTo, inReplyTo, references }) {
  const from = account.email;
  const fromName = account.name || '';

  // 第一优先：Brevo（最简单，无需域名，300封/天）
  if (account.brevo_api_key) {
    try {
      const result = await sendWithBrevo({
        brevoApiKey: account.brevo_api_key,
        from,
        fromName,
        to,
        subject,
        text: body,
        cc,
        bcc,
      });
      return { provider: 'brevo', messageId: result.messageId };
    } catch (brevoErr) {
      console.warn('Brevo 发送失败，回退到 SendGrid:', brevoErr.message);
    }
  }

  // 第二优先：SendGrid
  if (account.sendgrid_api_key) {
    try {
      const result = await sendWithSendGrid({
        sendgridApiKey: account.sendgrid_api_key,
        from: account.email,
        to,
        subject,
        text: body,
        cc,
        bcc,
      });
      return { provider: 'sendgrid', messageId: result.messageId };
    } catch (sgErr) {
      console.warn('SendGrid 发送失败，回退到 Resend:', sgErr.message);
    }
  }

  // 第三优先：Resend（需域名验证）
  if (account.resend_api_key) {
    try {
      const resendFrom = account.name
        ? `${account.name} <${account.email}>`
        : account.email;
      const result = await sendWithResend({
        resendApiKey: account.resend_api_key,
        from: resendFrom,
        to,
        subject,
        text: body,
        cc,
        bcc,
        replyTo,
      });
      return { provider: 'resend', messageId: result.id };
    } catch (resendErr) {
      console.warn('Resend 发送失败，回退到 SMTP:', resendErr.message);
    }
  }

  // SMTP 回退
  if (!account.password) {
    throw new Error('未配置 Resend API Key，且账户密码为空，无法发送邮件');
  }

  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: account.smtp_host,
      port: account.smtp_port,
      secure: account.smtp_secure === 1,
      auth: {
        user: account.email,
        pass: account.password,
      },
    });

    const mailOptions = {
      from: account.email,
      to,
      subject,
      text: body,
      cc: cc || undefined,
      bcc: bcc || undefined,
      replyTo: replyTo || undefined,
      inReplyTo: inReplyTo || undefined,
      references: references || undefined,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(new Error('SMTP 发送失败: ' + err.message));
      } else {
        resolve({ provider: 'smtp', messageId: info.messageId });
      }
    });
  });
}

/**
 * 保存已发送邮件到数据库
 */
function saveSentEmail(account, { to, subject, body }) {
  const result = db.prepare(
    `INSERT INTO emails (account_id, from_address, to_address, subject, body, folder, is_read, received_at)
     VALUES (?, ?, ?, ?, ?, 'sent', 1, datetime('now'))`
  ).run(account.id, account.email, to, subject, body);

  return db.prepare('SELECT * FROM emails WHERE id = ?').get(result.lastInsertRowid);
}

// GET /api/emails/search - Search emails (MUST be before /:id)
router.get('/search', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query parameter ?q= is required.' });
  }

  const keyword = `%${q}%`;
  const emails = db.prepare(
    `SELECT * FROM emails
     WHERE account_id = ? AND folder != 'trash'
     AND (subject LIKE ? OR body LIKE ?)
     ORDER BY received_at DESC`
  ).all(activeAccount.id, keyword, keyword);

  res.json({ emails, total: emails.length });
});

// GET /api/emails - List emails
router.get('/', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const folder = req.query.folder || 'inbox';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const countRow = db.prepare(
    'SELECT COUNT(*) as total FROM emails WHERE account_id = ? AND folder = ?'
  ).get(activeAccount.id, folder);

  const total = countRow.total;
  const totalPages = Math.ceil(total / limit);

  const emails = db.prepare(
    `SELECT * FROM emails
     WHERE account_id = ? AND folder = ?
     ORDER BY received_at DESC
     LIMIT ? OFFSET ?`
  ).all(activeAccount.id, folder, limit, offset);

  res.json({ emails, total, page, totalPages });
});

// GET /api/emails/:id - Get single email
router.get('/:id', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const email = db.prepare(
    'SELECT * FROM emails WHERE id = ? AND account_id = ?'
  ).get(req.params.id, activeAccount.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  // Mark as read
  db.prepare('UPDATE emails SET is_read = 1 WHERE id = ?').run(email.id);
  email.is_read = 1;

  res.json({ email });
});

// PUT /api/emails/:id/read - Toggle read status
router.put('/:id/read', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const email = db.prepare(
    'SELECT * FROM emails WHERE id = ? AND account_id = ?'
  ).get(req.params.id, activeAccount.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  const { is_read } = req.body;
  if (is_read !== 0 && is_read !== 1) {
    return res.status(400).json({ error: 'is_read must be 0 or 1.' });
  }

  db.prepare('UPDATE emails SET is_read = ? WHERE id = ?').run(is_read, email.id);

  const updated = db.prepare('SELECT * FROM emails WHERE id = ?').get(email.id);
  res.json({ email: updated });
});

// POST /api/emails/send - Send email (Resend 优先, SMTP 回退)
router.post('/send', async (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const { to, subject, body, cc, bcc } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject, and body are required.' });
  }

  try {
    const result = await sendEmail(activeAccount, { to, subject, body, cc, bcc });
    const savedEmail = saveSentEmail(activeAccount, { to, subject, body });
    res.status(201).json({
      message: '邮件发送成功',
      provider: result.provider,
      email: savedEmail,
    });
  } catch (err) {
    console.error('发送邮件失败:', err.message);
    res.status(500).json({ error: '发送邮件失败: ' + err.message });
  }
});

// POST /api/emails/:id/reply - Reply to email (Resend 优先, SMTP 回退)
router.post('/:id/reply', async (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const originalEmail = db.prepare(
    'SELECT * FROM emails WHERE id = ? AND account_id = ?'
  ).get(req.params.id, activeAccount.id);

  if (!originalEmail) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  const { body } = req.body;
  if (!body) {
    return res.status(400).json({ error: 'body is required.' });
  }

  const replySubject = originalEmail.subject && !originalEmail.subject.startsWith('Re: ')
    ? `Re: ${originalEmail.subject}`
    : originalEmail.subject;

  try {
    const result = await sendEmail(activeAccount, {
      to: originalEmail.from_address,
      subject: replySubject,
      body,
    });

    const savedEmail = saveSentEmail(activeAccount, {
      to: originalEmail.from_address,
      subject: replySubject,
      body,
    });

    res.status(201).json({
      message: '回复发送成功',
      provider: result.provider,
      email: savedEmail,
    });
  } catch (err) {
    console.error('回复发送失败:', err.message);
    res.status(500).json({ error: '回复发送失败: ' + err.message });
  }
});

// POST /api/emails/:id/forward - Forward email (Resend 优先, SMTP 回退)
router.post('/:id/forward', async (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const originalEmail = db.prepare(
    'SELECT * FROM emails WHERE id = ? AND account_id = ?'
  ).get(req.params.id, activeAccount.id);

  if (!originalEmail) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  const { to, body } = req.body;
  if (!to || !body) {
    return res.status(400).json({ error: 'to and body are required.' });
  }

  const forwardSubject = originalEmail.subject && !originalEmail.subject.startsWith('Fwd: ')
    ? `Fwd: ${originalEmail.subject}`
    : originalEmail.subject;

  try {
    const result = await sendEmail(activeAccount, {
      to,
      subject: forwardSubject,
      body,
    });

    const savedEmail = saveSentEmail(activeAccount, {
      to,
      subject: forwardSubject,
      body,
    });

    res.status(201).json({
      message: '转发发送成功',
      provider: result.provider,
      email: savedEmail,
    });
  } catch (err) {
    console.error('转发发送失败:', err.message);
    res.status(500).json({ error: '转发发送失败: ' + err.message });
  }
});

// DELETE /api/emails/:id - Move to trash
router.delete('/:id', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  const email = db.prepare(
    'SELECT * FROM emails WHERE id = ? AND account_id = ?'
  ).get(req.params.id, activeAccount.id);

  if (!email) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  db.prepare("UPDATE emails SET folder = 'trash' WHERE id = ?").run(email.id);

  const updated = db.prepare('SELECT * FROM emails WHERE id = ?').get(email.id);
  res.json({ email: updated });
});

module.exports = router;