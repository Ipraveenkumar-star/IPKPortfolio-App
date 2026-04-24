import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [tab, setTab] = useState('stats')

  useEffect(() => { document.title = 'Admin Panel — PortfolioVault' }, [])

  const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/admin/stats').then(r => r.data) })
  const { data: usersData, refetch: refetchUsers } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.get('/admin/users').then(r => r.data) })
  const { data: auditData } = useQuery({ queryKey: ['admin-audit'], queryFn: () => api.get('/admin/audit').then(r => r.data) })

  const toggleUser = async (user) => {
    try {
      await api.patch(`/users/${user.id}/toggle`)
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`)
      refetchUsers()
    } catch { toast.error('Failed') }
  }

  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user.username}? This is irreversible.`)) return
    try { await api.delete(`/admin/users/${user.id}`); toast.success('Deleted'); refetchUsers() }
    catch { toast.error('Failed') }
  }

  const stats = statsData?.stats || {}

  return (
    <div className="min-h-screen pt-20 page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg badge-admin flex items-center justify-center">👑</div>
          <div>
            <h1 className="font-display font-black text-3xl">Admin Panel</h1>
            <p className="text-[var(--muted)] text-sm font-mono">Platform Management · You have full control</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', val: stats.totalUsers || 0, icon: '👥' },
            { label: 'Active Users', val: stats.activeUsers || 0, icon: '✅' },
            { label: 'Certificates', val: stats.totalCertificates || 0, icon: '📜' },
            { label: 'New This Month', val: stats.newUsersThisMonth || 0, icon: '📈' },
            { label: 'Projects', val: stats.totalProjects || 0, icon: '📁' },
            { label: 'Skills', val: stats.totalSkills || 0, icon: '⚡' },
            { label: 'Logins (7d)', val: stats.recentLogins || 0, icon: '🔑' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-4 border border-[var(--border)]">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-black text-2xl text-[var(--gold)]">{s.val}</div>
              <div className="text-xs text-[var(--muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {['Users', 'Audit Log'].map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase().replace(' ', '-'))}
              className={`px-4 py-2.5 text-sm rounded-lg font-mono transition-all ${tab === t.toLowerCase().replace(' ', '-') ? 'glass-bright text-[var(--gold)] border border-[var(--gold)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Users table */}
        {tab === 'users' && (
          <div className="glass rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase">User</th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase hidden md:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase">Status</th>
                    <th className="text-right px-4 py-3 font-mono text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(usersData?.users || []).map(u => (
                    <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--mist)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--plasma), var(--gold))' }}>
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <Link to={`/u/${u.profile_slug}`} className="font-medium hover:text-[var(--gold)] transition-colors">{u.display_name || u.username}</Link>
                            <div className="text-xs text-[var(--muted)] font-mono">@{u.username}</div>
                          </div>
                          {u.role === 'admin' && <span className="badge-admin text-xs px-1.5 py-0.5 rounded">ADMIN</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] text-xs hidden sm:table-cell font-mono">{u.email}</td>
                      <td className="px-4 py-3 text-[var(--muted)] text-xs hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${u.is_active ? 'badge-public' : 'badge-private'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'admin' && (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => toggleUser(u)} className={`text-xs px-2 py-1 border rounded transition-colors ${u.is_active ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteUser(u)} className="text-xs px-2 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded transition-colors">
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit log */}
        {tab === 'audit-log' && (
          <div className="glass rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase">Time</th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase">User</th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase">Action</th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase hidden sm:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {(auditData?.logs || []).map(log => (
                    <tr key={log.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--mist)] transition-colors">
                      <td className="px-4 py-2.5 text-[var(--muted)] text-xs font-mono">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-xs">{log.username || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded font-mono ${log.action === 'LOGIN' ? 'badge-public' : log.action === 'LOGIN_FAILED' ? 'badge-private' : 'bg-[var(--mist)] text-[var(--muted)]'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--muted)] text-xs font-mono hidden sm:table-cell">{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
