'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarSvg, {
  AvatarConfig,
  DEFAULT_AVATAR,
  SKIN_COLORS,
  HAIR_COLORS,
  SHIRT_COLORS,
  SKIN_COLOR_NAMES,
  HAIR_COLOR_NAMES,
  SHIRT_COLOR_NAMES,
  HAIR_STYLE_NAMES,
  EYE_NAMES,
  MOUTH_NAMES,
  ACCESSORY_NAMES,
  BODY_NAMES,
} from './AvatarSvg'

// ─── Category definitions ─────────────────────────────────────────────────────

type CategoryId = 'face' | 'hair' | 'eyes' | 'mouth' | 'body' | 'extras'

const CATEGORIES: { id: CategoryId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'face',
    label: 'Face',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    id: 'hair',
    label: 'Hair',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C8 2 5 5 5 9c0 2 .8 3.8 2 5 .5.6 1 1.2 1 2v1h8v-1c0-.8.5-1.4 1-2 1.2-1.2 2-3 2-5 0-4-3-7-7-7z" />
      </svg>
    ),
  },
  {
    id: 'eyes',
    label: 'Eyes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'mouth',
    label: 'Mouth',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    id: 'body',
    label: 'Body',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'extras',
    label: 'Extras',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
]

// ─── Sub-components for option grids ─────────────────────────────────────────

