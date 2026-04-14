import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import WiiBadge from '@/components/ui/WiiBadge'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: playerId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: player } = await supabase
    .from('players')
    .select('id, display_name, avatar_config, created_at')
    .eq('id', playerId)
    .single()

  if (!player) notFound()

  const { data: matchPlayers } = await supabase
    .from('match_players')
    .select('won, score_for, score_against, sets, match_id, matches(played_at)')
    .eq('player_id', playerId)
    .order('match_id', { ascending: false })
    .limit(20)

  const played  = matchPlayers?.length ?? 0
  const wins    = matchPlayers?.filter((m) => m.won).length ?? 0
  const losses  = played - wins
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0

  const avatarConfig = player.avatar_config as Partial<AvatarConfig> | null
  const hasAvatar = avatarConfig && Object.keys(avatarConfig).length > 0
  const initials  = player.display_name.slice(0, 2).toUpperCase()

  const memberSince = new Date(player.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long',
  })

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Back */}
        <Link
          href="/dashboard/history"
          className="wii-card inline-flex px-3 py-2 text-sm font-bold text-wii-muted hover:text-wii-text transition-colors"
        >
          ← Back
        </Link>

        {/* Profile header */}
        <div className="wii-card p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden shadow-lg shrink-0"
              style={{
                background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)',
                border: '3px solid white',
              }}
            >
              {hasAvatar ? (
                <AvatarSvg config={avatarConfig!} size={80} />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-br from-wii-green to-wii-blue flex items-center justify-center text-white font-bold text-2xl"
                  style={{ fontFamily: 'var(--font-fredoka)' }}
                >
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl font-bold text-wii-text truncate"
                style={{ fontFamily: 'var(--font-fredoka)' }}
              >
                {player.display_name}
              </h1>
              <p className="text-xs text-wii-muted mt-0.5">Member since {memberSince}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Played', value: played,        color: 'text-wii-text' },
            { label: 'Wins',   value: wins,           color: 'text-wii-green' },
            { label: 'Losses', value: losses,         color: 'text-wii-red' },
            { label: 'Win %',  value: `${winRate}%`,  color: winRate >= 50 ? 'text-wii-green' : 'text-wii-red' },
          ].map((s) => (
            <div key={s.label} className="wii-card p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: 'var(--font-fredoka)' }}>
                {s.value}
              </p>
              <p className="text-[10px] text-wii-muted mt-0.5 font-semibold uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Recent matches */}
        <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3 border-b border-white/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">Recent Matches</p>
          </div>

          {!matchPlayers || matchPlayers.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-wii-muted text-sm">No matches yet.</p>
            </div>
          ) : (
            <div>
              {matchPlayers.map((m, i) => {
                const sets = (m.sets ?? []) as { my: number; opp: number }[]
                const matchData = m.matches as unknown as { played_at: string } | null
                const playedAt = matchData?.played_at
                return (
                  <Link
                    key={i}
                    href={`/dashboard/history/${m.match_id}`}
                    className={`flex items-center justify-between px-4 py-3.5 hover:bg-white/40 transition-colors ${
                      i < matchPlayers.length - 1 ? 'border-b border-white/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <WiiBadge variant={m.won ? 'win' : 'loss'} />
                      <div>
                        <p className="text-sm font-bold text-wii-text">
                          {m.score_for}–{m.score_against} sets
                        </p>
                        {sets.length > 0 && (
                          <p className="text-[11px] text-wii-muted">
                            {sets.map((s) => `${s.my}:${s.opp}`).join('  ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-wii-muted font-medium">
                        {playedAt
                          ? new Date(playedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : ''}
                      </span>
                      <span className="text-wii-muted text-sm">›</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
