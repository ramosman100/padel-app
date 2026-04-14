import AvatarSvg from '@/components/avatar/AvatarSvg'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'
import RsvpButtons from './RsvpButtons'

type RsvpStatus = 'going' | 'maybe' | 'not_going'

interface Rsvp {
  player_id: string
  status: RsvpStatus
  players: { display_name: string; avatar_config: Partial<AvatarConfig> | null } | null
}

interface GameEvent {
  id: string
  title: string
  scheduled_at: string
  court: string | null
  notes: string | null
  max_players: number
  players: { display_name: string; avatar_config: Partial<AvatarConfig> | null } | null
  event_rsvps: Rsvp[]
}

interface EventCardProps {
  event: GameEvent
  myPlayerId: string | null
}

function formatEventDate(iso: string): { day: string; month: string; time: string; weekday: string } {
  const d = new Date(iso)
  return {
    day:     d.getDate().toString(),
    month:   d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    time:    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    weekday: d.toLocaleDateString(undefined, { weekday: 'long' }),
  }
}

function PlayerPip({ rsvp }: { rsvp: Rsvp }) {
  const cfg = rsvp.players?.avatar_config
  const name = rsvp.players?.display_name ?? '?'
  const hasAvatar = cfg && Object.keys(cfg).length > 0

  const borderColor =
    rsvp.status === 'going'     ? 'border-wii-green' :
    rsvp.status === 'maybe'     ? 'border-wii-gold'  :
                                  'border-wii-red'

  return (
    <div
      className={`w-8 h-8 rounded-full overflow-hidden border-2 ${borderColor} shadow-sm shrink-0`}
      title={`${name} — ${rsvp.status.replace('_', ' ')}`}
      style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}
    >
      {hasAvatar ? (
        <AvatarSvg config={cfg!} size={32} />
      ) : (
        <div className="w-full h-full bg-wii-green flex items-center justify-center text-white font-bold text-[10px]">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default function EventCard({ event, myPlayerId }: EventCardProps) {
  const { day, month, time, weekday } = formatEventDate(event.scheduled_at)
  const going    = event.event_rsvps.filter((r) => r.status === 'going')
  const maybe    = event.event_rsvps.filter((r) => r.status === 'maybe')
  const spots    = Math.max(0, event.max_players - going.length)
  const myRsvp   = event.event_rsvps.find((r) => r.player_id === myPlayerId)
  const isFull   = going.length >= event.max_players

  return (
    <div className="wii-card p-4">
      <div className="flex gap-4">

        {/* Date badge */}
        <div className="flex flex-col items-center justify-center bg-wii-blue/10 rounded-2xl px-3 py-2 shrink-0 min-w-[3.5rem]">
          <span className="text-[10px] font-bold text-wii-blue uppercase tracking-wide">{month}</span>
          <span className="text-2xl font-bold text-wii-blue leading-none" style={{ fontFamily: 'var(--font-nunito)' }}>
            {day}
          </span>
        </div>

        {/* Event info */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-wii-text text-base leading-tight truncate"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <span className="text-xs text-wii-muted">{weekday} · {time}</span>
            {event.court && (
              <span className="text-xs text-wii-muted">📍 {event.court}</span>
            )}
          </div>

          {event.notes && (
            <p className="text-xs text-wii-muted mt-1.5 line-clamp-2">{event.notes}</p>
          )}

          {/* Player pips */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {[...going, ...maybe].slice(0, 8).map((r) => (
              <PlayerPip key={r.player_id} rsvp={r} />
            ))}
            {spots > 0 && !isFull && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-wii-muted/40 text-[10px] text-wii-muted font-bold shrink-0">
                +{spots}
              </div>
            )}
            {isFull && (
              <span className="text-[10px] font-bold text-wii-red bg-wii-red/10 px-2 py-0.5 rounded-full">
                Full
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RSVP bar — only for logged-in players */}
      {myPlayerId && (
        <div className="mt-3 pt-3 border-t border-white/60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">
              Are you going?
            </span>
            <RsvpButtons eventId={event.id} currentStatus={myRsvp?.status ?? null} />
          </div>
        </div>
      )}
    </div>
  )
}
