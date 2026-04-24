import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import api from '../utils/api'
import { useAuthStore } from '../hooks/useAuthStore'
import toast from 'react-hot-toast'
import PrivacyPanel from '../components/PrivacyPanel'
import CertModal from '../components/CertModal'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const qc = useQueryClient()

  useEffect(() => { document.title = 'Dashboard — PortfolioVault' }, [])

  const { data: profile, isLoading } = useQuery({
    queryKey: ['myprofile', user?.profile_slug],
    queryFn: () => api.get(`/users/${user?.profile_slug}`).then(r => r.data.profile),
    enabled: !!user?.profile_slug
  })

  const refetch = () => qc.invalidateQueries(['myprofile', user?.profile_slug])

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'skills', label: '⚡ Skills' },
    { id: 'projects', label: '📁 Projects' },
    { id: 'certificates', label: '📜 Certificates' },
    { id: 'experience', label: '🕐 Experience' },
  ]

  return (
    <div className="min-h-screen pt-20 page-enter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl">Dashboard</h1>
            <p className="text-[var(--muted)] text-sm mt-1 font-mono">
              Your profile: <Link to={`/u/${user?.profile_slug}`} className="text-[var(--gold)] hover:underline">portfoliovault.app/u/{user?.profile_slug}</Link>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPrivacyOpen(true)} className="px-4 py-2 glass text-sm border border-[var(--border)] rounded-lg hover:border-[var(--gold)] transition-colors font-mono">
              🔐 Privacy
            </button>
            <Link to={`/u/${user?.profile_slug}`} className="px-4 py-2 glass text-sm border border-[var(--border)] rounded-lg hover:border-[var(--gold)] transition-colors font-mono">
              👁 View Public
            </Link>
          </div>
        </div>

        {/* Quick copy link */}
        <div className="glass rounded-xl p-4 border border-[var(--border)] mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-mono text-[var(--muted)] mb-0.5">Your shareable link</p>
            <p className="text-sm font-mono text-[var(--gold)]">{window.location.origin}/u/{user?.profile_slug}</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/u/${user?.profile_slug}`); toast.success('Copied!') }}
            className="px-4 py-2 text-xs font-mono bg-[var(--mist)] hover:bg-[var(--slate)] rounded-lg border border-[var(--border)] transition-colors whitespace-nowrap">
            📋 Copy Link
          </button>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm rounded-lg font-mono whitespace-nowrap transition-all ${tab === t.id ? 'glass-bright text-[var(--gold)] border border-[var(--gold)]' : 'text-[var(--muted)] hover:text-[var(--text)] border border-transparent'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'profile' && <ProfileEditor profile={profile} onSave={refetch} />}
            {tab === 'skills' && <SkillsEditor skills={profile?.skills || []} userId={user?.id} onSave={refetch} />}
            {tab === 'projects' && <ProjectsEditor projects={profile?.projects || []} userId={user?.id} onSave={refetch} />}
            {tab === 'certificates' && <CertsEditor certs={profile?.certificates || []} userId={user?.id} onSave={refetch} />}
            {tab === 'experience' && <ExperienceEditor exps={profile?.experiences || []} userId={user?.id} onSave={refetch} />}
          </>
        )}
      </div>

      {privacyOpen && profile && (
        <PrivacyPanel privacy={profile.privacy} slug={user?.profile_slug} onClose={() => setPrivacyOpen(false)} onSave={() => { setPrivacyOpen(false); refetch() }} />
      )}
    </div>
  )
}

// ─── Profile Editor ───────────────────────────────────────
function ProfileEditor({ profile, onSave }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    tagline: profile?.tagline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    githubUrl: profile?.githubUrl || '',
    linkedinUrl: profile?.linkedinUrl || '',
    twitterUrl: profile?.twitterUrl || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl)
  const [saving, setSaving] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] }, maxFiles: 1,
    onDrop: async ([file]) => {
      const fd = new FormData(); fd.append('avatar', file)
      try {
        const { data } = await api.post(`/users/${user.profile_slug}/avatar`, fd)
        setAvatarPreview(data.avatarUrl)
        toast.success('Avatar updated!')
        onSave()
      } catch { toast.error('Upload failed') }
    }
  })

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/users/${user.profile_slug}/profile`, form)
      toast.success('Profile saved!')
      onSave()
    } catch { toast.error('Save failed') }
    setSaving(false)
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Avatar */}
      <div className="md:col-span-1">
        <div className="glass rounded-xl p-6 border border-[var(--border)] text-center">
          <div {...getRootProps()} className={`dropzone mx-auto w-28 h-28 rounded-xl overflow-hidden cursor-pointer mb-3 ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display font-black text-3xl" style={{ background: 'linear-gradient(135deg, var(--plasma), var(--gold))' }}>
                {form.displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--muted)]">Click or drag to upload avatar</p>
        </div>
      </div>

      {/* Form */}
      <div className="md:col-span-2 glass rounded-xl p-6 border border-[var(--border)]">
        <h3 className="font-display font-bold mb-4">Profile Info</h3>
        <div className="space-y-4">
          <FormRow label="Display Name">
            <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
          </FormRow>
          <FormRow label="Tagline (one-liner)">
            <input type="text" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="e.g. Full-stack developer from Chennai" className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
          </FormRow>
          <FormRow label="Bio">
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Tell people about yourself..." className="input-dark w-full px-3 py-2.5 rounded-lg text-sm resize-none" />
          </FormRow>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormRow label="Location">
              <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
            </FormRow>
            <FormRow label="Website">
              <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://" className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
            </FormRow>
            <FormRow label="GitHub URL">
              <input type="url" value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
            </FormRow>
            <FormRow label="LinkedIn URL">
              <input type="url" value={form.linkedinUrl} onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
            </FormRow>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 font-display font-bold text-[var(--void)] rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Skills Editor ────────────────────────────────────────
function SkillsEditor({ skills, onSave }) {
  const [form, setForm] = useState({ name: '', category: 'Frontend', proficiency: 75, isPublic: true })
  const [adding, setAdding] = useState(false)
  const CATS = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Design', 'AI/ML', 'Other']

  const add = async () => {
    if (!form.name) return toast.error('Name required')
    setAdding(true)
    try {
      await api.post('/portfolio/skills', form)
      toast.success('Skill added!'); onSave()
      setForm({ name: '', category: 'Frontend', proficiency: 75, isPublic: true })
    } catch { toast.error('Failed') }
    setAdding(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete this skill?')) return
    try { await api.delete(`/portfolio/skills/${id}`); onSave(); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const toggle = async (skill) => {
    try { await api.put(`/portfolio/skills/${skill.id}`, { ...skill, isPublic: !skill.is_public }); onSave() }
    catch { toast.error('Failed') }
  }

  const grouped = skills.reduce((a, s) => { (a[s.category] = a[s.category] || []).push(s); return a }, {})

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="glass rounded-xl p-5 border border-[var(--border)]">
        <h3 className="font-display font-bold mb-4">Add Skill</h3>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <FormRow label="Skill Name">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="React, Python..." className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
          </FormRow>
          <FormRow label="Category">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--void)]">
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormRow>
          <FormRow label={`Proficiency: ${form.proficiency}%`}>
            <input type="range" min={10} max={100} value={form.proficiency} onChange={e => setForm(f => ({ ...f, proficiency: +e.target.value }))} className="w-full accent-[var(--gold)]" />
          </FormRow>
          <div className="flex gap-2 items-center">
            <Toggle on={form.isPublic} onToggle={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))} label="Public" />
            <button onClick={add} disabled={adding} className="flex-1 py-2.5 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Skills list */}
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat} className="glass rounded-xl p-5 border border-[var(--border)]">
          <h3 className="font-mono text-xs text-[var(--gold)] uppercase tracking-wider mb-3">{cat}</h3>
          <div className="space-y-3">
            {catSkills.map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{s.name}</span>
                    <span className="font-mono text-[var(--gold)]">{s.proficiency}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--mist)] rounded-full overflow-hidden">
                    <div className="skill-bar-fill" style={{ width: `${s.proficiency}%` }} />
                  </div>
                </div>
                <button onClick={() => toggle(s)} className={`text-xs px-2 py-1 rounded border ${s.is_public ? 'badge-public' : 'badge-private'}`}>
                  {s.is_public ? '🌐' : '🔒'}
                </button>
                <button onClick={() => remove(s.id)} className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors">✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Projects Editor ──────────────────────────────────────
function ProjectsEditor({ projects, onSave }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', techStack: [], liveUrl: '', githubUrl: '', category: 'web', isPublic: true, isFeatured: false })
  const [techInput, setTechInput] = useState('')
  const [saving, setSaving] = useState(false)

  const openForm = (p = null) => {
    if (p) { setForm({ title: p.title, description: p.description || '', techStack: p.tech_stack || [], liveUrl: p.live_url || '', githubUrl: p.github_url || '', category: p.category, isPublic: !!p.is_public, isFeatured: !!p.is_featured }); setEditing(p.id) }
    else { setForm({ title: '', description: '', techStack: [], liveUrl: '', githubUrl: '', category: 'web', isPublic: true, isFeatured: false }); setEditing(null) }
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title) return toast.error('Title required')
    setSaving(true)
    try {
      if (editing) { await api.put(`/portfolio/projects/${editing}`, form); toast.success('Updated!') }
      else { await api.post('/portfolio/projects', form); toast.success('Project added!') }
      onSave(); setShowForm(false)
    } catch { toast.error('Save failed') }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete project?')) return
    try { await api.delete(`/portfolio/projects/${id}`); onSave(); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const addTech = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      setForm(f => ({ ...f, techStack: [...f.techStack, techInput.trim()] }))
      setTechInput('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openForm()} className="px-4 py-2 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
          + Add Project
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 border border-[var(--gold)]">
          <h3 className="font-display font-bold mb-4">{editing ? 'Edit' : 'Add'} Project</h3>
          <div className="space-y-3">
            <FormRow label="Title"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            <FormRow label="Description"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm resize-none" /></FormRow>
            <div className="grid sm:grid-cols-2 gap-3">
              <FormRow label="Live URL"><input type="url" value={form.liveUrl} onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))} placeholder="https://" className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
              <FormRow label="GitHub URL"><input type="url" value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            </div>
            <FormRow label="Tech Stack (Enter to add)">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.techStack.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-[var(--mist)] rounded font-mono">
                    {t} <button onClick={() => setForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }))} className="text-[var(--muted)] hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
              <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={addTech} placeholder="React, Node.js... (press Enter)" className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
            </FormRow>
            <div className="flex gap-4 flex-wrap">
              <Toggle on={form.isPublic} onToggle={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))} label="Public" />
              <Toggle on={form.isFeatured} onToggle={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))} label="⭐ Featured" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--muted)] border border-[var(--border)] rounded-lg hover:border-[var(--text)] transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="px-6 py-2 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <div key={p.id} className="glass rounded-xl p-4 border border-[var(--border)] border-animated group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-display font-bold text-sm">{p.title}</h3>
              <div className="flex gap-1">
                {!p.is_public && <span className="badge-private text-xs px-1 py-0.5 rounded">🔒</span>}
                {p.is_featured && <span className="text-[var(--gold)] text-xs">⭐</span>}
              </div>
            </div>
            <p className="text-[var(--muted)] text-xs line-clamp-2 mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {(p.tech_stack || []).slice(0, 3).map(t => <span key={t} className="text-xs px-1.5 py-0.5 bg-[var(--mist)] rounded font-mono text-[var(--muted)]">{t}</span>)}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openForm(p)} className="text-xs text-[var(--muted)] hover:text-[var(--gold)] transition-colors">✏ Edit</button>
              <button onClick={() => remove(p.id)} className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors">🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Certificates Editor ──────────────────────────────────
function CertsEditor({ certs, userId, onSave }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', issuer: '', issueDate: '', credentialId: '', verifyUrl: '', description: '', isPublic: 'true' })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': [], 'image/*': [] }, maxFiles: 1,
    onDrop: ([f]) => setFile(f)
  })

  const save = async () => {
    if (!form.title) return toast.error('Title required')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('file', file)
      await api.post('/certificates', fd)
      toast.success('Certificate uploaded!'); onSave(); setShowForm(false); setFile(null)
      setForm({ title: '', issuer: '', issueDate: '', credentialId: '', verifyUrl: '', description: '', isPublic: 'true' })
    } catch { toast.error('Upload failed') }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete certificate?')) return
    try { await api.delete(`/certificates/${id}`); onSave(); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const togglePrivacy = async (c) => {
    try { await api.patch(`/certificates/${c.id}/privacy`); onSave(); toast.success('Privacy updated') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
          + Upload Certificate
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 border border-[var(--gold)]">
          <h3 className="font-display font-bold mb-4">Upload Certificate</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <FormRow label="Certificate Title *"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            <FormRow label="Issuing Organization"><input value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            <FormRow label="Issue Date"><input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            <FormRow label="Credential ID"><input value={form.credentialId} onChange={e => setForm(f => ({ ...f, credentialId: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm font-mono" /></FormRow>
            <FormRow label="Verify URL"><input type="url" value={form.verifyUrl} onChange={e => setForm(f => ({ ...f, verifyUrl: e.target.value }))} placeholder="https://" className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            <FormRow label="Visibility">
              <select value={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--void)]">
                <option value="true">🌐 Public</option>
                <option value="false">🔒 Private</option>
              </select>
            </FormRow>
          </div>
          {/* File drop */}
          <div {...getRootProps()} className={`dropzone p-8 text-center rounded-xl mb-4 ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {file ? (
              <p className="text-sm text-[var(--gold)]">📎 {file.name}</p>
            ) : (
              <div>
                <p className="text-2xl mb-2">📂</p>
                <p className="text-sm text-[var(--muted)]">Drag & drop certificate here, or <span className="text-[var(--gold)]">browse</span></p>
                <p className="text-xs text-[var(--muted)] mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--muted)] border border-[var(--border)] rounded-lg">Cancel</button>
            <button onClick={save} disabled={saving} className="px-6 py-2 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
              {saving ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.map(c => (
          <div key={c.id} className="glass rounded-xl p-4 border border-[var(--border)] border-animated group cursor-pointer" onClick={() => setSelectedCert(c)}>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,93,38,0.2))' }}>📜</div>
              <div className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); togglePrivacy(c) }} className={`text-xs px-2 py-1 rounded border ${c.is_public ? 'badge-public' : 'badge-private'}`}>
                  {c.is_public ? '🌐 Public' : '🔒 Private'}
                </button>
              </div>
            </div>
            <h3 className="font-display font-bold text-sm mb-1 group-hover:text-[var(--gold)] transition-colors">{c.title}</h3>
            <p className="text-[var(--gold)] text-xs mb-1">{c.issuer}</p>
            <p className="text-[var(--muted)] text-xs mb-3">{c.issue_date}</p>
            <div className="flex gap-2">
              <button onClick={e => { e.stopPropagation(); remove(c.id) }} className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors">🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
      {selectedCert && <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />}
    </div>
  )
}

