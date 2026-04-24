import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'

export default function LandingPage() {
  const { isLoggedIn } = useAuthStore()
  const heroRef = useRef(null)

  useEffect(() => {
    document.title = 'PortfolioVault — Your Secure Digital Identity'
    // Reveal on scroll
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main className="page-enter">
      {/* Hero */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs mb-8 text-[var(--muted)] border border-[var(--border)]">
          <span className="pulse-dot" />
          <span>Platform Live — Join thousands of professionals</span>
        </div>

        <h1 className="font-display font-black text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] tracking-tight mb-6 max-w-4xl">
          <span className="block text-[var(--text)]">Your Skills.</span>
          <span className="block" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember), var(--plasma))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Your Story.
          </span>
          <span className="block text-[var(--text)]">Your Vault.</span>
        </h1>

        <p className="text-[var(--muted)] text-lg max-w-xl mb-10 leading-relaxed font-light">
          A secure, GitHub-style platform to showcase your portfolio, upload certificates, and control exactly what the world sees — all behind your own shareable link.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-16">
          {isLoggedIn() ? (
            <Link to="/dashboard" className="px-8 py-3.5 font-display font-bold text-[var(--void)] rounded-md text-sm tracking-wide" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="px-8 py-3.5 font-display font-bold text-[var(--void)] rounded-md text-sm tracking-wide hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
                Create Free Account
              </Link>
              <Link to="/explore" className="px-8 py-3.5 glass font-display font-bold text-[var(--text)] rounded-md text-sm tracking-wide hover:border-[var(--gold)] transition-colors border border-[var(--border)]">
                Explore Profiles
              </Link>
            </>
          )}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center text-xs text-[var(--muted)]">
          {['🔒 End-to-end privacy control', '📜 Upload certificates & docs', '🌐 Universal shareable link', '👥 Public + private sections', '⚡ GitHub Pages compatible', '🛡️ Admin-only platform management'].map(f => (
            <span key={f} className="px-3 py-1 glass rounded-full border border-[var(--border)]">{f}</span>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[var(--muted)] text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <div className="text-xs tracking-widest text-[var(--gold)] uppercase mb-3 font-mono">Platform Features</div>
            <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)]">Built for professionals,<br />secured for you.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="reveal glass rounded-xl p-6 border-animated group hover:glow-gold transition-all duration-300" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs tracking-widest text-[var(--gold)] uppercase mb-3 font-mono reveal">How It Works</div>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3rem)] mb-12 reveal">Three steps to your<br />perfect portfolio</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Create Account', desc: 'Register in seconds. You get a unique profile link instantly.' },
              { n: '02', title: 'Build Profile', desc: 'Add skills, projects, experience, and upload your certificates.' },
              { n: '03', title: 'Share Securely', desc: 'Control privacy per section. Share your public URL with anyone.' },
            ].map((s, i) => (
              <div key={s.n} className="reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="font-display font-black text-6xl text-[var(--border)] mb-4">{s.n}</div>
                <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center reveal">
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3rem)] mb-6">Ready to build your<br />digital identity?</h2>
          <p className="text-[var(--muted)] mb-8">Join professionals who trust PortfolioVault with their credentials.</p>
          <Link to="/register" className="inline-block px-10 py-4 font-display font-bold text-[var(--void)] rounded-md text-sm tracking-wide hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
            Start for Free — No Credit Card
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 px-4 text-center text-xs text-[var(--muted)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display font-bold text-[var(--gold)]">PortfolioVault</span>
          <span>Built with React + Node.js + SQLite · Deployable on GitHub Pages & Render</span>
          <div className="flex gap-4">
            <Link to="/explore" className="hover:text-[var(--gold)] transition-colors">Explore</Link>
            <Link to="/login" className="hover:text-[var(--gold)] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

const FEATURES = [
  { icon: '🔐', title: 'Privacy by Design', desc: 'Control visibility of every section — skills, certs, contact info. Public profile shows only what you choose.' },
  { icon: '📂', title: 'Certificate Storage', desc: 'Upload PDFs and images securely. Share with a link or keep private. Your files, your control.' },
  { icon: '🔗', title: 'Universal Profile Link', desc: 'Get your own portfoliovault.app/u/yourname URL. Share it on LinkedIn, resumes, or anywhere.' },
  { icon: '👁️', title: 'GitHub-style Profiles', desc: 'Anyone can view your public profile. Private sections are hidden unless they\'re you.' },
  { icon: '🛡️', title: 'Single Admin', desc: 'One admin controls the platform. Can manage users, view all content, and moderate profiles.' },
  { icon: '⚡', title: 'Fast & Portable', desc: 'Deploy to GitHub Pages + Render free tier, or any server. SQLite database — zero config.' },
]
