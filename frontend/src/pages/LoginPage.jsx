import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login: doLogin, isLoading, isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Sign In — PortfolioVault'
    if (isLoggedIn()) navigate('/dashboard')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!login || !password) return toast.error('Fill in all fields')
    const result = await doLogin(login, password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 page-enter">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-bright rounded-2xl p-8 border border-[var(--border)] glow-gold">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--ember)] flex items-center justify-center text-[var(--void)] font-display font-black text-xl">PV</div>
            <h1 className="font-display font-black text-2xl mb-1">Welcome back</h1>
            <p className="text-[var(--muted)] text-sm">Sign in to your PortfolioVault</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-1.5">Username or Email</label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="yourname or you@email.com"
                className="input-dark w-full px-4 py-3 rounded-lg text-sm"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark w-full px-4 py-3 rounded-lg text-sm pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] text-xs"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 font-display font-bold text-[var(--void)] rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--void)] border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[var(--muted)] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--gold)] hover:text-[var(--gold-light)] font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