// ─── Experience Editor ────────────────────────────────────
function ExperienceEditor({ exps, onSave }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', organization: '', type: 'work', startDate: '', endDate: '', isCurrent: false, description: '', isPublic: true })
  const [saving, setSaving] = useState(false)

  const openForm = (e = null) => {
    if (e) { setForm({ title: e.title, organization: e.organization || '', type: e.type, startDate: e.start_date || '', endDate: e.end_date || '', isCurrent: !!e.is_current, description: e.description || '', isPublic: !!e.is_public }); setEditing(e.id) }
    else { setForm({ title: '', organization: '', type: 'work', startDate: '', endDate: '', isCurrent: false, description: '', isPublic: true }); setEditing(null) }
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title) return toast.error('Title required')
    setSaving(true)
    try {
      if (editing) { await api.put(`/portfolio/experience/${editing}`, form); toast.success('Updated!') }
      else { await api.post('/portfolio/experience', form); toast.success('Added!') }
      onSave(); setShowForm(false)
    } catch { toast.error('Save failed') }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete?')) return
    try { await api.delete(`/portfolio/experience/${id}`); onSave(); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openForm()} className="px-4 py-2 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
          + Add Experience
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 border border-[var(--gold)]">
          <h3 className="font-display font-bold mb-4">{editing ? 'Edit' : 'Add'} Experience</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormRow label="Title / Role"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            <FormRow label="Organization"><input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            <FormRow label="Type">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--void)]">
                <option value="work">💼 Work</option>
                <option value="education">🎓 Education</option>
                <option value="achievement">🏆 Achievement</option>
              </select>
            </FormRow>
            <FormRow label="Start Date"><input type="month" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>
            {!form.isCurrent && <FormRow label="End Date"><input type="month" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" /></FormRow>}
            <div className="flex items-center gap-4 pt-4">
              <Toggle on={form.isCurrent} onToggle={() => setForm(f => ({ ...f, isCurrent: !f.isCurrent }))} label="Currently here" />
              <Toggle on={form.isPublic} onToggle={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))} label="Public" />
            </div>
          </div>
          <FormRow label="Description" className="mt-3">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm resize-none" />
          </FormRow>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--muted)] border border-[var(--border)] rounded-lg">Cancel</button>
            <button onClick={save} disabled={saving} className="px-6 py-2 font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="relative pl-6 max-w-2xl">
        <div className="timeline-line" />
        {exps.map(e => (
          <div key={e.id} className="relative pl-6 pb-6 group">
            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-[var(--gold)] bg-[var(--void)]" />
            <div className="glass rounded-xl p-4 border border-[var(--border)] group-hover:border-[var(--gold)] transition-colors">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-display font-bold">{e.title}</h3>
                  <p className="text-[var(--muted)] text-sm">{e.organization} · {e.start_date} — {e.is_current ? 'Present' : e.end_date}</p>
                </div>
                <div className="flex gap-1">
                  {!e.is_public && <span className="badge-private text-xs px-1.5 py-0.5 rounded">Private</span>}
                  <button onClick={() => openForm(e)} className="text-xs text-[var(--muted)] hover:text-[var(--gold)] p-1">✏</button>
                  <button onClick={() => remove(e.id)} className="text-xs text-[var(--muted)] hover:text-red-400 p-1">🗑</button>
                </div>
              </div>
              <p className="text-[var(--muted)] text-sm mt-1">{e.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────
function FormRow({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ on, onToggle, label }) {
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
      <div className={`toggle-track ${on ? 'on' : ''}`}><div className="toggle-thumb" /></div>
      <span className="text-xs text-[var(--muted)]">{label}</span>
    </div>
  )
}
