import { useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function PrivacyPanel({ privacy, slug, onClose, onSave }) {
  const [settings, setSettings] = useState({
    showEmail: privacy?.showEmail ?? false,
    showLocation: privacy?.showLocation ?? true,
    showCertificates: privacy?.showCertificates ?? true,
    showExperience: privacy?.showExperience ?? true,
    showProjects: privacy?.showProjects ?? true,
    showSkills: privacy?.showSkills ?? true,
    profileVisible: privacy?.profileVisible ?? true,
    requireLoginToView: privacy?.requireLoginToView ?? false,
  })
  const [saving, setSaving] = useState(false)

  const toggle = (k) => setSettings(s => ({ ...s, [k]: !s[k] }))

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/users/${slug}/privacy`, settings)
      toast.success('Privacy settings saved!')
      onSave()
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/u/${slug}`)
    toast.success('Public link copied!')
  }

  const ITEMS = [
    { key: 'profileVisible', label: 'Profile Visible to Public', desc: 'Anyone can find and view your profile' },
    { key: 'showSkills', label: 'Show Skills Section', desc: 'Skill bars visible on public profile' },
    { key: 'showProjects', label: 'Show Projects Section', desc: 'Projects visible on public profile' },
    { key: 'showCertificates', label: 'Show Certificates Section', desc: 'Certificate list visible on public profile' },
    { key: 'showExperience', label: 'Show Experience / Timeline', desc: 'Work history visible publicly' },
    { key: 'showEmail', label: 'Show Email Address', desc: 'Email visible on public profile' },
    { key: 'showLocation', label: 'Show Location', desc: 'City/country visible publicly' },
    { key: 'requireLoginToView', label: 'Require Login to View', desc: 'Only logged-in users can view profile' },
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-bright rounded-2xl border border-[var(--border)] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="font-display font-bold text-lg">Privacy Controls</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5 font-mono">Choose what the world sees</p>
          </div>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)] text-2xl leading-none">×</button>
        </div>

        {/* Settings */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-1">
          {ITEMS.map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--mist)] transition-colors">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{item.desc}</p>
              </div>
              <div className={`toggle-track flex-shrink-0 ${settings[item.key] ? 'on' : ''}`} onClick={() => toggle(item.key)}>
                <div className="toggle-thumb" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[var(--border)] space-y-3">
          {/* Public link */}
          <div className="flex items-center gap-2 p-3 bg-[var(--mist)] rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--muted)] mb-0.5">Public Profile URL</p>
              <p className="text-xs font-mono text-[var(--gold)] truncate">{window.location.origin}/u/{slug}</p>
            </div>
            <button onClick={copyPublicLink} className="text-xs px-2 py-1 border border-[var(--border)] rounded hover:border-[var(--gold)] transition-colors whitespace-nowrap">
              Copy
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="flex-1 py-2.5 font-display font-bold text-[var(--void)] rounded-lg text-sm disabled:opacity-50" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
