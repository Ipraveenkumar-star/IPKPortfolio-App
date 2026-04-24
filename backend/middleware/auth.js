const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');

function auth(required = true) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      if (required) return res.status(401).json({ error: 'Authentication required' });
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = getDb();
      const user = db.prepare('SELECT id, username, email, role, display_name, avatar_url, profile_slug FROM users WHERE id = ? AND is_active = 1').get(decoded.id);

      if (!user) {
        if (required) return res.status(401).json({ error: 'User not found or deactivated' });
        req.user = null;
        return next();
      }

      req.user = user;
      next();
    } catch (err) {
      if (required) return res.status(401).json({ error: 'Invalid or expired token' });
      req.user = null;
      next();
    }
  };
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

function ownerOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const targetUserId = req.params.userId || req.body.userId;
  if (req.user.role === 'admin' || req.user.id === targetUserId) return next();
  return res.status(403).json({ error: 'Access denied' });
}

module.exports = { auth, adminOnly, ownerOrAdmin };