function SwatchGrid({
  colors,
  names,
  selected,
  onSelect,
}: {
  colors: string[]
  names: string[]
  selected: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((color, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all cursor-pointer ${
            selected === i
              ? 'bg-wii-green/12 ring-2 ring-wii-green ring-offset-1'
              : 'hover:bg-white/60'
          }`}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
            style={{ background: color }}
          />
          <span className="text-[9px] font-semibold text-wii-muted text-center leading-tight">
            {names[i]}
          </span>
        </button>
      ))}
    </div>
  )
}

function AvatarGrid({
  count,
  names,
  selected,
  onSelect,
  previewKey,
  config,
  cols = 4,
}: {
  count: number
  names: string[]
  selected: number
  onSelect: (i: number) => void
  previewKey: keyof AvatarConfig
  config: AvatarConfig
  cols?: number
}) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
            selected === i
              ? 'bg-wii-green/12 ring-2 ring-wii-green ring-offset-1'
              : 'hover:bg-white/60'
          }`}
        >
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}
          >
            <AvatarSvg config={{ ...config, [previewKey]: i }} size={48} showBody={false} />
          </div>
          <span className="text-[9px] font-semibold text-wii-muted text-center leading-tight line-clamp-1">
            {names[i]}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AvatarCreatorProps {
  initialConfig: Partial<AvatarConfig>
  onSaved?: () => void
}

export default function AvatarCreator({ initialConfig, onSaved }: AvatarCreatorProps) {
  const router = useRouter()
  const [config, setConfig] = useState<AvatarConfig>({ ...DEFAULT_AVATAR, ...initialConfig })
  const [active, setActive] = useState<CategoryId>('face')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof AvatarConfig, value: number) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_config: config }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to save avatar. Please try again.')
        setSaving(false)
        return
      }
      setSaved(true)
      router.refresh()
      onSaved?.()
    } catch {
      setError('Network error — check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* ── Live preview ─────────────────────────────────────────────────── */}
      <div
        className="wii-card relative flex flex-col items-center justify-end pt-6 pb-0 overflow-hidden"
        style={{ minHeight: 180 }}
      >
        {/* Gradient backdrop */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #B8D4EE 0%, transparent 70%)' }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <div
            className="rounded-full overflow-hidden shadow-xl border-4 border-white"
            style={{
              background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)',
              width: 120,
              height: 120,
            }}
          >
            <AvatarSvg config={config} size={120} showBody={true} />
          </div>
          <div className="mt-2 mb-3">
            <span
              className="text-xs font-bold text-wii-muted uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              Your Mii
            </span>
          </div>
        </div>
      </div>

      {/* ── Category pill tabs ────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all font-bold text-sm cursor-pointer ${
              active === cat.id
                ? 'bg-wii-green text-white shadow-lg shadow-wii-green/30'
                : 'wii-card text-wii-muted hover:text-wii-text'
            }`}
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            <span className={active === cat.id ? 'text-white' : 'text-wii-muted'}>
              {cat.icon}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Options panel ────────────────────────────────────────────────── */}
      <div className="wii-card p-4 space-y-5">

        {/* Face — skin tone */}
        {active === 'face' && (
          <>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
                Skin Tone
              </p>
              <SwatchGrid
                colors={SKIN_COLORS}
                names={SKIN_COLOR_NAMES}
                selected={config.skin}
                onSelect={(i) => set('skin', i)}
              />
            </div>
          </>
        )}

        {/* Hair — style + color */}
        {active === 'hair' && (
          <>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
                Hair Style
              </p>
              <AvatarGrid
                count={HAIR_STYLE_NAMES.length}
                names={HAIR_STYLE_NAMES}
                selected={config.hair_style}
                onSelect={(i) => set('hair_style', i)}
                previewKey="hair_style"
                config={config}
                cols={4}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
                Hair Colour
              </p>
              <SwatchGrid
                colors={HAIR_COLORS}
                names={HAIR_COLOR_NAMES}
                selected={config.hair_color}
                onSelect={(i) => set('hair_color', i)}
              />
            </div>
          </>
        )}

        {/* Eyes */}
        {active === 'eyes' && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
              Eye Style
            </p>
            <AvatarGrid
              count={EYE_NAMES.length}
              names={EYE_NAMES}
              selected={config.eyes}
              onSelect={(i) => set('eyes', i)}
              previewKey="eyes"
              config={config}
              cols={4}
            />
          </div>
        )}

        {/* Mouth */}
        {active === 'mouth' && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
              Mouth Style
            </p>
            <AvatarGrid
              count={MOUTH_NAMES.length}
              names={MOUTH_NAMES}
              selected={config.mouth}
              onSelect={(i) => set('mouth', i)}
              previewKey="mouth"
              config={config}
              cols={3}
            />
          </div>
        )}

        {/* Body — type + shirt color */}
        {active === 'body' && (
          <>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
                Body Type
              </p>
              <div className="grid grid-cols-3 gap-3">
                {BODY_NAMES.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => set('body', i)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all cursor-pointer ${
                      config.body === i
                        ? 'bg-wii-green/12 ring-2 ring-wii-green ring-offset-1'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden flex items-end justify-center"
                      style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}
                    >
                      <AvatarSvg config={{ ...config, body: i }} size={56} showBody={true} />
                    </div>
                    <span className="text-[9px] font-semibold text-wii-muted">{name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
                Shirt Colour
              </p>
              <SwatchGrid
                colors={SHIRT_COLORS}
                names={SHIRT_COLOR_NAMES}
                selected={config.shirt}
                onSelect={(i) => set('shirt', i)}
              />
            </div>
          </>
        )}

        {/* Extras — accessories */}
        {active === 'extras' && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-3">
              Accessory
            </p>
            <AvatarGrid
              count={ACCESSORY_NAMES.length}
              names={ACCESSORY_NAMES}
              selected={config.accessory}
              onSelect={(i) => set('accessory', i)}
              previewKey="accessory"
              config={config}
              cols={3}
            />
          </div>
        )}

      </div>

      {/* ── Error message ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-wii-red/10 border border-wii-red/20">
          <svg className="w-4 h-4 text-wii-red shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-wii-red font-semibold">{error}</p>
        </div>
      )}

      {/* ── Save button ───────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full wii-btn-primary text-white font-bold py-4 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
          saved
            ? 'bg-wii-green/80 shadow-wii-green/20'
            : 'bg-wii-green hover:bg-wii-green-dark shadow-wii-green/30'
        } ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{ fontFamily: 'var(--font-fredoka)', fontSize: '1.1rem' }}
      >
        {saving ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Saving…
          </>
        ) : saved ? (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved!
          </>
        ) : (
          'Save Avatar'
        )}
      </button>

    </div>
  )
}
