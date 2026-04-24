import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './hooks/useAuthStore'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import DirectoryPage from './pages/DirectoryPage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import Navbar from './components/Navbar'
import { AnimatedBackground } from './components/AnimatedBackground'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuthStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

export default function App({ onMount }) {
  const { token, setToken } = useAuthStore()

  useEffect(() => {
    if (token) setToken(token)
    onMount?.()
  }, [])

  return (
    <div className="bg-aurora grain min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<DirectoryPage />} />
          <Route path="/u/:slug" element={<ProfilePage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  )
}
