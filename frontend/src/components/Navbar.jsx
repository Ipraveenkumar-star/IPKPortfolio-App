import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isLoggedIn, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3 glass border-b border-[var(--border)]' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--ember)] flex items-center justify-center text-[var(--void)] font-display font-black text-sm">PV</div>
          <span className="font-display font-bold text-lg tracking-wide group-hover:text-[var(--gold)] transition-colors">
            Portfolio<span className="text-[var(--gold)]">Vault</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/explore" active={location.pathname === '/explore'}>Explore</NavLink>
          {isLoggedIn() && <NavLink to="/dashboard" active={location.pathname === '/dashboard'}>Dashboard</NavLink>}
          {isAdmin() && <NavLink to="/admin" active={location.pathname === '/admin'}>Admin</NavLink>}
          {isLoggedIn() && user?.profile_slug && (
            <NavLink to={`/u/${user.profile_slug}`} active={false}>My Profile</NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn() ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--plasma)] to-[var(--gold)] flex items-center justify-center text-xs font-bold text-white">
                  {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-[var(--text)]">{user?.display_name || user?.username}</span>
                {isAdmin() && <span className="badge-admin text-xs px-2 py-0.5 rounded font-mono">ADMIN</span>}
              </div>
              <button onClick={handleLogout} className="text-xs text-[var(--muted)] hover:text-[var(--ember)] transition-colors px-3 py-1.5 border border-[var(--border)] rounded hover:border-[var(--ember)]">
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors px-4 py-2">Sign In</Link>
              <Link to="/register" className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-[var(--gold)] to-[var(--ember)] text-[var(--void)] rounded font-display font-bold hover:opacity-90 transition-opacity">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[var(--text)] p-2">
          <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-5 h-0.5 bg-current my-1 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-[var(--border)] px-4 py-4 flex flex-col gap-3">
          <Link to="/explore" onClick={() => setMobileOpen(false)} className="text-[var(--muted)] hover:text-[var(--gold)] py-2">Explore</Link>
          {isLoggedIn() && <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-[var(--muted)] hover:text-[var(--gold)] py-2">Dashboard</Link>}
          {isAdmin() && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-[var(--muted)] hover:text-[var(--gold)] py-2">Admin Panel</Link>}
          {isLoggedIn() ? (
            <button onClick={handleLogout} className="text-left text-[var(--ember)] py-2">Sign Out</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-[var(--muted)] py-2">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="text-[var(--gold)] py-2 font-bold">Get Started →</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} className={`text-sm transition-colors relative pb-0.5 ${active ? 'text-[var(--gold)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
      {children}
      {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-[var(--gold)]" />}
    </Link>
  )
}
