'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type RsvpStatus = 'going' | 'maybe' | 'not_going'

interface RsvpButtonsProps {
  eventId: string
  currentStatus: RsvpStatus | null
}

const OPTIONS: { status: RsvpStatus; label: string; emoji: string; activeClass: string }[] = [
  { status: 'going',     label: 'Going',    emoji: '✓', activeClass: 'bg-wii-green text-white shadow-wii-green/30' },
  { status: 'maybe',     label: 'Maybe',    emoji: '?', activeClass: 'bg-wii-gold text-white shadow-wii-gold/30' },
  { status: 'not_going', label: 'Can\'t',   emoji: '✕', activeClass: 'bg-wii-red text-white shadow-wii-red/30' },
]

export default function RsvpButtons({ eventId, currentStatus }: RsvpButtonsProps) {
  const [selected, setSelected] = useState<RsvpStatus | null>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleRsvp(status: RsvpStatus) {
    // Optimistic update
    setSelected(status)

    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      // Revert on failure
      setSelected(currentStatus)
      return
    }

    startTransition(() => router.refresh())
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => {
        const isActive = selected === opt.status
        return (
          <button
            key={opt.status}
            onClick={() => handleRsvp(opt.status)}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm ${
              isActive
                ? `${opt.activeClass} shadow-md`
                : 'bg-white/70 text-wii-muted border border-white/80 hover:bg-white/90'
            }`}
          >
            <span>{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
