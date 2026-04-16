'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

type AdminPlayer = {
  id: string
  display_name: string
  is_admin: boolean
  created_at: string
  avatar_config: Partial<AvatarConfig> | null
  user_id: string | null
}

type AdminMatch = {
  id: string
  played_at: string
  player_names: string[]
  score: string
  winner_names: string[]
}

type Tab = 'players' | 'matches'

export default function AdminPanel({
  players: initialPlayers,
  matches: initialMatches,
}: {
  players: AdminPlayer[]
  matches: AdminMatch[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('players')
  const [players, setPlayers] = useState(initialPlayers)
  const [matches, setMatches] = useState(initialMatches)
  const [editingName, setEditingName] = useState<string | null>(null) // player id
  const [nameDraft, setNameDraft] = useState('')
  const [busy, setBusy] = useState<string | null>(null) // id of item being operated on
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function savePlayerName(id: string) {
    if (!nameDraft.trim()) return
    setBusy(id)
    const res = await fetch(`/api/admin/players/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: nameDraft }),
    })
    setBusy(null)
    if (res.ok) {
      setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, display_name: nameDraft.trim() } : p))
      setEditingName(null)
      showToast('Name updated')
      router.refresh()
    } else {
      const j = await res.json()
      showToast(j.error ?? 'Failed', false)
    }
  }

  async function toggleAdmin(player: AdminPlayer) {
    setBusy(player.id)
    const res = await fetch(`/api/admin/players/${player.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: !player.is_admin }),
    })
    setBusy(null)
    if (res.ok) {
      setPlayers((prev) => prev.map((p) => p.id === player.id ? { ...p, is_admin: !p.is_admin } : p))
      showToast(`${player.display_name} ${!player.is_admin ? 'is now admin' : 'admin removed'}`)
    } else {
      const j = await res.json()
      showToast(j.error ?? 'Failed', false)
    }
  }

  async function deletePlayer(player: AdminPlayer) {
    if (!confirm(`Delete "${player.display_name}"? This will also remove all their match records. This cannot be undone.`)) return
    setBusy(player.id)
    const res = await fetch(`/api/admin/players/${player.id}`, { method: 'DELETE' })
    setBusy(null)
    if (res.ok) {
      setPlayers((prev) => prev.filter((p) => p.id !== player.id))
      showToast(`${player.display_name} deleted`)
      router.refresh()
    } else {
      const j = await res.json()
      showToast(j.error ?? 'Failed', false)
    }
  }

  async function deleteMatch(match: AdminMatch) {
    if (!confirm(`Delete this match (${match.player_names.join(' vs ')}, ${match.score} sets)? Cannot be undone.`)) return
    setBusy(match.id)
    const res = await fetch(`/api/admin/matches/${match.id}`, { method: 'DELETE' })
    setBusy(null)
    if (res.ok) {
      setMatches((prev) => prev.filter((m) => m.id !== match.id))
      showToast('Match deleted')
      router.refresh()
    } else {
      const j = await res.json()
      showToast(j.error ?? 'Failed', false)
    }
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="wii-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-wii-red/10 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-wii-text" style={{ fontFamily: 'var(--font-fredoka)' }}>
              Admin Panel
            </h1>
            <p className="text-xs text-wii-muted">{players.length} players · {matches.length} matches shown</p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`px-4 py-3 rounded-2xl text-sm font-semibold ${
            toast.ok ? 'bg-wii-green/15 text-wii-green border border-wii-green/20' : 'bg-wii-red/15 text-wii-red border border-wii-red/20'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {(['players', 'matches'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm capitalize transition-all cursor-pointer ${
                tab === t
                  ? 'bg-wii-green text-white shadow-lg shadow-wii-green/30'
                  : 'wii-card text-wii-muted hover:text-wii-text'
              }`}
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              {t === 'players' ? `👥 Players (${players.length})` : `🎾 Matches (${matches.length})`}
            </button>
          ))}
        </div>

        {/* Players tab */}
        {tab === 'players' && (
          <div className="wii-card overflow-hidden" style={{ padding: 0 }}>
            {players.map((player, i) => {
              const hasAvatar = player.avatar_config && Object.keys(player.avatar_config).length > 0
              const isEditing = editingName === player.id
              const isBusy = busy === player.id

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < players.length - 1 ? 'border-b border-white/50' : ''
                  } ${isBusy ? 'opacity-50' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}
                  >
                    {hasAvatar ? (
                      <AvatarSvg config={player.avatar_config!} size={40} showBody={false} />
                    ) : (
                      <div className="w-full h-full bg-wii-green flex items-center justify-center text-white text-xs font-bold">
                        {player.display_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name / editor */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') savePlayerName(player.id)
                            if (e.key === 'Escape') setEditingName(null)
                          }}
                          maxLength={40}
                          className="flex-1 text-sm font-semibold bg-white/60 border-2 border-wii-green rounded-xl px-2 py-1 outline-none"
                        />
                        <button onClick={() => savePlayerName(player.id)} className="text-wii-green font-bold text-xs px-2 py-1 rounded-lg hover:bg-wii-green/10 cursor-pointer">Save</button>
                        <button onClick={() => setEditingName(null)} className="text-wii-muted text-xs px-2 py-1 rounded-lg hover:bg-black/5 cursor-pointer">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-wii-text truncate">{player.display_name}</span>
                        {player.is_admin && (
                          <span className="text-[9px] font-bold bg-wii-red/10 text-wii-red px-1.5 py-0.5 rounded-full border border-wii-red/20">ADMIN</span>
                        )}
                        {!player.user_id && (
                          <span className="text-[9px] font-bold bg-wii-muted/10 text-wii-muted px-1.5 py-0.5 rounded-full">GUEST</span>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-wii-muted mt-0.5">
                      Joined {new Date(player.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit name */}
                      <button
                        onClick={() => { setEditingName(player.id); setNameDraft(player.display_name) }}
                        disabled={isBusy}
                        className="w-8 h-8 rounded-xl hover:bg-wii-blue/10 text-wii-muted hover:text-wii-blue flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit name"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {/* Toggle admin */}
                      <button
                        onClick={() => toggleAdmin(player)}
                        disabled={isBusy}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          player.is_admin ? 'hover:bg-wii-red/10 text-wii-red' : 'hover:bg-amber-500/10 text-wii-muted hover:text-amber-600'
                        }`}
                        title={player.is_admin ? 'Remove admin' : 'Make admin'}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deletePlayer(player)}
                        disabled={isBusy}
                        className="w-8 h-8 rounded-xl hover:bg-wii-red/10 text-wii-muted hover:text-wii-red flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete player"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Matches tab */}
        {tab === 'matches' && (
          <div className="wii-card overflow-hidden" style={{ padding: 0 }}>
            {matches.length === 0 ? (
              <div className="py-10 text-center text-wii-muted text-sm">No matches yet</div>
            ) : (
              matches.map((match, i) => {
                const isBusy = busy === match.id
                const date = new Date(match.played_at)

                return (
                  <div
                    key={match.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < matches.length - 1 ? 'border-b border-white/50' : ''
                    } ${isBusy ? 'opacity-50' : ''}`}
                  >
                    {/* Date */}
                    <div className="shrink-0 text-center w-10">
                      <p className="text-xs font-bold text-wii-text">{date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                      <p className="text-[10px] text-wii-muted">{date.getFullYear()}</p>
                    </div>

                    {/* Match info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-wii-text truncate">
                        {match.player_names.join(' · ')}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold bg-wii-green/10 text-wii-green px-2 py-0.5 rounded-full">
                          {match.score} sets
                        </span>
                        {match.winner_names.length > 0 && (
                          <span className="text-[10px] text-wii-muted truncate">
                            🏆 {match.winner_names.join(' & ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteMatch(match)}
                      disabled={isBusy}
                      className="w-8 h-8 rounded-xl hover:bg-wii-red/10 text-wii-muted hover:text-wii-red flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      title="Delete match"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>
    </div>
  )
}
