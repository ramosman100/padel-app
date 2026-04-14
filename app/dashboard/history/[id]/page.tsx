import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import WiiBadge from '@/components/ui/WiiBadge'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

type Participant = {
  player_id: string
  display_name: string
  avatar_config: Partial<AvatarConfig> | null
  partner_id: string | null
  partner_name: string | null
  partner_avatar: Partial<AvatarConfig> | null
  score_for: number
  score_against: number
  sets: { my: number; opp: number }[]
  won: boolean
}

function PlayerBubble({
  name,
  avatarConfig,
  playerId,
  size = 56,
}: {
  name: string
  avatarConfig: Partial<AvatarConfig> | null
  playerId: string
  size?: number
}) {
  const hasAvatar = avatarConfig && Object.keys(avatarConfig).length > 0
  return (
    <Link href={`/dashboard/profile/${playerId}`} className="flex flex-col items-center gap-1.5 group">
      <div
        className="rounded-full overflow-hidden border-3 border-white shadow-md group-hover:shadow-lg transition-shadow"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)',
          borderWidth: 3,
        }}
      >
        {hasAvatar ? (
          <AvatarSvg config={avatarConfig!} size={size} />
        ) : (
          <div
            className="w-full h-full bg-wii-green flex items-center justify-center text-white font-bold"
            style={{ fontSize: size * 0.28 }}
          >
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-xs font-semibold text-wii-text text-center max-w-[5rem] leading-tight group-hover:text-wii-green transition-colors">
        {name}
      </span>
    </Link>
  )
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: matchId } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch match metadata
  const { data: match } = await supabase
    .from('matches')
    .select('id, played_at')
    .eq('id', matchId)
    .single()

  if (!match) notFound()

  // Fetch all participants with player + partner info
  const { data: rawParticipants } = await supabase
    .from('match_players')
    .select(`
      player_id,
      partner_id,
      score_for,
      score_against,
      sets,
      won,
      players!match_players_player_id_fkey(id, display_name, avatar_config),
      partner:players!match_players_partner_id_fkey(id, display_name, avatar_config)
    `)
    .eq('match_id', matchId)

  if (!rawParticipants || rawParticipants.length === 0) notFound()

  type RawP = {
    player_id: string
    partner_id: string | null
    score_for: number
    score_against: number
    sets: unknown
    won: boolean
    players: unknown
    partner: unknown
  }

  function pickP(raw: unknown): { id: string; display_name: string; avatar_config: Partial<AvatarConfig> | null } | null {
    if (!raw) return null
    const p = Array.isArray(raw) ? raw[0] : raw
    if (!p) return null
    return p as { id: string; display_name: string; avatar_config: Partial<AvatarConfig> | null }
  }

  const participants: Participant[] = (rawParticipants as RawP[]).map((r) => {
    const pl = pickP(r.players)
    const pt = pickP(r.partner)
    return {
      player_id:    r.player_id,
      display_name: pl?.display_name ?? 'Unknown',
      avatar_config: pl?.avatar_config ?? null,
      partner_id:   r.partner_id,
      partner_name: pt?.display_name ?? null,
      partner_avatar: pt?.avatar_config ?? null,
      score_for:    r.score_for,
      score_against: r.score_against,
      sets:         (r.sets ?? []) as { my: number; opp: number }[],
      won:          r.won,
    }
  })

  // Split into two sides
  const winners = participants.filter((p) => p.won)
  const losers  = participants.filter((p) => !p.won)

  // Get set scores from first participant's perspective
  const refParticipant = winners[0] ?? participants[0]
  const sets = refParticipant?.sets ?? []
  const scoreFor = refParticipant?.score_for ?? 0
  const scoreAgainst = refParticipant?.score_against ?? 0

  const playedAt = new Date(match.played_at)
  const dateStr  = playedAt.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = playedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-sm mx-auto">

        {/* Back */}
        <div className="mb-5">
          <Link
            href="/dashboard/history"
            className="wii-card inline-flex px-3 py-2 text-sm font-bold text-wii-muted hover:text-wii-text transition-colors"
          >
            ← History
          </Link>
        </div>

        {/* Date card */}
        <div className="wii-card p-4 mb-3 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-wii-muted mb-0.5">Match</p>
          <p className="font-bold text-wii-text" style={{ fontFamily: 'var(--font-fredoka)' }}>{dateStr}</p>
          <p className="text-sm text-wii-muted">{timeStr}</p>
        </div>

        {/* Score hero card */}
        <div className="wii-card p-6 mb-3">
          {/* Team layouts */}
          <div className="flex items-center justify-between gap-4">
            {/* Winners */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="flex gap-3 justify-center flex-wrap">
                {winners.map((p) => (
                  <PlayerBubble
                    key={p.player_id}
                    name={p.display_name}
                    avatarConfig={p.avatar_config}
                    playerId={p.player_id}
                    size={52}
                  />
                ))}
              </div>
              <WiiBadge variant="win" />
            </div>

            {/* Score */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-5xl font-bold text-wii-green"
                  style={{ fontFamily: 'var(--font-fredoka)' }}
                >
                  {scoreFor}
                </span>
                <span className="text-2xl text-wii-muted font-bold">:</span>
                <span
                  className="text-5xl font-bold text-wii-red"
                  style={{ fontFamily: 'var(--font-fredoka)' }}
                >
                  {scoreAgainst}
                </span>
              </div>
              <span className="text-[10px] text-wii-muted font-semibold uppercase tracking-wider mt-1">sets</span>
            </div>

            {/* Losers */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="flex gap-3 justify-center flex-wrap">
                {losers.map((p) => (
                  <PlayerBubble
                    key={p.player_id}
                    name={p.display_name}
                    avatarConfig={p.avatar_config}
                    playerId={p.player_id}
                    size={52}
                  />
                ))}
              </div>
              <WiiBadge variant="loss" />
            </div>
          </div>
        </div>

        {/* Set-by-set breakdown */}
        {sets.length > 0 && (
          <div className="wii-card p-4 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">Set Scores</p>
            <div className="space-y-2">
              {sets.map((s, i) => {
                const winnerWon = s.my > s.opp
                const total = s.my + s.opp
                const winPct = total > 0 ? (s.my / total) * 100 : 50
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-wii-muted uppercase w-6 shrink-0">S{i + 1}</span>
                    {/* Bar */}
                    <div className="flex-1 h-6 rounded-full overflow-hidden bg-white/60 border border-white/80 flex">
                      <div
                        className={`h-full rounded-full transition-all ${winnerWon ? 'bg-wii-green' : 'bg-wii-red'}`}
                        style={{ width: `${winPct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-sm font-bold w-4 text-center ${winnerWon ? 'text-wii-green' : 'text-wii-red'}`}>
                        {s.my}
                      </span>
                      <span className="text-wii-muted text-xs">–</span>
                      <span className={`text-sm font-bold w-4 text-center ${!winnerWon ? 'text-wii-green' : 'text-wii-red'}`}>
                        {s.opp}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All participants list */}
        <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3 border-b border-white/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">Players</p>
          </div>
          {participants.map((p, i) => (
            <Link
              key={p.player_id}
              href={`/dashboard/profile/${p.player_id}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-white/40 transition-colors ${
                i < participants.length - 1 ? 'border-b border-white/50' : ''
              }`}
            >
              <div
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}
              >
                {p.avatar_config && Object.keys(p.avatar_config).length > 0 ? (
                  <AvatarSvg config={p.avatar_config} size={36} />
                ) : (
                  <div className="w-full h-full bg-wii-green flex items-center justify-center text-white font-bold text-xs">
                    {p.display_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-wii-text truncate">{p.display_name}</p>
                {p.partner_name && (
                  <p className="text-[11px] text-wii-muted">with {p.partner_name}</p>
                )}
              </div>
              <WiiBadge variant={p.won ? 'win' : 'loss'} />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
