require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/portfolio.db';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existing = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (existing) {
    console.log('⚠️  Admin already exists. Skipping seed.');
    db.close();
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const id = uuidv4();
  const slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, display_name, profile_slug, is_active)
    VALUES (?, ?, ?, ?, 'admin', ?, ?, 1)
  `).run(id, username, email, hash, username, slug);

  db.prepare(`
    INSERT INTO privacy_settings (user_id) VALUES (?)
  `).run(id);

  console.log('✅ Admin created successfully!');
  console.log(`   Username: ${username}`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Profile URL: /u/${slug}`);
  console.log('\n⚠️  IMPORTANT: Change your password after first login!');
  db.close();
}

seedAdmin().catch(console.error);
