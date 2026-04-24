export default function CertModal({ cert, onClose }) {
  const fileUrl = cert.file_url

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-bright rounded-2xl border border-[var(--border)] w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="font-display font-bold text-lg">Certificate Details</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)] text-2xl">×</button>
        </div>

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,93,38,0.2))' }}>
              📜
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-1">{cert.title}</h3>
              <p className="text-[var(--gold)] text-sm">{cert.issuer}</p>
              <div className="flex gap-2 mt-1">
                {cert.is_public ? <span className="badge-public text-xs px-2 py-0.5 rounded">Public</span> : <span className="badge-private text-xs px-2 py-0.5 rounded">Private</span>}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {cert.issue_date && (
              <div className="p-3 bg-[var(--mist)] rounded-lg">
                <p className="text-xs text-[var(--muted)] font-mono uppercase mb-1">Issue Date</p>
                <p className="text-sm">{cert.issue_date}</p>
              </div>
            )}
            {cert.expiry_date && (
              <div className="p-3 bg-[var(--mist)] rounded-lg">
                <p className="text-xs text-[var(--muted)] font-mono uppercase mb-1">Expiry Date</p>
                <p className="text-sm">{cert.expiry_date}</p>
              </div>
            )}
            {cert.credential_id && (
              <div className="p-3 bg-[var(--mist)] rounded-lg col-span-2">
                <p className="text-xs text-[var(--muted)] font-mono uppercase mb-1">Credential ID</p>
                <p className="text-sm font-mono text-[var(--gold)]">{cert.credential_id}</p>
              </div>
            )}
          </div>

          {cert.description && (
            <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">{cert.description}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noreferrer"
                className="flex-1 py-2.5 text-center font-display font-bold text-[var(--void)] rounded-lg text-sm" style={{ background: 'linear-gradient(135deg, var(--gold), var(--ember))' }}>
                View File ↗
              </a>
            )}
            {cert.verify_url && (
              <a href={cert.verify_url} target="_blank" rel="noreferrer"
                className="flex-1 py-2.5 text-center text-sm border border-[var(--border)] rounded-lg text-[var(--text)] hover:border-[var(--gold)] transition-colors">
                Verify →
              </a>
            )}
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-[var(--muted)] border border-[var(--border)] rounded-lg hover:text-[var(--text)] transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
