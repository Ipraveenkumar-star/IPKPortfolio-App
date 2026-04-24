import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import { useAuthStore } from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import PrivacyPanel from '../components/PrivacyPanel'
import CertModal from '../components/CertModal'

export default function ProfilePage() {
  const { slug } = useParams()
  const { user: me } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', slug],
    queryFn: () => api.get(`/users/${slug}`).then(r => r.data.profile),
    retry: false,
  })

  useEffect(() => {
    if (data) document.title = `${data.displayName || data.username} — PortfolioVault`
  }, [data])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Profile link copied!')
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState msg={error.response?.data?.error} />

  const p = data
  const isOwner = me?.id === p.id || me?.role === 'admin'

  const skillsByCategory = (p.skills || []).reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div className="min-h-screen pt-16 page-enter">
      {/* Hero banner */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(232,93,38,0.2), rgba(201,168,76,0.2))' }}>
        <div className="absolute inset-0 bg-mesh opacity-50" />
        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setPrivacyOpen(true)} className="px-3 py-1.5 glass text-xs font-mono border border-[var(--border)] rounded hover:border-[var(--gold)] transition-colors">
              ⚙ Privacy Settings
            </button>
            <Link to="/dashboard" className="px-3 py-1.5 glass text-xs font-mono border border-[var(--border)] rounded hover:border-[var(--gold)] transition-colors">
              ✏ Edit Profile
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-8 items-end sm:items-start">
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-[var(--void)] overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--plasma), var(--gold))' }}>
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display font-black text-3xl text-white">
                  {(p.displayName || p.username)?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 pb-2 sm:pt-16">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="font-display font-black text-2xl sm:text-3xl">{p.displayName || p.username}</h1>
              <span className="text-[var(--muted)] font-mono text-sm">@{p.username}</span>
              {isOwner && <span className="badge-admin text-xs px-2 py-0.5 rounded font-mono">YOU</span>}
            </div>
            {p.tagline && <p className="text-[var(--muted)] text-sm mb-2">{p.tagline}</p>}
            <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
              {p.location && <span>📍 {p.location}</span>}
              {p.email && <span>✉ {p.email}</span>}
              {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors">🌐 Website</a>}
              {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors">⌨ GitHub</a>}
              {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors">in LinkedIn</a>}
            </div>
          </div>

          <div className="flex gap-2 sm:mt-16">
            <button onClick={copyLink} className="px-4 py-2 glass text-sm border border-[var(--border)] rounded-lg hover:border-[var(--gold)] transition-colors font-mono">
              🔗 Share
            </button>
          </div>
        </div>

        {/* Bio */}
        {p.bio && <p className="text-[var(--muted)] text-sm leading-relaxed mb-6 max-w-2xl">{p.bio}</p>}

        {/* Stats bar */}
        <div className="flex gap-6 mb-6 text-sm border-b border-[var(--border)] pb-4">
          {[
            { label: 'Skills', val: p.skills?.length || 0 },
            { label: 'Projects', val: p.projects?.length || 0 },
            { label: 'Certificates', val: p.certificates?.length || 0 },
            { label: 'Experience', val: p.experiences?.length || 0 },
          ].map(s => (
            <button key={s.label} onClick={() => setActiveTab(s.label.toLowerCase())} className="flex items-center gap-1.5 hover:text-[var(--gold)] transition-colors">
              <span className="font-display font-bold">{s.val}</span>
              <span className="text-[var(--muted)]">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {['overview', 'projects', 'certificates', 'experience'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-mono rounded-lg capitalize transition-colors whitespace-nowrap ${activeTab === t ? 'bg-[var(--mist)] text-[var(--gold)] border border-[var(--gold)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-16">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Bio/about */}
              <div className="md:col-span-2 space-y-6">
                {/* Featured projects */}
                {(p.projects || []).filter(pr => pr.is_featured).length > 0 && (
                  <Section title="Pinned Projects">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(p.projects || []).filter(pr => pr.is_featured).map(pr => (
                        <ProjectCard key={pr.id} project={pr} />
                      ))}
                    </div>
                  </Section>
                )}
                {/* Recent certs */}
                {(p.certificates || []).length > 0 && (
                  <Section title="Recent Certificates">
                    <div className="space-y-2">
                      {(p.certificates || []).slice(0, 3).map(c => (
                        <CertRow key={c.id} cert={c} onClick={() => setSelectedCert(c)} isOwner={isOwner} onRefetch={refetch} />
                      ))}
                    </div>
                  </Section>
                )}
              </div>

              {/* Skills sidebar */}
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([cat, skills]) => (
                  <div key={cat} className="glass rounded-xl p-4 border border-[var(--border)]">
                    <h4 className="font-mono text-xs text-[var(--gold)] uppercase tracking-wider mb-3">{cat}</h4>
                    <div className="space-y-2.5">
                      {skills.map(s => (
                        <div key={s.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[var(--text)]">{s.name}</span>
                            <span className="text-[var(--gold)] font-mono">{s.proficiency}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--mist)] rounded-full overflow-hidden">
                            <div className="skill-bar-fill" style={{ width: `${s.proficiency}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(p.projects || []).map(pr => <ProjectCard key={pr.id} project={pr} />)}
              {(p.projects || []).length === 0 && <EmptyState label="No projects yet" />}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(p.certificates || []).map(c => (
                <CertCard key={c.id} cert={c} onClick={() => setSelectedCert(c)} isOwner={isOwner} onRefetch={refetch} />
              ))}
              {(p.certificates || []).length === 0 && <EmptyState label="No certificates yet" />}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="max-w-2xl">
              <div className="relative pl-6">
                <div className="timeline-line" />
                {(p.experiences || []).map((exp, i) => (
                  <div key={exp.id} className="relative pl-6 pb-8">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-[var(--gold)] bg-[var(--void)]" />
                    <div className="text-xs font-mono text-[var(--gold)] mb-1">
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                      {!exp.is_public && <span className="ml-2 badge-private text-xs px-1.5 py-0.5 rounded">Private</span>}
                    </div>
                    <h3 className="font-display font-bold text-lg">{exp.title}</h3>
                    <p className="text-[var(--muted)] text-sm mb-2">{exp.organization}</p>
                    <p className="text-[var(--muted)] text-sm leading-relaxed">{exp.description}</p>
                  </div>
                ))}
                {(p.experiences || []).length === 0 && <EmptyState label="No experience added" />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy panel (owner only) */}
      {isOwner && privacyOpen && (
        <PrivacyPanel
          privacy={p.privacy}
          slug={p.profileSlug}
          onClose={() => setPrivacyOpen(false)}
          onSave={() => { setPrivacyOpen(false); refetch(); }}
        />
      )}

      {/* Certificate modal */}
      {selectedCert && <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-display font-bold text-sm text-[var(--muted)] uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ProjectCard({ project: pr }) {
  return (
    <div className="glass rounded-xl p-4 border border-[var(--border)] border-animated hover:glow-gold transition-all duration-300 group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display font-bold text-sm group-hover:text-[var(--gold)] transition-colors">{pr.title}</h3>
        {!pr.is_public && <span className="badge-private text-xs px-1.5 py-0.5 rounded">Private</span>}
        {pr.is_featured && <span className="text-[var(--gold)] text-xs">⭐</span>}
      </div>
      <p className="text-[var(--muted)] text-xs leading-relaxed mb-3 line-clamp-2">{pr.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {(pr.tech_stack || []).slice(0, 4).map(t => (
          <span key={t} className="text-xs px-2 py-0.5 bg-[var(--mist)] rounded font-mono text-[var(--muted)]">{t}</span>
        ))}
      </div>
      <div className="flex gap-3 text-xs">
        {pr.live_url && <a href={pr.live_url} target="_blank" rel="noreferrer" className="text-[var(--gold)] hover:underline">Live →</a>}
        {pr.github_url && <a href={pr.github_url} target="_blank" rel="noreferrer" className="text-[var(--muted)] hover:text-[var(--text)]">GitHub</a>}
      </div>
    </div>
  )
}

function CertCard({ cert: c, onClick, isOwner, onRefetch }) {
  const togglePrivacy = async (e) => {
    e.stopPropagation()
    try {
      await api.patch(`/certificates/${c.id}/privacy`)
      onRefetch()
      toast.success('Privacy updated')
    } catch { toast.error('Failed') }
  }
  return (
    <div onClick={onClick} className="glass rounded-xl p-4 border border-[var(--border)] border-animated hover:glow-gold cursor-pointer transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,93,38,0.2))' }}>📜</div>
        <div className="flex gap-1">
          {!c.is_public && <span className="badge-private text-xs px-1.5 py-0.5 rounded">Private</span>}
          {c.is_public && <span className="badge-public text-xs px-1.5 py-0.5 rounded">Public</span>}
          {isOwner && (
            <button onClick={togglePrivacy} className="text-xs text-[var(--muted)] hover:text-[var(--gold)] px-1.5 py-0.5 border border-[var(--border)] rounded transition-colors">
              {c.is_public ? '🔒' : '🌐'}
            </button>
          )}
        </div>
      </div>
      <h3 className="font-display font-bold text-sm group-hover:text-[var(--gold)] transition-colors mb-1">{c.title}</h3>
      <p className="text-[var(--gold)] text-xs mb-1">{c.issuer}</p>
      <p className="text-[var(--muted)] text-xs">{c.issue_date}</p>
    </div>
  )
}

function CertRow({ cert: c, onClick, isOwner, onRefetch }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 glass rounded-lg border border-[var(--border)] hover:border-[var(--gold)] cursor-pointer transition-colors group">
      <span className="text-lg">📜</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium group-hover:text-[var(--gold)] transition-colors truncate">{c.title}</p>
        <p className="text-xs text-[var(--muted)]">{c.issuer} · {c.issue_date}</p>
      </div>
      {!c.is_public && <span className="badge-private text-xs px-1.5 py-0.5 rounded flex-shrink-0">Private</span>}
    </div>
  )
}

function EmptyState({ label }) {
  return <div className="col-span-full text-center py-12 text-[var(--muted)] text-sm">{label}</div>
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--muted)] text-sm font-mono">Loading profile...</p>
      </div>
    </div>
  )
}

function ErrorState({ msg }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display font-black text-2xl mb-2">Profile Not Found</h2>
        <p className="text-[var(--muted)] mb-6">{msg || 'This profile doesn\'t exist or is private.'}</p>
        <Link to="/explore" className="text-[var(--gold)] hover:underline text-sm">← Explore profiles</Link>
      </div>
    </div>
  )
}
