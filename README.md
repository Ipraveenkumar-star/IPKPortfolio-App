# 🔐 PortfolioVault

> A secure, GitHub-style portfolio platform where users can showcase skills, upload certificates, and control exactly what the world sees — all behind a unique shareable link.

![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20SQLite-gold)
![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%2B%20Render-blue)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Secure Auth** | JWT access + refresh tokens, bcrypt passwords, rate limiting |
| 👑 **Single Admin** | Only you (admin) can manage users, view audit logs, platform stats |
| 👁️ **Public Profiles** | GitHub-style `/u/username` URL anyone can view |
| 🔒 **Privacy Controls** | Per-section visibility: skills, certs, experience, contact info |
| 📜 **Certificate Upload** | Upload PDFs/images, store securely, share with a link |
| 🌐 **Universal Link** | One portable URL that works everywhere |
| 🎨 **Motion Background** | Animated particle canvas + aurora blobs |
| 📊 **Admin Dashboard** | User management, audit log, platform statistics |
| 💾 **SQLite Database** | Zero-config, portable, persistent storage |
| 🚀 **Free Deployment** | GitHub Pages (frontend) + Render (backend) |

---

## 🏗️ Tech Stack

```
Frontend:  React 18 + Vite + Tailwind CSS + Framer Motion + Zustand + React Query
Backend:   Node.js + Express + better-sqlite3
Database:  SQLite (via better-sqlite3) — upgradeable to PostgreSQL
Auth:      JWT (access + refresh tokens) + bcrypt
Deploy:    GitHub Pages (static) + Render.com (backend API)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/portfoliovault.git
cd portfoliovault
npm run install:all
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
JWT_SECRET=your_very_long_random_secret_here_at_least_64_characters
ADMIN_USERNAME=admin
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourStrongPassword123!
CORS_ORIGIN=http://localhost:3000
```

### 3. Initialize Database & Admin
```bash
cd backend
npm run migrate      # Creates all tables
npm run seed:admin   # Creates your admin account
```

### 4. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

### 5. Login
Go to `http://localhost:3000/login` and use:
- Username: `admin` (or whatever you set in .env)
- Password: your `ADMIN_PASSWORD`

⚠️ **Change your password immediately after first login!**

---

## 🌐 Deployment Option 1: GitHub Pages + Render (Recommended — FREE)

This splits frontend (static) → GitHub Pages and backend (API) → Render free tier.

### Step A: Deploy Backend to Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. Set these in Render dashboard:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add Environment Variables in Render:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate a 64+ char random string>
   ADMIN_USERNAME=admin
   ADMIN_EMAIL=your@email.com
   ADMIN_PASSWORD=YourStrongPassword123!
   CORS_ORIGIN=https://YOUR_USERNAME.github.io
   DB_PATH=/var/data/portfolio.db
   UPLOAD_DIR=/var/data/uploads
   ```
5. Add a **Disk** in Render: mount at `/var/data`, 1GB
6. Deploy → wait for `https://portfoliovault-api.onrender.com`
7. After deploy, SSH into Render shell and run:
   ```bash
   node database/migrate.js
   node database/seedAdmin.js
   ```

### Step B: Deploy Frontend to GitHub Pages

1. In your repo → Settings → Pages → Source: GitHub Actions

2. Add GitHub Secrets (Settings → Secrets → Actions):
   ```
   VITE_API_URL=https://portfoliovault-api.onrender.com
   RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxxx?key=xxxx
   ```

3. Push to `main` branch — the GitHub Action builds and deploys automatically.

4. Your app is live at: `https://YOUR_USERNAME.github.io/portfoliovault/`

> **Custom Domain:** Add your domain as `CUSTOM_DOMAIN` secret and point DNS to GitHub Pages.

---

## 🌐 Deployment Option 2: Railway (Full-stack, one platform)

Railway.app can host both frontend and backend with a single DB.

### Steps:
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Add a service for **backend** folder
3. Add a **Volume** and mount to `/var/data`
4. Set environment variables same as above
5. For frontend: either build and serve from Express, or deploy separately
6. Railway gives you a `*.up.railway.app` URL

