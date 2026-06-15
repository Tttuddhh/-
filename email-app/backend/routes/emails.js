const express = require('express');
const nodemailer = require('nodemailer');
const db = require('../database');

const router = express.Router();

// Helper: get the active email account for a user
function getActiveAccount(userId) {
  return db.prepare(
    'SELECT * FROM email_accounts WHERE user_id = ? AND is_active = 1'
  ).get(userId);
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

// POST /api/emails/send - Send email
router.post('/send', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  if (!activeAccount.password) {
    return res.status(400).json({ error: 'Account password is required for sending emails.' });
  }

  const { to, subject, body, cc, bcc } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject, and body are required.' });
  }

  const transporter = nodemailer.createTransport({
    host: activeAccount.smtp_host,
    port: activeAccount.smtp_port,
    secure: activeAccount.smtp_secure === 1,
    auth: {
      user: activeAccount.email,
      pass: activeAccount.password
    }
  });

  const mailOptions = {
    from: activeAccount.email,
    to,
    subject,
    text: body,
    cc: cc || undefined,
    bcc: bcc || undefined
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Send email error:', err.message);
      return res.status(500).json({ error: 'Failed to send email: ' + err.message });
    }

    // Save to sent folder
    const result = db.prepare(
      `INSERT INTO emails (account_id, from_address, to_address, subject, body, folder, is_read, received_at)
       VALUES (?, ?, ?, ?, ?, 'sent', 1, datetime('now'))`
    ).run(activeAccount.id, activeAccount.email, to, subject, body);

    const savedEmail = db.prepare('SELECT * FROM emails WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Email sent successfully.', email: savedEmail });
  });
});

// POST /api/emails/:id/reply - Reply to email
router.post('/:id/reply', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  if (!activeAccount.password) {
    return res.status(400).json({ error: 'Account password is required for sending emails.' });
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

  const transporter = nodemailer.createTransport({
    host: activeAccount.smtp_host,
    port: activeAccount.smtp_port,
    secure: activeAccount.smtp_secure === 1,
    auth: {
      user: activeAccount.email,
      pass: activeAccount.password
    }
  });

  const mailOptions = {
    from: activeAccount.email,
    to: originalEmail.from_address,
    subject: replySubject,
    text: body,
    inReplyTo: originalEmail.message_id || undefined,
    references: originalEmail.message_id || undefined
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('Reply email error:', err.message);
      return res.status(500).json({ error: 'Failed to send reply: ' + err.message });
    }

    // Save to sent folder
    const result = db.prepare(
      `INSERT INTO emails (account_id, from_address, to_address, subject, body, folder, is_read, received_at)
       VALUES (?, ?, ?, ?, ?, 'sent', 1, datetime('now'))`
    ).run(activeAccount.id, activeAccount.email, originalEmail.from_address, replySubject, body);

    const savedEmail = db.prepare('SELECT * FROM emails WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Reply sent successfully.', email: savedEmail });
  });
});

// POST /api/emails/:id/forward - Forward email
router.post('/:id/forward', (req, res) => {
  const activeAccount = getActiveAccount(req.user.id);
  if (!activeAccount) {
    return res.status(400).json({ error: 'No active email account configured.' });
  }

  if (!activeAccount.password) {
    return res.status(400).json({ error: 'Account password is required for sending emails.' });
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

  const transporter = nodemailer.createTransport({
    host: activeAccount.smtp_host,
    port: activeAccount.smtp_port,
    secure: activeAccount.smtp_secure === 1,
    auth: {
      user: activeAccount.email,
      pass: activeAccount.password
    }
  });

  const mailOptions = {
    from: activeAccount.email,
    to,
    subject: forwardSubject,
    text: body
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('Forward email error:', err.message);
      return res.status(500).json({ error: 'Failed to forward email: ' + err.message });
    }

    // Save to sent folder
    const result = db.prepare(
      `INSERT INTO emails (account_id, from_address, to_address, subject, body, folder, is_read, received_at)
       VALUES (?, ?, ?, ?, ?, 'sent', 1, datetime('now'))`
    ).run(activeAccount.id, activeAccount.email, to, forwardSubject, body);

    const savedEmail = db.prepare('SELECT * FROM emails WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Email forwarded successfully.', email: savedEmail });
  });
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