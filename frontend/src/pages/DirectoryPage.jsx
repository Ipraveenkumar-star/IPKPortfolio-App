import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

export default function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    document.title = 'Explore Profiles — PortfolioVault'
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['directory', debouncedSearch],
    queryFn: () => api.get(`/users/directory?search=${debouncedSearch}&limit=30`).then(r => r.data),
  })

  return (
    <div className="min-h-screen pt-20 page-enter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="text-xs tracking-widest text-[var(--gold)] uppercase mb-3 font-mono">Community</div>
          <h1 className="font-display font-black text-[clamp(2rem,5vw,4rem)] mb-4">
            Discover Talent
          </h1>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            Browse public portfolios from professionals worldwide. Each profile is uniquely theirs.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or username..."
              className="input-dark w-full pl-10 pr-4 py-3.5 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Stats bar */}
        {data && (
          <div className="text-center mb-6 text-sm text-[var(--muted)]">
            <span className="font-mono">{data.total}</span> public profiles
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(data?.users || []).map(u => (
              <Link key={u.id} to={`/u/${u.profile_slug}`} className="glass rounded-xl p-5 border border-[var(--border)] border-animated hover:glow-gold transition-all duration-300 group block">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg text-white flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--plasma), var(--gold))' }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.display_name || u.username)?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm group-hover:text-[var(--gold)] transition-colors truncate">{u.display_name || u.username}</p>
                    <p className="text-[var(--muted)] text-xs font-mono">@{u.username}</p>
                  </div>
                </div>
                {u.tagline && <p className="text-[var(--muted)] text-xs line-clamp-2 mb-2">{u.tagline}</p>}
                {u.location && <p className="text-xs text-[var(--muted)]">📍 {u.location}</p>}
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="text-xs text-[var(--gold)] group-hover:underline">View Profile →</span>
                  <span className="text-xs text-[var(--muted)]">{new Date(u.created_at).getFullYear()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {data?.users?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-[var(--muted)]">No profiles found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