---

## 📁 Project Structure

```
portfoliovault/
├── backend/
│   ├── database/
│   │   ├── db.js           # SQLite connection
│   │   ├── migrate.js      # Table creation
│   │   └── seedAdmin.js    # Admin account setup
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── routes/
│   │   ├── auth.js         # Login, register, refresh
│   │   ├── users.js        # Profiles, privacy, avatars
│   │   ├── certificates.js # Upload, manage certs
│   │   ├── portfolio.js    # Skills, projects, experience
│   │   └── admin.js        # Admin-only routes
│   ├── uploads/            # User uploaded files (gitignored)
│   ├── .env.example
│   └── server.js           # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedBackground.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivacyPanel.jsx
│   │   │   └── CertModal.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx    # Public /u/:slug
│   │   │   ├── DashboardPage.jsx  # Edit everything
│   │   │   ├── AdminPage.jsx      # Admin only
│   │   │   └── DirectoryPage.jsx  # Explore profiles
│   │   ├── hooks/
│   │   │   └── useAuthStore.js    # Zustand auth state
│   │   ├── utils/
│   │   │   └── api.js             # Axios with interceptors
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .github/workflows/deploy.yml
├── render.yaml
└── README.md
```

---

## 🔐 Security Features

- **JWT + Refresh Tokens** — 15min access tokens, 30-day refresh
- **bcrypt (12 rounds)** — Password hashing
- **Rate Limiting** — 200 req/15min global, 20 req/15min on auth routes
- **Helmet.js** — Security headers (CSP, XSS, etc.)
- **Input Validation** — express-validator on all inputs
- **Audit Log** — Every login, logout, failed attempt logged with IP
- **Role-based Access** — admin vs user, owner checks on all mutations
- **File Type Validation** — Only PDF/images accepted for uploads

---

## 👑 Admin vs User Capabilities

| Action | Admin | User |
|---|---|---|
| View all public profiles | ✅ | ✅ |
| View own private sections | ✅ | ✅ own |
| Edit own profile | ✅ | ✅ |
| Upload certificates | ✅ | ✅ |
| Manage other users' data | ✅ | ❌ |
| View audit logs | ✅ | ❌ |
| Deactivate/delete users | ✅ | ❌ |
| View platform stats | ✅ | ❌ |
| Change any profile's privacy | ✅ | ❌ |

---

## 🔗 Shareable Links

Every user gets two types of links:

```
Public profile:  https://yourdomain.com/u/username
                 (shows only public sections)

Full profile:    https://yourdomain.com/u/username
                 (shows all sections if you're logged in as owner)
```

Share the public link on:
- LinkedIn profile
- Resume / CV
- Email signature
- Business card
- Twitter/X bio

---

## 🗄️ Database Schema

```sql
users              → profiles, credentials, social links
privacy_settings   → per-user visibility controls
skills             → skill bars with categories
projects           → portfolio items with tech stack
certificates       → uploaded certs with file storage
experiences        → work/education timeline
audit_log          → security event log
refresh_tokens     → JWT refresh token store
endorsements       → peer skill endorsements (future)
```

---

## 🛠️ Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Min 64-char random string |
| `ADMIN_USERNAME` | ✅ | Your admin username |
| `ADMIN_EMAIL` | ✅ | Your admin email |
| `ADMIN_PASSWORD` | ✅ | Strong password (8+ chars, upper+number) |
| `CORS_ORIGIN` | ✅ | Frontend URL (e.g. `https://yourname.github.io`) |
| `PORT` | ❌ | Default: 5000 |
| `DB_PATH` | ❌ | Default: `./database/portfolio.db` |
| `UPLOAD_DIR` | ❌ | Default: `./uploads` |
| `MAX_FILE_SIZE_MB` | ❌ | Default: 10 |

---

## 📝 License

MIT — free to use, modify, deploy for personal and commercial use.

---

*Built with React + Node.js + SQLite. Designed to be portable, self-hosted, and fully under your control.*
#   I P K P o r t f o l i o - A p p  
 