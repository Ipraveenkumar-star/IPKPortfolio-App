const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../database/db');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR || './uploads', 'avatars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'));
  cb(null, true);
}});

// GET /api/users/directory - public directory of profiles
router.get('/directory', auth(false), (req, res) => {
  const db = getDb();
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT u.id, u.username, u.display_name, u.tagline, u.location, u.avatar_url, u.profile_slug, u.created_at
    FROM users u
    JOIN privacy_settings ps ON ps.user_id = u.id
    WHERE u.is_active = 1 AND u.role != 'admin' AND ps.profile_visible = 1`;
  const params = [];

  if (search) { query += ` AND (u.username LIKE ? OR u.display_name LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
  params.push(+limit, +offset);

  const users = db.prepare(query).all(...params);
  const total = db.prepare(`SELECT COUNT(*) as c FROM users u JOIN privacy_settings ps ON ps.user_id = u.id WHERE u.is_active = 1 AND u.role != 'admin' AND ps.profile_visible = 1`).get().c;

  res.json({ users, total, page: +page, pages: Math.ceil(total / limit) });
});

// GET /api/users/:slug - public profile by slug
router.get('/:slug', auth(false), (req, res) => {
  const db = getDb();
  const user = db.prepare(`SELECT u.*, ps.* FROM users u LEFT JOIN privacy_settings ps ON ps.user_id = u.id WHERE u.profile_slug = ? AND u.is_active = 1`).get(req.params.slug);

  if (!user) return res.status(404).json({ error: 'Profile not found' });

  const isOwner = req.user?.id === user.id || req.user?.role === 'admin';
  const canViewPrivate = isOwner;

  if (!user.profile_visible && !isOwner) return res.status(403).json({ error: 'This profile is private' });

  const profile = {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    tagline: user.tagline,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    profileSlug: user.profile_slug,
    githubUrl: user.github_url,
    linkedinUrl: user.linkedin_url,
    twitterUrl: user.twitter_url,
    website: user.website,
    location: user.show_location || isOwner ? user.location : null,
    email: user.show_email || isOwner ? user.email : null,
    createdAt: user.created_at,
    isOwner,
    privacy: isOwner ? {
      showEmail: !!user.show_email,
      showLocation: !!user.show_location,
      showCertificates: !!user.show_certificates,
      showExperience: !!user.show_experience,
      showProjects: !!user.show_projects,
      showSkills: !!user.show_skills,
      profileVisible: !!user.profile_visible,
      requireLoginToView: !!user.require_login_to_view,
    } : null
  };

  // Skills
  if (user.show_skills || isOwner) {
    profile.skills = db.prepare(`SELECT * FROM skills WHERE user_id = ? ${canViewPrivate ? '' : 'AND is_public = 1'} ORDER BY category, sort_order`).all(user.id);
  }
  // Projects
  if (user.show_projects || isOwner) {
    profile.projects = db.prepare(`SELECT * FROM projects WHERE user_id = ? ${canViewPrivate ? '' : 'AND is_public = 1'} ORDER BY is_featured DESC, sort_order`).all(user.id);
    profile.projects = profile.projects.map(p => ({ ...p, tech_stack: p.tech_stack ? JSON.parse(p.tech_stack) : [] }));
  }
  // Certificates
  if (user.show_certificates || isOwner) {
    profile.certificates = db.prepare(`SELECT * FROM certificates WHERE user_id = ? ${canViewPrivate ? '' : 'AND is_public = 1'} ORDER BY issue_date DESC`).all(user.id);
  }
  // Experience
  if (user.show_experience || isOwner) {
    profile.experiences = db.prepare(`SELECT * FROM experiences WHERE user_id = ? ${canViewPrivate ? '' : 'AND is_public = 1'} ORDER BY sort_order, start_date DESC`).all(user.id);
  }

  res.json({ profile });
});

// PUT /api/users/:slug/profile - update own profile
router.put('/:slug/profile', auth(), (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE profile_slug = ?').get(req.params.slug);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { displayName, bio, tagline, location, website, githubUrl, linkedinUrl, twitterUrl } = req.body;
  db.prepare(`UPDATE users SET display_name=?, bio=?, tagline=?, location=?, website=?, github_url=?, linkedin_url=?, twitter_url=?, updated_at=datetime('now') WHERE id=?`)
    .run(displayName, bio, tagline, location, website, githubUrl, linkedinUrl, twitterUrl, user.id);

  res.json({ message: 'Profile updated' });
});

// PUT /api/users/:slug/privacy - update privacy settings
router.put('/:slug/privacy', auth(), (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE profile_slug = ?').get(req.params.slug);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { showEmail, showLocation, showCertificates, showExperience, showProjects, showSkills, profileVisible, requireLoginToView } = req.body;
  db.prepare(`INSERT INTO privacy_settings (user_id, show_email, show_location, show_certificates, show_experience, show_projects, show_skills, profile_visible, require_login_to_view)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET show_email=excluded.show_email, show_location=excluded.show_location,
    show_certificates=excluded.show_certificates, show_experience=excluded.show_experience,
    show_projects=excluded.show_projects, show_skills=excluded.show_skills,
    profile_visible=excluded.profile_visible, require_login_to_view=excluded.require_login_to_view`)
    .run(user.id, +!!showEmail, +!!showLocation, +!!showCertificates, +!!showExperience, +!!showProjects, +!!showSkills, +!!profileVisible, +!!requireLoginToView);

  res.json({ message: 'Privacy settings updated' });
});

// POST /api/users/:slug/avatar
router.post('/:slug/avatar', auth(), upload.single('avatar'), (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE profile_slug = ?').get(req.params.slug);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, user.id);
  res.json({ avatarUrl });
});

// Admin: GET all users
router.get('/', auth(), adminOnly, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, username, email, role, display_name, profile_slug, is_active, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

// Admin: toggle user active
router.patch('/:id/toggle', auth(), adminOnly, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, is_active FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(user.is_active ? 0 : 1, user.id);
  res.json({ message: `User ${user.is_active ? 'deactivated' : 'activated'}` });
});

module.exports = router;
