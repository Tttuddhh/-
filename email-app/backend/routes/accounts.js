const express = require('express');
const db = require('../database');

const router = express.Router();

// Ensure password & api key columns exist in email_accounts
(function migrateColumns() {
  try {
    const cols = db.prepare("PRAGMA table_info('email_accounts')").all();
    if (!cols.some(col => col.name === 'password')) {
      db.exec("ALTER TABLE email_accounts ADD COLUMN password TEXT");
    }
    if (!cols.some(col => col.name === 'resend_api_key')) {
      db.exec("ALTER TABLE email_accounts ADD COLUMN resend_api_key TEXT");
    }
    if (!cols.some(col => col.name === 'sendgrid_api_key')) {
      db.exec("ALTER TABLE email_accounts ADD COLUMN sendgrid_api_key TEXT");
    }
    if (!cols.some(col => col.name === 'brevo_api_key')) {
      db.exec("ALTER TABLE email_accounts ADD COLUMN brevo_api_key TEXT");
    }
  } catch (err) {
    console.error('Migration error for email_accounts:', err.message);
  }
})();

// GET /api/accounts - Get all accounts for user
router.get('/', (req, res) => {
  const accounts = db.prepare(
    `SELECT id, user_id, email, name, imap_host, imap_port, imap_secure,
            smtp_host, smtp_port, smtp_secure, is_active, created_at,
            CASE WHEN resend_api_key IS NOT NULL AND resend_api_key != '' THEN 1 ELSE 0 END as has_resend,
            CASE WHEN sendgrid_api_key IS NOT NULL AND sendgrid_api_key != '' THEN 1 ELSE 0 END as has_sendgrid,
            CASE WHEN brevo_api_key IS NOT NULL AND brevo_api_key != '' THEN 1 ELSE 0 END as has_brevo
     FROM email_accounts WHERE user_id = ? ORDER BY created_at DESC`
  ).all(req.user.id);

  res.json({ accounts });
});

// POST /api/accounts - Add new account
router.post('/', (req, res) => {
  const { email, name, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure, password, resend_api_key, sendgrid_api_key, brevo_api_key } = req.body;

  if (!email || !imap_host || !imap_port || !smtp_host || !smtp_port) {
    return res.status(400).json({ error: 'Missing required fields: email, imap_host, imap_port, smtp_host, smtp_port' });
  }

  const result = db.prepare(
    `INSERT INTO email_accounts (user_id, email, name, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure, password, resend_api_key, sendgrid_api_key, brevo_api_key, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(
    req.user.id, email,
    name || null,
    imap_host, imap_port, imap_secure !== undefined ? imap_secure : 1,
    smtp_host, smtp_port, smtp_secure !== undefined ? smtp_secure : 1,
    password || null,
    resend_api_key || null,
    sendgrid_api_key || null,
    brevo_api_key || null
  );

  // Set all other accounts to inactive
  db.prepare('UPDATE email_accounts SET is_active = 0 WHERE user_id = ? AND id != ?').run(req.user.id, result.lastInsertRowid);

  const account = db.prepare(
    `SELECT id, user_id, email, name, imap_host, imap_port, imap_secure,
            smtp_host, smtp_port, smtp_secure, is_active, created_at,
            CASE WHEN resend_api_key IS NOT NULL AND resend_api_key != '' THEN 1 ELSE 0 END as has_resend,
            CASE WHEN sendgrid_api_key IS NOT NULL AND sendgrid_api_key != '' THEN 1 ELSE 0 END as has_sendgrid,
            CASE WHEN brevo_api_key IS NOT NULL AND brevo_api_key != '' THEN 1 ELSE 0 END as has_brevo
     FROM email_accounts WHERE id = ?`
  ).get(result.lastInsertRowid);

  res.status(201).json({ account });
});

// DELETE /api/accounts/:id
router.delete('/:id', (req, res) => {
  const account = db.prepare('SELECT * FROM email_accounts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  // Delete associated emails first
  db.prepare('DELETE FROM emails WHERE account_id = ?').run(account.id);
  // Delete the account
  db.prepare('DELETE FROM email_accounts WHERE id = ?').run(account.id);

  res.json({ message: 'Account deleted successfully.' });
});

// PUT /api/accounts/:id/active
router.put('/:id/active', (req, res) => {
  const account = db.prepare('SELECT * FROM email_accounts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

  if (!account) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  // Deactivate all accounts for this user
  db.prepare('UPDATE email_accounts SET is_active = 0 WHERE user_id = ?').run(req.user.id);
  // Activate this account
  db.prepare('UPDATE email_accounts SET is_active = 1 WHERE id = ?').run(account.id);

  const updated = db.prepare(
    'SELECT id, user_id, email, name, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure, is_active, created_at FROM email_accounts WHERE id = ?'
  ).get(account.id);

  res.json({ account: updated });
});

module.exports = router;