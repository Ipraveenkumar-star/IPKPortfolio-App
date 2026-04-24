import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 page-enter">
      <div>
        <div className="font-display font-black text-[10rem] leading-none" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>404</div>
        <h2 className="font-display font-black text-2xl mb-3 -mt-4">Page not found</h2>
        <p className="text-[var(--muted)] mb-8">This page doesn't exist or was moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-6 py-3 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>Go Home</Link>
          <Link to="/explore" className="px-6 py-3 glass text-sm border border-[var(--border)] rounded-lg hover:border-[var(--gold)] transition-colors">Explore</Link>
        </div>
      </div>
    </div>
  )
}
