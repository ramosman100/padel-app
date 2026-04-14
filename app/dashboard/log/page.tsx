'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import PlayerInput from '@/components/PlayerInput'
import WiiBadge from '@/components/ui/WiiBadge'
import type { PlayerValue } from '@/lib/types'

type Player = { id: string; display_name: string }
type SetScore = { my: string; opp: string }

export default function LogMatchPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [players, setPlayers] = useState<Player[]>([])
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)

  const [myPartner, setMyPartner] = useState<PlayerValue | null>(null)
  const [opp1, setOpp1] = useState<PlayerValue | null>(null)
  const [opp2, setOpp2] = useState<PlayerValue | null>(null)

  const [sets, setSets] = useState<SetScore[]>([{ my: '', opp: '' }])
  const [playedAt, setPlayedAt] = useState(() => new Date().toISOString().slice(0, 16))

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let { data: player } = await supabase
        .from('players')
        .select('id, display_name')
        .eq('user_id', user.id)
        .single()

      if (!player) {
        const displayName =
          user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Player'
        const { data: created } = await supabase
          .from('players')
          .insert({ user_id: user.id, display_name: displayName })
          .select('id, display_name')
          .single()
        player = created
      }

      if (player) setMyPlayer(player)

      const { data } = await supabase
        .from('players')
        .select('id, display_name')
        .order('display_name')
      setPlayers(data ?? [])
    }
    load()
  }, [supabase])

  function updateSet(i: number, field: 'my' | 'opp', val: string) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)))
  }

  const completeSets = sets.filter((s) => s.my !== '' && s.opp !== '')
  const setsWon = completeSets.filter((s) => parseInt(s.my) > parseInt(s.opp)).length
  const setsLost = completeSets.filter((s) => parseInt(s.opp) > parseInt(s.my)).length
  const hasResult = setsWon > 0 || setsLost > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!opp1) { setError('Select at least one opponent.'); return }
    if (completeSets.length === 0) { setError('Add at least one set score.'); return }

    setLoading(true)
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        played_at: new Date(playedAt).toISOString(),
        my_partner: myPartner,
        opp1,
        opp2,
        sets: completeSets.map((s) => ({ my: parseInt(s.my), opp: parseInt(s.opp) })),
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  const selectedIds = [
    myPlayer?.id,
    myPartner?.type === 'existing' ? myPartner.id : undefined,
    opp1?.type === 'existing' ? opp1.id : undefined,
    opp2?.type === 'existing' ? opp2.id : undefined,
  ].filter(Boolean) as string[]

  const otherPlayers = players.filter((p) => p.id !== myPlayer?.id)

  if (success) {
    const won = setsWon > setsLost
    const lost = setsLost > setsWon
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="wii-card p-10 text-center max-w-sm w-full">
          <div className="text-6xl mb-4">{won ? '🏆' : lost ? '😤' : '🤝'}</div>
          <h2
            className="text-2xl font-bold text-wii-text mb-2"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            Match saved!
          </h2>
          <p className="text-wii-muted text-sm mb-6">
            {won ? 'You won this one. Nice!' : lost ? 'Better luck next time.' : 'What a draw!'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95"
            >
              See rankings
            </button>
            <button
              onClick={() => { setSuccess(false); setSets([{ my: '', opp: '' }]); setOpp1(null); setOpp2(null); setMyPartner(null) }}
              className="bg-white/70 border border-white/80 text-wii-text font-bold px-6 py-3 rounded-full shadow-sm transition-all active:scale-95 hover:bg-white/90"
            >
              Log another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-md mx-auto">
        <h1
          className="text-3xl font-bold text-wii-text mb-5 px-1"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Log a Match
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-wii-red/10 border border-wii-red/25 text-wii-red text-sm rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Date */}
          <div className="wii-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-2">
              Date & Time
            </p>
            <input
              type="datetime-local"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="w-full text-sm text-wii-text bg-transparent focus:outline-none"
            />
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            {/* My Team */}
            <div className="wii-card p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">
                Your Team
              </p>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-1.5">You</p>
                <div className="flex items-center gap-2 bg-white/60 border border-white/80 rounded-2xl px-3 py-2">
                  <div className="w-5 h-5 rounded-full bg-wii-green flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {myPlayer?.display_name.slice(0, 1).toUpperCase() ?? '?'}
                  </div>
                  <span className="text-sm font-semibold text-wii-text truncate">
                    {myPlayer?.display_name ?? '…'}
                  </span>
                </div>
              </div>

              <PlayerInput
                label="Partner"
                players={otherPlayers}
                value={myPartner}
                onChange={setMyPartner}
                placeholder="Optional"
                excludeIds={selectedIds}
              />
            </div>

            {/* Opponents */}
            <div className="wii-card p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">
                Opponents
              </p>
              <PlayerInput
                label="Opponent 1"
                players={otherPlayers}
                value={opp1}
                onChange={setOpp1}
                required
                placeholder="Required"
                excludeIds={selectedIds}
              />
              <PlayerInput
                label="Opponent 2"
                players={otherPlayers}
                value={opp2}
                onChange={setOpp2}
                placeholder="Optional"
                excludeIds={selectedIds}
              />
            </div>
          </div>

          {/* Set Scores */}
          <div className="wii-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">
                Set Scores
              </p>
              {hasResult && (
                <WiiBadge variant={setsWon > setsLost ? 'win' : setsLost > setsWon ? 'loss' : 'draw'}>
                  {setsWon > setsLost ? 'WIN' : setsLost > setsWon ? 'LOSS' : 'DRAW'} {setsWon}–{setsLost}
                </WiiBadge>
              )}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2.5rem_1fr_1rem_1fr_1.5rem] gap-1.5 mb-1.5 px-0.5">
              <div />
              <p className="text-[10px] text-center text-wii-muted font-bold uppercase tracking-wide">You</p>
              <div />
              <p className="text-[10px] text-center text-wii-muted font-bold uppercase tracking-wide">Them</p>
              <div />
            </div>

            <div className="space-y-2">
              {sets.map((s, i) => {
                const myNum = parseInt(s.my)
                const oppNum = parseInt(s.opp)
                const complete = s.my !== '' && s.opp !== ''
                const iWon = complete && myNum > oppNum
                const iLost = complete && oppNum > myNum

                return (
                  <div key={i} className="grid grid-cols-[2.5rem_1fr_1rem_1fr_1.5rem] gap-1.5 items-center">
                    <span className="text-[10px] text-wii-muted font-bold text-right pr-1 uppercase">
                      S{i + 1}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={7}
                      value={s.my}
                      onChange={(e) => updateSet(i, 'my', e.target.value)}
                      placeholder="0"
                      className={`w-full rounded-2xl px-2 py-2 text-center text-sm font-bold focus:outline-none focus:ring-2 transition-all border ${
                        iWon
                          ? 'bg-wii-green/10 text-wii-green border-wii-green/30 focus:ring-wii-green/30'
                          : iLost
                          ? 'bg-wii-red/10 text-wii-red border-wii-red/30 focus:ring-wii-red/30'
                          : 'bg-white/60 text-wii-text border-white/80 focus:ring-wii-green/30'
                      }`}
                    />
                    <span className="text-wii-muted font-bold text-center text-xs">:</span>
                    <input
                      type="number"
                      min={0}
                      max={7}
                      value={s.opp}
                      onChange={(e) => updateSet(i, 'opp', e.target.value)}
                      placeholder="0"
                      className={`w-full rounded-2xl px-2 py-2 text-center text-sm font-bold focus:outline-none focus:ring-2 transition-all border ${
                        iLost
                          ? 'bg-wii-red/10 text-wii-red border-wii-red/30 focus:ring-wii-red/30'
                          : iWon
                          ? 'bg-wii-green/10 text-wii-green border-wii-green/30 focus:ring-wii-green/30'
                          : 'bg-white/60 text-wii-text border-white/80 focus:ring-wii-green/30'
                      }`}
                    />
                    {sets.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setSets((prev) => prev.filter((_, idx) => idx !== i))}
                        className="w-5 h-5 rounded-full bg-white/70 hover:bg-wii-red/15 text-wii-muted hover:text-wii-red flex items-center justify-center text-xs font-bold transition-colors border border-white/80"
                      >
                        ×
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                )
              })}
            </div>

            {sets.length < 5 && (
              <button
                type="button"
                onClick={() => setSets((prev) => [...prev, { my: '', opp: '' }])}
                className="mt-3 w-full text-wii-green text-sm font-bold py-2 rounded-2xl hover:bg-wii-green/8 transition-colors"
              >
                + Add Set
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold text-base py-4 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Saving…' : 'Save Match'}
          </button>
        </form>
      </div>
    </div>
  )
}
