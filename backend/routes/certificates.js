const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../database/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR || './uploads', 'certificates', req.user.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uuidv4()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only PDF and images allowed'));
    cb(null, true);
  }
});

// GET /api/certificates/:userId - get user's certificates
router.get('/:userId', auth(false), (req, res) => {
  const db = getDb();
  const { userId } = req.params;
  const isOwner = req.user?.id === userId || req.user?.role === 'admin';

  const certs = db.prepare(`SELECT * FROM certificates WHERE user_id = ? ${isOwner ? '' : 'AND is_public = 1'} ORDER BY issue_date DESC`).all(userId);
  res.json({ certificates: certs });
});

// POST /api/certificates - upload new certificate
router.post('/', auth(), upload.single('file'), (req, res) => {
  const db = getDb();
  const { title, issuer, issueDate, expiryDate, credentialId, verifyUrl, description, isPublic } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuidv4();
  const fileUrl = req.file ? `/uploads/certificates/${req.user.id}/${req.file.filename}` : null;
  const fileType = req.file?.mimetype || null;

  db.prepare(`INSERT INTO certificates (id, user_id, title, issuer, issue_date, expiry_date, credential_id, verify_url, file_url, file_type, description, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, req.user.id, title, issuer, issueDate, expiryDate, credentialId, verifyUrl, fileUrl, fileType, description, isPublic === 'false' ? 0 : 1);

  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id);
  res.status(201).json({ certificate: cert });
});

// PUT /api/certificates/:id - update certificate
router.put('/:id', auth(), (req, res) => {
  const db = getDb();
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(req.params.id);
  if (!cert) return res.status(404).json({ error: 'Not found' });
  if (cert.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { title, issuer, issueDate, expiryDate, credentialId, verifyUrl, description, isPublic } = req.body;
  db.prepare(`UPDATE certificates SET title=?, issuer=?, issue_date=?, expiry_date=?, credential_id=?, verify_url=?, description=?, is_public=?, updated_at=datetime('now') WHERE id=?`)
    .run(title, issuer, issueDate, expiryDate, credentialId, verifyUrl, description, isPublic ? 1 : 0, req.params.id);

  res.json({ certificate: db.prepare('SELECT * FROM certificates WHERE id = ?').get(req.params.id) });
});

// DELETE /api/certificates/:id
router.delete('/:id', auth(), (req, res) => {
  const db = getDb();
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(req.params.id);
  if (!cert) return res.status(404).json({ error: 'Not found' });
  if (cert.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  if (cert.file_url) {
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', cert.file_url.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM certificates WHERE id = ?').run(req.params.id);
  res.json({ message: 'Certificate deleted' });
});

// PATCH /api/certificates/:id/privacy - toggle public/private
router.patch('/:id/privacy', auth(), (req, res) => {
  const db = getDb();
  const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(req.params.id);
  if (!cert) return res.status(404).json({ error: 'Not found' });
  if (cert.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  db.prepare('UPDATE certificates SET is_public = ? WHERE id = ?').run(cert.is_public ? 0 : 1, req.params.id);
  res.json({ isPublic: !cert.is_public });
});

module.exports = router;
