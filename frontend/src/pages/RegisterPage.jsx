import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' })
  const [showPw, setShowPw] = useState(false)
  const [strength, setStrength] = useState(0)
  const { register, isLoading, isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Create Account — PortfolioVault'
    if (isLoggedIn()) navigate('/dashboard')
  }, [])

  const checkStrength = (pw) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    setStrength(s)
  }

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (k === 'password') checkStrength(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !form.displayName)
      return toast.error('Fill in all fields')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    if (strength < 2) return toast.error('Choose a stronger password')

    const result = await register(form.username, form.email, form.password, form.displayName)
    if (result.success) {
      toast.success('Account created! Welcome to PortfolioVault 🎉')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8 page-enter">
      <div className="w-full max-w-md">
        <div className="glass-bright rounded-2xl p-8 border border-[var(--border)]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--plasma)] to-[var(--gold)] flex items-center justify-center text-white font-display font-black text-xl">+</div>
            <h1 className="font-display font-black text-2xl mb-1">Create your vault</h1>
            <p className="text-[var(--muted)] text-sm">Get your unique portfolio profile in 30 seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-1.5">Display Name</label>
              <input type="text" value={form.displayName} onChange={set('displayName')} placeholder="John Doe" className="input-dark w-full px-4 py-3 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-1.5">
                Username <span className="text-[var(--gold)]">· your profile URL</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs font-mono">/u/</span>
                <input type="text" value={form.username} onChange={set('username')} placeholder="yourname" className="input-dark w-full pl-10 pr-4 py-3 rounded-lg text-sm font-mono" />
              </div>
              {form.username && (
                <p className="text-xs text-[var(--muted)] mt-1 font-mono">portfoliovault.app/u/{form.username}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-dark w-full px-4 py-3 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 8 chars, uppercase + number" className="input-dark w-full px-4 py-3 rounded-lg text-sm pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs">{showPw ? 'Hide' : 'Show'}</button>
              </div>
              {form.password && (
                <div className="mt-2 flex gap-1.5 items-center">
                  {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-[var(--mist)]'}`} />)}
                  <span className="text-xs text-[var(--muted)] ml-1 w-10">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 font-display font-bold text-[var(--void)] rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[var(--void)] border-t-transparent rounded-full animate-spin" />
                  Creating vault...
                </span>
              ) : 'Create My Portfolio →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[var(--muted)] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--gold)] hover:text-[var(--gold-light)] font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--muted)] mt-4">Free forever · No credit card · Your data stays yours</p>
      </div>
    </div>
  )
}
