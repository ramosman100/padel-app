'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DisplayNameEditor({ initialName }: { initialName: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [draft, setDraft] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function handleSave() {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === name) { setEditing(false); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to save')
        setSaving(false)
        return
      }
      setName(json.display_name ?? trimmed)
      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setDraft(name); setEditing(false); setError(null) }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={40}
            className="flex-1 min-w-0 text-xl font-bold text-wii-text bg-white/60 border-2 border-wii-blue rounded-xl px-3 py-1 outline-none focus:border-wii-green transition-colors"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 w-9 h-9 rounded-xl bg-wii-green text-white font-bold flex items-center justify-center shadow transition-all active:scale-95 disabled:opacity-50"
            aria-label="Save"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <button
            onClick={() => { setDraft(name); setEditing(false); setError(null) }}
            className="shrink-0 w-9 h-9 rounded-xl bg-white/60 border border-white/80 text-wii-muted flex items-center justify-center shadow transition-all active:scale-95"
            aria-label="Cancel"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && <p className="text-xs text-wii-red font-semibold px-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <h1
        className="text-xl font-bold text-wii-text truncate"
        style={{ fontFamily: 'var(--font-fredoka)' }}
      >
        {name}
      </h1>
      <button
        onClick={() => { setDraft(name); setEditing(true); setError(null) }}
        className="shrink-0 w-7 h-7 rounded-lg bg-white/60 border border-white/80 text-wii-muted hover:text-wii-blue hover:border-wii-blue/40 flex items-center justify-center transition-all cursor-pointer"
        aria-label="Edit name"
        title="Edit display name"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  )
}
