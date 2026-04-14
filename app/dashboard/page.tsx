import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import EventCard from '@/components/calendar/EventCard'
import WiiBadge from '@/components/ui/WiiBadge'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

export const revalidate = 0

type RsvpStatus = 'going' | 'maybe' | 'not_going'

interface RawRsvp {
  player_id: string
  status: RsvpStatus
  players: { display_name: string; avatar_config: Partial<AvatarConfig> | null } | { display_name: string; avatar_config: Partial<AvatarConfig> | null }[] | null
}

interface RawEvent {
  id: string
  title: string
  scheduled_at: string
  court: string | null
  notes: string | null
  max_players: number
  players: { display_name: string; avatar_config: Partial<AvatarConfig> | null } | { display_name: string; avatar_config: Partial<AvatarConfig> | null }[] | null
  event_rsvps: RawRsvp[]
}

function normalisePlayer(raw: unknown) {
  if (!raw) return null
  if (Array.isArray(raw)) return (raw[0] ?? null) as { display_name: string; avatar_config: Partial<AvatarConfig> | null } | null
  return raw as { display_name: string; avatar_config: Partial<AvatarConfig> | null }
}

// ─── Wii Channel tile ────────────────────────────────────────────────────────

function Channel({
  href,
  emoji,
  title,
  subtitle,
  color,
  delay = 0,
}: {
  href: string
  emoji: string
  title: string
  subtitle: string
  color: string
  delay?: number
}) {
  return (
    <Link
      href={href}
      className="wii-channel p-5 flex flex-col gap-3 animate-wii-pop"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon bubble */}
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-md text-2xl`}>
        {emoji}
      </div>
      <div>
        <p
          className="font-bold text-wii-text text-base leading-tight"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          {title}
        </p>
        <p className="text-[11px] text-wii-muted mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: player } = await supabase
    .from('players')
    .select('id, display_name, avatar_config')
    .eq('user_id', user.id)
    .single()

  const myPlayerId = player?.id ?? null

  // Next 2 upcoming events
  const { data: rawEvents } = await supabase
    .from('game_events')
    .select(`
      id, title, scheduled_at, court, notes, max_players,
      players!game_events_created_by_fkey(display_name, avatar_config),
      event_rsvps(player_id, status, players!event_rsvps_player_id_fkey(display_name, avatar_config))
    `)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(2)

  const events = (rawEvents as RawEvent[] ?? []).map((e) => ({
    ...e,
    players: normalisePlayer(e.players),
    event_rsvps: e.event_rsvps.map((r) => ({ ...r, players: normalisePlayer(r.players) })),
  }))

  // Last 4 matches
  const { data: recentMatches } = await supabase
    .from('match_players')
    .select('won, score_for, score_against, sets, matches(played_at)')
    .eq('player_id', myPlayerId ?? '')
    .order('match_id', { ascending: false })
    .limit(4)

  const avatarConfig = player?.avatar_config as Partial<AvatarConfig> | null
  const hasAvatar = avatarConfig && Object.keys(avatarConfig).length > 0
  const firstName = player?.display_name?.split(' ')[0] ?? 'Player'

  // Quick stats
  const played  = recentMatches?.length ?? 0
  const wins    = recentMatches?.filter((m) => m.won).length ?? 0

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto space-y-6">

        {/* ── Greeting card ──────────────────────────────────────────────── */}
        <div className="wii-channel p-5 flex items-center gap-4 animate-fade-in-up">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-lg border-3 border-white"
            style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)', borderWidth: '3px', borderColor: 'white' }}
          >
            {hasAvatar ? (
              <AvatarSvg config={avatarConfig!} size={64} />
            ) : (
              <div
                className="w-full h-full bg-gradient-to-br from-wii-green to-wii-blue flex items-center justify-center text-white font-bold text-xl"
                style={{ fontFamily: 'var(--font-fredoka)' }}
              >
                {player?.display_name?.slice(0, 2).toUpperCase() ?? '??'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold text-wii-text leading-tight truncate"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              Hey, {firstName}!
            </h1>
            <p className="text-sm text-wii-muted">
              {played > 0
                ? `${wins}W / ${played - wins}L in recent matches`
                : 'Ready to play?'}
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="shrink-0 text-wii-muted hover:text-wii-text transition-colors text-xl"
            aria-label="Go to profile"
          >
            ›
          </Link>
        </div>

        {/* ── Wii Channel Grid ───────────────────────────────────────────── */}
        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest text-wii-muted mb-3 px-1"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            Channels
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Channel href="/dashboard/log"          emoji="🎾" title="Log Match"        subtitle="Record your result"          color="bg-wii-green/15"  delay={0}   />
            <Channel href="/dashboard/calendar/new" emoji="📅" title="Schedule Game"    subtitle="Pick a date & invite"        color="bg-wii-blue/15"   delay={60}  />
            <Channel href="/"                       emoji="🏆" title="Rankings"         subtitle="See who's on top"            color="bg-amber-400/20"  delay={120} />
            <Channel href="/dashboard/history"      emoji="📖" title="Match History"    subtitle="Browse all results"          color="bg-wii-gold/15"   delay={180} />
            <Channel href="/dashboard/calendar"     emoji="🗓" title="Calendar"         subtitle="Upcoming games"              color="bg-purple-400/15" delay={240} />
            <Channel href="/dashboard/profile"      emoji="👤" title="My Profile"       subtitle="Stats & avatar"              color="bg-pink-400/15"   delay={300} />
          </div>
        </div>

        {/* ── Upcoming games ─────────────────────────────────────────────── */}
        {events.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p
                className="text-xs font-bold uppercase tracking-widest text-wii-muted"
                style={{ fontFamily: 'var(--font-fredoka)' }}
              >
                Next Up
              </p>
              <Link href="/dashboard/calendar" className="text-xs font-bold text-wii-blue hover:underline">
                All games
              </Link>
            </div>
            <div className="space-y-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} myPlayerId={myPlayerId} />
              ))}
            </div>
          </div>
        )}

        {/* ── Recent results ─────────────────────────────────────────────── */}
        {recentMatches && recentMatches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p
                className="text-xs font-bold uppercase tracking-widest text-wii-muted"
                style={{ fontFamily: 'var(--font-fredoka)' }}
              >
                Recent Results
              </p>
              <Link href="/dashboard/history" className="text-xs font-bold text-wii-blue hover:underline">
                Full history
              </Link>
            </div>

            <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
              {recentMatches.map((m, i) => {
                const sets = (m.sets ?? []) as { my: number; opp: number }[]
                const matchData = m.matches as unknown as { played_at: string } | null
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3.5 ${i < recentMatches.length - 1 ? 'border-b border-white/50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <WiiBadge variant={m.won ? 'win' : 'loss'} />
                      <div>
                        <p className="text-sm font-bold text-wii-text">{m.score_for}–{m.score_against} sets</p>
                        {sets.length > 0 && (
                          <p className="text-[11px] text-wii-muted">{sets.map((s) => `${s.my}:${s.opp}`).join('  ')}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-wii-muted font-medium">
                      {matchData?.played_at
                        ? new Date(matchData.played_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
