import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import EventCard from '@/components/calendar/EventCard'
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

export default async function CalendarPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get the player id for RSVP matching
  let myPlayerId: string | null = null
  if (user) {
    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()
    myPlayerId = player?.id ?? null
  }

  const { data: rawEvents } = await supabase
    .from('game_events')
    .select(`
      id, title, scheduled_at, court, notes, max_players,
      players!game_events_created_by_fkey(display_name, avatar_config),
      event_rsvps(player_id, status, players!event_rsvps_player_id_fkey(display_name, avatar_config))
    `)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  const events = (rawEvents as RawEvent[] ?? []).map((e) => ({
    ...e,
    players: normalisePlayer(e.players),
    event_rsvps: e.event_rsvps.map((r) => ({
      ...r,
      players: normalisePlayer(r.players),
    })),
  }))

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1
            className="text-3xl font-bold text-wii-text"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            Calendar
          </h1>
          {user && (
            <Link
              href="/dashboard/calendar/new"
              className="wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold px-4 py-2 rounded-full shadow-md shadow-wii-green/30 transition-all active:scale-95 text-sm"
            >
              + New Game
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="wii-card p-10 text-center">
            <div className="text-5xl mb-4">📅</div>
            <p
              className="font-bold text-wii-text text-lg mb-1"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              Nothing scheduled yet
            </p>
            <p className="text-wii-muted text-sm mb-5">
              Be the first to organise a game!
            </p>
            {user ? (
              <Link
                href="/dashboard/calendar/new"
                className="inline-block wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95"
              >
                Schedule a game
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-block wii-btn-primary bg-wii-blue hover:bg-wii-blue-dark text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-wii-blue/30 transition-all active:scale-95"
              >
                Sign in to schedule
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} myPlayerId={myPlayerId} />
            ))}

            {user && (
              <div className="pt-1 pb-2 text-center">
                <Link
                  href="/dashboard/calendar/new"
                  className="inline-block text-sm font-bold text-wii-green hover:underline"
                >
                  + Schedule another game
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
