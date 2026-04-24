const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/portfolio.db';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);

function migrate() {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin','user')),
      display_name TEXT,
      bio TEXT,
      tagline TEXT,
      location TEXT,
      website TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      twitter_url TEXT,
      avatar_url TEXT,
      profile_slug TEXT UNIQUE,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Profile sections with privacy
    CREATE TABLE IF NOT EXISTS profile_sections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      section_type TEXT NOT NULL,
      title TEXT,
      content TEXT,
      metadata TEXT,
      is_public INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Skills
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      proficiency INTEGER DEFAULT 50 CHECK(proficiency BETWEEN 0 AND 100),
      is_public INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    -- Projects
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      tech_stack TEXT,
      live_url TEXT,
      github_url TEXT,
      image_url TEXT,
      category TEXT DEFAULT 'web',
      is_public INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Certificates / Documents
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      issuer TEXT,
      issue_date TEXT,
      expiry_date TEXT,
      credential_id TEXT,
      verify_url TEXT,
      file_url TEXT,
      file_type TEXT,
      description TEXT,
      is_public INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Experience / Timeline
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      organization TEXT,
      type TEXT DEFAULT 'work' CHECK(type IN ('work','education','achievement')),
      start_date TEXT,
      end_date TEXT,
      is_current INTEGER DEFAULT 0,
      description TEXT,
      is_public INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    -- Privacy settings per user
    CREATE TABLE IF NOT EXISTS privacy_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      show_email INTEGER DEFAULT 0,
      show_phone INTEGER DEFAULT 0,
      show_location INTEGER DEFAULT 1,
      show_certificates INTEGER DEFAULT 1,
      show_experience INTEGER DEFAULT 1,
      show_projects INTEGER DEFAULT 1,
      show_skills INTEGER DEFAULT 1,
      profile_visible INTEGER DEFAULT 1,
      require_login_to_view INTEGER DEFAULT 0
    );

    -- Sessions / tokens
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Social likes / endorsements
    CREATE TABLE IF NOT EXISTS endorsements (
      id TEXT PRIMARY KEY,
      from_user_id TEXT REFERENCES users(id),
      to_user_id TEXT NOT NULL REFERENCES users(id),
      skill_id TEXT REFERENCES skills(id),
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_slug ON users(profile_slug);
    CREATE INDEX IF NOT EXISTS idx_certs_user ON certificates(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_skills_user ON skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_exp_user ON experiences(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
  `);

  console.log('✅ Database migration complete');
}

migrate();
db.close();
module.exports = { migrate };
