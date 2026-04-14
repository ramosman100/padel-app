'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()

  const defaultDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(18, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  })()

  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState(defaultDate)
  const [court, setCourt] = useState('')
  const [notes, setNotes] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        scheduled_at: new Date(scheduledAt).toISOString(),
        court: court || undefined,
        notes: notes || undefined,
        max_players: maxPlayers,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    router.push('/dashboard/calendar')
    router.refresh()
  }

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/dashboard/calendar"
            className="wii-card px-3 py-2 text-sm font-bold text-wii-muted hover:text-wii-text transition-colors"
          >
            ← Back
          </Link>
          <h1
            className="text-2xl font-bold text-wii-text"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            New Game
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-wii-red/10 border border-wii-red/25 text-wii-red text-sm rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="wii-card p-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-2">
              Game title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saturday padel session"
              className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-2.5 text-sm text-wii-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-wii-green/40 transition-all"
            />
          </div>

          {/* Date & Time */}
          <div className="wii-card p-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-sm text-wii-text bg-transparent focus:outline-none"
            />
          </div>

          {/* Court */}
          <div className="wii-card p-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-2">
              Court / Location <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              placeholder="e.g. Club Padel Court 2"
              className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-2.5 text-sm text-wii-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-wii-green/40 transition-all"
            />
          </div>

          {/* Max players */}
          <div className="wii-card p-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
              Max players
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxPlayers(n)}
                  className={`flex-1 py-2 rounded-2xl text-sm font-bold transition-all ${
                    maxPlayers === n
                      ? 'bg-wii-green text-white shadow-md shadow-wii-green/30'
                      : 'bg-white/60 border border-white/80 text-wii-muted hover:text-wii-text'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="wii-card p-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-2">
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra info…"
              rows={2}
              className="w-full bg-white/60 border border-white/80 rounded-2xl px-4 py-2.5 text-sm text-wii-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-wii-green/40 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold py-4 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Scheduling…' : 'Schedule Game'}
          </button>
        </form>

      </div>
    </div>
  )
}
