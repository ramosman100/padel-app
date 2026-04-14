'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import WiiBadge from '@/components/ui/WiiBadge'
import type { MatchRow } from './page'

interface Props {
  matches: MatchRow[]
  myPlayerId: string | null
  playerNames: string[]
}

type Filter = 'all' | 'win' | 'loss'

function PlayerPip({ name, avatarConfig }: { name: string; avatarConfig: unknown }) {
  const cfg = avatarConfig as Record<string, unknown> | null
  const hasAvatar = cfg && Object.keys(cfg).length > 0
  return (
    <div
      className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0"
      title={name}
      style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}
    >
      {hasAvatar ? (
        <AvatarSvg config={cfg as Parameters<typeof AvatarSvg>[0]['config']} size={28} />
      ) : (
        <div className="w-full h-full bg-wii-green flex items-center justify-center text-white font-bold text-[9px]">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE = 20

export default function HistoryClient({ matches, playerNames }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [playerFilter, setPlayerFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (filter === 'win'  && !m.won) return false
      if (filter === 'loss' &&  m.won) return false
      if (playerFilter) {
        const allNames = [
          ...(m.partner ? [m.partner.display_name] : []),
          ...m.opponents.map((o) => o.display_name),
        ]
        if (!allNames.some((n) => n.toLowerCase().includes(playerFilter.toLowerCase()))) return false
      }
      return true
    })
  }, [matches, filter, playerFilter])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filtered.length

  const wins   = matches.filter((m) => m.won).length
  const losses = matches.length - wins

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-5 px-1">
          <h1 className="text-3xl font-bold text-wii-text" style={{ fontFamily: 'var(--font-fredoka)' }}>
            Match History
          </h1>
          <p className="text-sm text-wii-muted mt-0.5">
            {matches.length} matches · {wins}W – {losses}L
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-2 mb-4">
          {/* Result filter pills */}
          <div className="flex gap-2">
            {(['all', 'win', 'loss'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1) }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f
                    ? f === 'win'  ? 'bg-wii-green text-white shadow-md shadow-wii-green/30'
                    : f === 'loss' ? 'bg-wii-red text-white shadow-md shadow-wii-red/30'
                    : 'bg-wii-text text-white shadow-md'
                    : 'wii-card text-wii-muted hover:text-wii-text'
                }`}
              >
                {f === 'all' ? 'All' : f === 'win' ? '✓ Wins' : '✕ Losses'}
              </button>
            ))}
          </div>

          {/* Player search */}
          {playerNames.length > 0 && (
            <input
              type="text"
              value={playerFilter}
              onChange={(e) => { setPlayerFilter(e.target.value); setPage(1) }}
              placeholder="Filter by player name…"
              className="w-full bg-white/70 border border-white/80 rounded-2xl px-4 py-2.5 text-sm text-wii-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-wii-green/40 transition-all"
            />
          )}
        </div>

        {/* Match list */}
        {filtered.length === 0 ? (
          <div className="wii-card p-10 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-bold text-wii-text" style={{ fontFamily: 'var(--font-fredoka)' }}>No matches found</p>
            <p className="text-wii-muted text-sm mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
            {paginated.map((m, i) => {
              const date = new Date(m.played_at)
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              const allPlayers = [
                ...(m.partner ? [m.partner] : []),
                ...m.opponents,
              ]

              return (
                <Link
                  key={m.id}
                  href={`/dashboard/history/${m.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/40 transition-colors ${
                    i < paginated.length - 1 ? 'border-b border-white/50' : ''
                  }`}
                >
                  {/* Result badge */}
                  <WiiBadge variant={m.won ? 'win' : 'loss'} />

                  {/* Score + sets */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-wii-text">
                      {m.score_for}–{m.score_against}
                      {m.sets.length > 0 && (
                        <span className="text-wii-muted font-normal ml-2 text-xs">
                          ({m.sets.map((s) => `${s.my}:${s.opp}`).join(' ')})
                        </span>
                      )}
                    </p>
                    {/* Player pips row */}
                    {allPlayers.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {allPlayers.slice(0, 5).map((p, j) => (
                          <PlayerPip key={j} name={p.display_name} avatarConfig={p.avatar_config} />
                        ))}
                        {allPlayers.length > 5 && (
                          <span className="text-[10px] text-wii-muted font-semibold">+{allPlayers.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date + chevron */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-wii-muted">{dateStr}</span>
                    <span className="text-wii-muted text-sm">›</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="wii-card px-6 py-2.5 text-sm font-bold text-wii-muted hover:text-wii-text transition-colors"
            >
              Load more ({filtered.length - paginated.length} remaining)
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
