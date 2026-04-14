'use client'

import { useState, useRef, useEffect } from 'react'
import type { PlayerValue } from '@/lib/types'

type Player = { id: string; display_name: string }

interface Props {
  label: string
  players: Player[]
  value: PlayerValue | null
  onChange: (v: PlayerValue | null) => void
  required?: boolean
  placeholder?: string
  excludeIds?: string[]
}

export default function PlayerInput({
  label,
  players,
  value,
  onChange,
  required,
  placeholder = 'Search or add…',
  excludeIds = [],
}: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = players
    .filter((p) => !excludeIds.includes(p.id))
    .filter((p) => p.display_name.toLowerCase().includes(query.toLowerCase()))

  const exactMatch = filtered.some(
    (p) => p.display_name.toLowerCase() === query.trim().toLowerCase()
  )
  const showAddNew = query.trim().length > 1 && !exactMatch

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (value) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-1.5">{label}</p>
        <div className="flex items-center gap-2 bg-white/60 border border-white/80 rounded-2xl px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-wii-green flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {value.display_name.slice(0, 1).toUpperCase()}
          </div>
          <span className="flex-1 text-sm font-semibold text-wii-text truncate">
            {value.display_name}
          </span>
          {value.type === 'new' && (
            <span className="text-[10px] bg-wii-blue/15 text-wii-blue px-1.5 py-0.5 rounded-full font-bold shrink-0">
              NEW
            </span>
          )}
          <button
            type="button"
            onClick={() => { onChange(null); setQuery('') }}
            className="text-wii-muted hover:text-wii-red text-lg leading-none shrink-0 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-1.5">{label}</p>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/60 border border-white/80 rounded-2xl px-3 py-2 text-sm text-wii-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-wii-green/40 transition-all"
      />

      {open && (filtered.length > 0 || showAddNew) && (
        <div className="absolute z-20 top-full mt-1.5 w-full wii-card rounded-2xl overflow-hidden" style={{ padding: 0 }}>
          {filtered.slice(0, 5).map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => {
                onChange({ type: 'existing', id: p.id, display_name: p.display_name })
                setOpen(false)
                setQuery('')
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-wii-green/8 text-left transition-colors border-b border-white/50 last:border-0"
            >
              <div className="w-6 h-6 rounded-full bg-wii-green/20 flex items-center justify-center text-wii-green text-[11px] font-bold shrink-0">
                {p.display_name.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-sm text-wii-text font-medium">{p.display_name}</span>
            </button>
          ))}
          {showAddNew && (
            <button
              type="button"
              onMouseDown={() => {
                onChange({ type: 'new', display_name: query.trim() })
                setOpen(false)
                setQuery('')
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-wii-green/10 text-left border-t border-white/60 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-wii-green flex items-center justify-center text-white text-sm font-bold shrink-0">
                +
              </div>
              <span className="text-sm text-wii-green font-bold">
                Add &ldquo;{query.trim()}&rdquo;
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
