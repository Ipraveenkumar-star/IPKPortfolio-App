// vite.config.ghpages.js
// Use this config when deploying frontend to GitHub Pages
// with backend hosted separately on Render/Railway/etc.
//
// Run: VITE_API_URL=https://your-backend.onrender.com npx vite build --config vite.config.ghpages.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set base to your repo name if deploying to username.github.io/repo-name
  // For custom domain (portfoliovault.app), leave as '/'
  base: process.env.GITHUB_REPO_NAME ? `/${process.env.GITHUB_REPO_NAME}/` : '/',
  define: {
    // Inject API URL at build time from env
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
        }
      }
    }
  }
})
