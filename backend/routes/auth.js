const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

function generateTokens(userId) {
  const access = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  return { access, refresh };
}

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('displayName').trim().isLength({ min: 2, max: 60 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password, displayName } = req.body;
  const db = getDb();

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) return res.status(409).json({ error: 'Username or email already taken' });

    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, display_name, profile_slug)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, username, email, hash, displayName, slug);

    db.prepare('INSERT INTO privacy_settings (user_id) VALUES (?)').run(id);

    const { access, refresh } = generateTokens(id);
    const user = db.prepare('SELECT id, username, email, role, display_name, profile_slug FROM users WHERE id = ?').get(id);

    db.prepare(`INSERT INTO audit_log (id, user_id, action, ip_address) VALUES (?, ?, ?, ?)`)
      .run(uuidv4(), id, 'REGISTER', req.ip);

    res.status(201).json({ token: access, refreshToken: refresh, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('login').trim().notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid input' });

  const { login, password } = req.body;
  const db = getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1').get(login, login);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      db.prepare(`INSERT INTO audit_log (id, user_id, action, ip_address) VALUES (?, ?, ?, ?)`)
        .run(uuidv4(), user.id, 'LOGIN_FAILED', req.ip);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { access, refresh } = generateTokens(user.id);
    db.prepare(`INSERT INTO audit_log (id, user_id, action, ip_address) VALUES (?, ?, ?, ?)`)
      .run(uuidv4(), user.id, 'LOGIN', req.ip);

    const safeUser = { id: user.id, username: user.username, email: user.email, role: user.role, display_name: user.display_name, avatar_url: user.avatar_url, profile_slug: user.profile_slug };
    res.json({ token: access, refreshToken: refresh, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') return res.status(401).json({ error: 'Invalid token type' });

    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE id = ? AND is_active = 1').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const { access, refresh } = generateTokens(decoded.id);
    res.json({ token: access, refreshToken: refresh });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', auth(), (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', auth(), (req, res) => {
  const db = getDb();
  db.prepare(`INSERT INTO audit_log (id, user_id, action, ip_address) VALUES (?, ?, ?, ?)`)
    .run(uuidv4(), req.user.id, 'LOGOUT', req.ip);
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
