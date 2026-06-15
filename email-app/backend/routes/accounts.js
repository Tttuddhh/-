const express = require('express');
const db = require('../database');

const router = express.Router();

// Ensure password column exists in email_accounts
(function migratePasswordColumn() {
  try {
    const cols = db.prepare("PRAGMA table_info('email_accounts')").all();
    const hasPassword = cols.some(col => col.name === 'password');
    if (!hasPassword) {
      db.exec("ALTER TABLE email_accounts ADD COLUMN password TEXT");
      console.log('Added password column to email_accounts');
    }
  } catch (err) {
    console.error('Migration error for email_accounts password column:', err.message);
  }
})();

// GET /api/accounts - Get all accounts for user
router.get('/', (req, res) => {
  const accounts = db.prepare(
    'SELECT id, user_id, email, name, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure, is_active, created_at FROM email_accounts WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);

  res.json({ accounts });
});

// POST /api/accounts - Add new account
router.post('/', (req, res) => {
  const { email, name, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure, password } = req.body;

  if (!email || !imap_host || !imap_port || !smtp_host || !smtp_port) {
    return res.status(400).json({ error: 'Missing required fields: email, imap_host, imap_port, smtp_host, smtp_port' });
  }

  const result = db.prepare(
    `INSERT INTO email_accounts (user_id, email, name, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure, password, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(
    req.user.id,
    email,
    name || null,
    imap_host,
    imap_port,
    imap_secure !== undefined ? imap_secure : 1,
    smtp_host,
    smtp_port,
    smtp_secure !== undefined ? smtp_secure : 1,
    password || null
  );

  // Set all other accounts to inactive
  db.prepare('UPDATE email_accounts SET is_active = 0 WHERE user_id = ? AND id != ?').run(req.user.id, result.lastInsertRowid);

  const account = db.prepare(
    'SELECT id, user_id, email, name, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure, is_active, created_at FROM email_accounts WHERE id = ?'
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