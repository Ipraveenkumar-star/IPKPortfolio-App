const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// ===== PROJECTS =====
router.get('/projects/:userId', auth(false), (req, res) => {
  const db = getDb();
  const isOwner = req.user?.id === req.params.userId || req.user?.role === 'admin';
  const projects = db.prepare(`SELECT * FROM projects WHERE user_id = ? ${isOwner ? '' : 'AND is_public = 1'} ORDER BY is_featured DESC, sort_order`).all(req.params.userId);
  res.json({ projects: projects.map(p => ({ ...p, tech_stack: p.tech_stack ? JSON.parse(p.tech_stack) : [] })) });
});

router.post('/projects', auth(), (req, res) => {
  const db = getDb();
  const { title, description, techStack, liveUrl, githubUrl, imageUrl, category, isPublic, isFeatured } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO projects (id, user_id, title, description, tech_stack, live_url, github_url, image_url, category, is_public, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.user.id, title, description, JSON.stringify(techStack || []), liveUrl, githubUrl, imageUrl, category || 'web', isPublic !== false ? 1 : 0, isFeatured ? 1 : 0);
  res.status(201).json({ project: db.prepare('SELECT * FROM projects WHERE id = ?').get(id) });
});

router.put('/projects/:id', auth(), (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (project.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { title, description, techStack, liveUrl, githubUrl, imageUrl, category, isPublic, isFeatured } = req.body;
  db.prepare(`UPDATE projects SET title=?, description=?, tech_stack=?, live_url=?, github_url=?, image_url=?, category=?, is_public=?, is_featured=?, updated_at=datetime('now') WHERE id=?`)
    .run(title, description, JSON.stringify(techStack || []), liveUrl, githubUrl, imageUrl, category, isPublic ? 1 : 0, isFeatured ? 1 : 0, req.params.id);
  res.json({ project: db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) });
});

router.delete('/projects/:id', auth(), (req, res) => {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (project.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ===== SKILLS =====
router.get('/skills/:userId', auth(false), (req, res) => {
  const db = getDb();
  const isOwner = req.user?.id === req.params.userId || req.user?.role === 'admin';
  const skills = db.prepare(`SELECT * FROM skills WHERE user_id = ? ${isOwner ? '' : 'AND is_public = 1'} ORDER BY category, sort_order`).all(req.params.userId);
  res.json({ skills });
});

router.post('/skills', auth(), (req, res) => {
  const db = getDb();
  const { name, category, proficiency, isPublic } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
  const id = uuidv4();
  db.prepare('INSERT INTO skills (id, user_id, name, category, proficiency, is_public) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, name, category, proficiency || 50, isPublic !== false ? 1 : 0);
  res.status(201).json({ skill: db.prepare('SELECT * FROM skills WHERE id = ?').get(id) });
});

router.put('/skills/:id', auth(), (req, res) => {
  const db = getDb();
  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Not found' });
  if (skill.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, category, proficiency, isPublic } = req.body;
  db.prepare('UPDATE skills SET name=?, category=?, proficiency=?, is_public=? WHERE id=?')
    .run(name, category, proficiency, isPublic ? 1 : 0, req.params.id);
  res.json({ skill: db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id) });
});

router.delete('/skills/:id', auth(), (req, res) => {
  const db = getDb();
  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Not found' });
  if (skill.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ===== EXPERIENCE =====
router.get('/experience/:userId', auth(false), (req, res) => {
  const db = getDb();
  const isOwner = req.user?.id === req.params.userId || req.user?.role === 'admin';
  const exp = db.prepare(`SELECT * FROM experiences WHERE user_id = ? ${isOwner ? '' : 'AND is_public = 1'} ORDER BY sort_order, start_date DESC`).all(req.params.userId);
  res.json({ experiences: exp });
});

router.post('/experience', auth(), (req, res) => {
  const db = getDb();
  const { title, organization, type, startDate, endDate, isCurrent, description, isPublic } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const id = uuidv4();
  db.prepare('INSERT INTO experiences (id, user_id, title, organization, type, start_date, end_date, is_current, description, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, title, organization, type || 'work', startDate, endDate, isCurrent ? 1 : 0, description, isPublic !== false ? 1 : 0);
  res.status(201).json({ experience: db.prepare('SELECT * FROM experiences WHERE id = ?').get(id) });
});

router.put('/experience/:id', auth(), (req, res) => {
  const db = getDb();
  const exp = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
  if (!exp) return res.status(404).json({ error: 'Not found' });
  if (exp.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { title, organization, type, startDate, endDate, isCurrent, description, isPublic } = req.body;
  db.prepare('UPDATE experiences SET title=?, organization=?, type=?, start_date=?, end_date=?, is_current=?, description=?, is_public=? WHERE id=?')
    .run(title, organization, type, startDate, endDate, isCurrent ? 1 : 0, description, isPublic ? 1 : 0, req.params.id);
  res.json({ experience: db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id) });
});

router.delete('/experience/:id', auth(), (req, res) => {
  const db = getDb();
  const exp = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
  if (!exp) return res.status(404).json({ error: 'Not found' });
  if (exp.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
