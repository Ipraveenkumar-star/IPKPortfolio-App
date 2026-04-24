const express = require('express');
const { getDb } = require('../database/db');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.use(auth(), adminOnly);

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const db = getDb();
  const stats = {
    totalUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE role != 'admin'").get().c,
    activeUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE is_active = 1 AND role != 'admin'").get().c,
    totalCertificates: db.prepare('SELECT COUNT(*) as c FROM certificates').get().c,
    totalProjects: db.prepare('SELECT COUNT(*) as c FROM projects').get().c,
    totalSkills: db.prepare('SELECT COUNT(*) as c FROM skills').get().c,
    recentLogins: db.prepare("SELECT COUNT(*) as c FROM audit_log WHERE action = 'LOGIN' AND created_at > datetime('now', '-7 days')").get().c,
    newUsersThisMonth: db.prepare("SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-30 days')").get().c,
  };
  res.json({ stats });
});

// GET /api/admin/users - full user list
router.get('/users', (req, res) => {
  const db = getDb();
  const { search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  let q = 'SELECT id, username, email, role, display_name, profile_slug, is_active, created_at FROM users';
  const params = [];
  if (search) { q += ' WHERE username LIKE ? OR email LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
  q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(+limit, +offset);
  const users = db.prepare(q).all(...params);
  const total = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  res.json({ users, total });
});

// GET /api/admin/audit
router.get('/audit', (req, res) => {
  const db = getDb();
  const logs = db.prepare(`SELECT al.*, u.username FROM audit_log al LEFT JOIN users u ON u.id = al.user_id ORDER BY al.created_at DESC LIMIT 200`).all();
  res.json({ logs });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// GET /api/admin/certificates - all certificates
router.get('/certificates', (req, res) => {
  const db = getDb();
  const certs = db.prepare('SELECT c.*, u.username FROM certificates c JOIN users u ON u.id = c.user_id ORDER BY c.created_at DESC').all();
  res.json({ certificates: certs });
});

module.exports = router;
