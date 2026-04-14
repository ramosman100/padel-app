import React from 'react'

export type AvatarConfig = {
  skin: number        // 0-7
  hair_style: number  // 0-11
  hair_color: number  // 0-7
  eyes: number        // 0-7
  mouth: number       // 0-5
  accessory: number   // 0-4 (0 = none)
  body: number        // 0-2 (0=slim, 1=regular, 2=athletic)
  shirt: number       // 0-5
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 0,
  hair_style: 0,
  hair_color: 0,
  eyes: 0,
  mouth: 0,
  accessory: 0,
  body: 1,
  shirt: 0,
}

export const SKIN_COLORS = [
  '#FFDBB4', '#F5C49A', '#E8A87C', '#D4855A',
  '#C06A3A', '#A0522D', '#7B3F1E', '#5C2A0D',
]
export const HAIR_COLORS = [
  '#1A0A00', '#3D2B1F', '#7B4A2D', '#B5651D',
  '#C8963E', '#E8D060', '#C0392B', '#7D3C98',
]
export const SHIRT_COLORS = [
  '#3E8ED0', '#4CAF88', '#E05555', '#F0A500', '#9B59B6', '#EFEFEF',
]

export const SKIN_COLOR_NAMES = ['Peach', 'Light', 'Med Light', 'Medium', 'Med Tan', 'Tan', 'Brown', 'Deep']
export const HAIR_COLOR_NAMES = ['Black', 'Dark Brown', 'Auburn', 'Chestnut', 'Dark Blonde', 'Blonde', 'Red', 'Purple']
export const SHIRT_COLOR_NAMES = ['Blue', 'Green', 'Red', 'Yellow', 'Purple', 'White']
export const BODY_NAMES = ['Slim', 'Regular', 'Athletic']
export const ACCESSORY_NAMES = ['None', 'Round Glasses', 'Rect Glasses', 'Headband', 'Crown']
export const MOUTH_NAMES = ['Calm', 'Happy', 'Sad', 'Angry', 'Serious', 'Cigarette']

export const HAIR_STYLE_NAMES = [
  'Classic', 'Side Part', 'Spiky', 'Long Straight',
  'Afro', 'Mohawk', 'Top Bun', 'Bowl Cut',
  'Curly', 'High Ponytail', 'Wavy', 'Twin Braids',
]
export const EYE_NAMES = ['Round', 'Almond', 'Anime', 'Cool', 'Happy', 'Tired', 'Wide', 'Stars']

// ─── Hair back layer ──────────────────────────────────────────────────────────
// Head: cx=50 cy=65 rx=33 ry=36  →  top ≈ y29, sides x17/x83

function HairBack({ style, color }: { style: number; color: string }) {
  const hi = `rgba(255,255,255,0.18)` // highlight tint
  switch (style) {
    case 0: // Classic — tight neat cap
      return (
        <g>
          <path d="M 20 63 C 18 30 82 30 80 63 C 67 54 33 54 20 63 Z" fill={color} />
          <path d="M 30 32 Q 50 26 70 32 Q 60 29 50 28 Q 40 29 30 32 Z" fill={hi} />
        </g>
      )
    case 1: // Side Part — asymmetric sweep, heavier on left
      return (
        <g>
          <path d="M 18 63 C 14 28 84 28 82 63 C 68 54 34 55 18 63 Z" fill={color} />
          {/* part line highlight */}
          <path d="M 50 29 L 52 46" stroke={hi} strokeWidth="2" strokeLinecap="round" />
          {/* extra left-side volume */}
          <path d="M 18 63 C 14 40 20 30 26 28 C 22 36 20 50 20 63 Z" fill={color} />
        </g>
      )
    case 2: // Spiky — dramatic sharp peaks
      return (
        <g>
          <path
            d="M 22 63
               L 24 50 L 29 60 L 33 40 L 38 56 L 42 30 L 46 50
               L 50 20 L 54 50 L 58 30 L 62 56 L 67 40 L 72 60 L 76 50 L 78 63
               C 64 54 36 54 22 63 Z"
            fill={color}
          />
          {/* spike highlights */}
          <line x1="50" y1="20" x2="50" y2="34" stroke={hi} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="42" y1="30" x2="43" y2="42" stroke={hi} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="58" y1="30" x2="57" y2="42" stroke={hi} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )
    case 3: // Long Straight — flows full length
      return (
        <g>
          {/* main curtain */}
          <path d="M 13 64 C 10 27 90 27 87 64 L 88 120 C 75 116 64 114 50 114 C 36 114 25 116 12 120 Z" fill={color} />
          {/* centre back highlight */}
          <path d="M 46 27 Q 50 26 54 27 L 56 114 Q 50 113 44 114 Z" fill={hi} />
        </g>
      )
    case 4: // Afro — large round bubble far beyond head
      return (
        <g>
          <ellipse cx="50" cy="36" rx="40" ry="28" fill={color} />
          {/* top shine */}
          <ellipse cx="42" cy="26" rx="10" ry="7" fill={hi} />
          {/* texture bumps */}
          {[
            [28,32],[38,22],[50,20],[62,22],[72,32],
            [24,44],[72,44],[34,44],[66,44],
          ].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(0,0,0,0.08)" />
          ))}
        </g>
      )
    case 5: // Mohawk — single tall fin, shaved temple indication
      return (
        <g>
          {/* Shaved side — light stubble tint */}
          <path d="M 18 62 C 17 40 26 30 30 28 C 26 36 24 50 22 62 Z" fill="rgba(0,0,0,0.06)" />
          <path d="M 82 62 C 83 40 74 30 70 28 C 74 36 76 50 78 62 Z" fill="rgba(0,0,0,0.06)" />
          {/* Mohawk fin */}
          <path d="M 44 62 C 43 40 44 20 50 8 Q 50 6 50 8 C 56 20 57 40 56 62 C 54 57 46 57 44 62 Z" fill={color} />
          {/* fin highlight */}
          <path d="M 49 10 Q 50 8 51 10 L 51 42 Q 50 44 49 42 Z" fill={hi} />
        </g>
      )
    case 6: // Top Bun — back coverage + elevated bun above head
      return (
        <g>
          {/* back skull coverage */}
          <path d="M 22 63 C 20 42 80 42 78 63 C 65 56 35 56 22 63 Z" fill={color} />
          {/* bun sphere */}
          <circle cx="50" cy="19" r="14" fill={color} />
          {/* bun highlight */}
          <ellipse cx="45" cy="13" rx="7" ry="5" fill={hi} />
          {/* hair tie */}
          <ellipse cx="50" cy="33" rx="8" ry="3" fill={color} />
          <ellipse cx="50" cy="33" rx="8" ry="3" fill="rgba(0,0,0,0.15)" />
        </g>
      )
    case 7: // Bowl Cut — very flat bottom, thick straight fringe
      return (
        <g>
          {/* bowl cap */}
          <path d="M 16 56 C 16 27 84 27 84 56 L 84 63 C 70 55 30 55 16 63 Z" fill={color} />
          {/* flat fringe underside */}
          <path d="M 16 56 C 30 60 70 60 84 56 C 70 58 30 58 16 56 Z" fill="rgba(0,0,0,0.1)" />
          {/* top shine */}
          <ellipse cx="50" cy="32" rx="18" ry="8" fill={hi} />
        </g>
      )
    case 8: // Curly — bumpy organic outline
      return (
        <g>
          <path
            d="M 22 63
               C 16 56 12 48 14 42
               C 16 36 13 30 18 28
               C 22 26 22 22 27 21
               C 32 20 33 17 38 17
               C 43 17 44 14 50 13
               C 56 14 57 17 62 17
               C 67 17 68 20 73 21
               C 78 22 78 26 82 28
               C 87 30 84 36 86 42
               C 88 48 84 56 78 63
               C 64 54 36 54 22 63 Z"
            fill={color}
          />
          {/* curl texture dots */}
          {[
            [25,36],[34,24],[44,18],[56,18],[66,24],[75,36],
            [20,50],[80,50],
          ].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="3.5" fill="rgba(0,0,0,0.1)" />
          ))}
          <ellipse cx="50" cy="18" rx="8" ry="5" fill={hi} />
        </g>
      )
    case 9: // High Ponytail — back + tall ponytail with volume
      return (
        <g>
          {/* back skull coverage */}
          <path d="M 22 63 C 20 32 80 32 78 63 C 65 54 35 54 22 63 Z" fill={color} />
          {/* ponytail base / gather */}
          <ellipse cx="50" cy="30" rx="9" ry="6" fill={color} />
          {/* ponytail tube going up */}
          <path d="M 44 32 C 42 20 42 8 45 2 Q 50 -2 55 2 C 58 8 58 20 56 32 Z" fill={color} />
          {/* ponytail tip volume */}
          <ellipse cx="50" cy="4" rx="9" ry="7" fill={color} />
          {/* hair tie band */}
          <rect x="44" y="28" width="12" height="4" rx="2" fill="rgba(0,0,0,0.22)" />
          {/* highlight on ponytail */}
          <path d="M 49 4 Q 49 16 48 28" stroke={hi} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )
    case 10: // Wavy — flows to shoulder with wavy rippled edges
      return (
        <g>
          {/* main hair curtain with wavy bottom */}
          <path
            d="M 12 64 C 10 27 90 27 88 64
               L 90 88 C 84 84 80 90 76 86 C 72 82 68 88 64 84 C 60 80 56 86 52 82
               L 48 82 C 44 86 40 80 36 84 C 32 88 28 82 24 86 C 20 90 16 84 10 88 Z"
            fill={color}
          />
          {/* wave highlight streaks */}
          <path d="M 44 28 Q 42 56 40 84" stroke={hi} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M 54 28 Q 56 56 58 80" stroke={hi} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>
      )
    case 11: // Twin Braids — back cap + two woven braids
      return (
        <g>
          {/* back skull coverage */}
          <path d="M 22 62 C 20 30 80 30 78 62 C 65 54 35 54 22 62 Z" fill={color} />
          {/* Left braid */}
          <path d="M 19 66 Q 22 70 19 76 Q 16 82 19 88 Q 22 94 19 100 Q 16 106 19 112" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* Left braid weave lines */}
          <path d="M 19 66 Q 16 70 19 76 Q 22 82 19 88 Q 16 94 19 100 Q 22 106 19 112" stroke="rgba(0,0,0,0.18)" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right braid */}
          <path d="M 81 66 Q 78 70 81 76 Q 84 82 81 88 Q 78 94 81 100 Q 84 106 81 112" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* Right braid weave lines */}
          <path d="M 81 66 Q 84 70 81 76 Q 78 82 81 88 Q 84 94 81 100 Q 78 106 81 112" stroke="rgba(0,0,0,0.18)" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* tips */}
          <circle cx="19" cy="114" r="4" fill={color} />
          <circle cx="81" cy="114" r="4" fill={color} />
          {/* tip bands */}
          <rect x="15" y="110" width="8" height="3" rx="1.5" fill="rgba(0,0,0,0.25)" />
          <rect x="77" y="110" width="8" height="3" rx="1.5" fill="rgba(0,0,0,0.25)" />
        </g>
      )
    default:
      return null
  }
}

// ─── Hair front layer (bangs over face) ──────────────────────────────────────

function HairFront({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 1: // Side Part — heavy left sweep bangs
      return (
        <path
          d="M 17 60 C 18 38 36 34 56 56 C 44 50 28 52 17 60 Z"
          fill={color}
        />
      )
    case 3: // Long Straight — front side panels past ears
      return (
        <>
          <path d="M 14 65 C 12 55 12 48 15 65" fill={color} />
          <path d="M 86 65 C 88 55 88 48 85 65" fill={color} />
        </>
      )
    case 7: // Bowl Cut — very strong straight fringe
      return (
        <path
          d="M 17 55 L 17 62 C 32 58 68 58 83 62 L 83 55 C 68 57 32 57 17 55 Z"
          fill={color}
        />
      )
    case 8: // Curly — a couple of loose curls on forehead
      return (
        <>
          <path d="M 34 52 C 30 44 26 48 30 54" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 66 52 C 70 44 74 48 70 54" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )
    case 10: // Wavy — wavy front fringe
      return (
        <path
          d="M 20 52 Q 28 44 36 52 Q 44 44 52 52 C 40 50 28 50 20 58 Z"
          fill={color}
        />
      )
    default:
      return null
  }
}

// ─── Eyes ─────────────────────────────────────────────────────────────────────

function Eyes({ style }: { style: number }) {
  const lx = 36, rx = 64, ey = 57
  switch (style) {
    case 0: return (
      <>
        <circle cx={lx} cy={ey} r="4.5" fill="#1A0A00" />
        <circle cx={rx} cy={ey} r="4.5" fill="#1A0A00" />
        <circle cx={lx+1.5} cy={ey-1.5} r="1.5" fill="white" opacity="0.9" />
        <circle cx={rx+1.5} cy={ey-1.5} r="1.5" fill="white" opacity="0.9" />
      </>
    )
    case 1: return (
      <>
        <ellipse cx={lx} cy={ey} rx="5.5" ry="3.5" fill="#1A0A00" />
        <ellipse cx={rx} cy={ey} rx="5.5" ry="3.5" fill="#1A0A00" />
        <circle cx={lx+1.5} cy={ey-1} r="1.2" fill="white" opacity="0.8" />
        <circle cx={rx+1.5} cy={ey-1} r="1.2" fill="white" opacity="0.8" />
      </>
    )
    case 2: return (
      <>
        <circle cx={lx} cy={ey} r="6.5" fill="#2980b9" />
        <circle cx={lx} cy={ey} r="5" fill="#1A0A00" />
        <circle cx={rx} cy={ey} r="6.5" fill="#2980b9" />
        <circle cx={rx} cy={ey} r="5" fill="#1A0A00" />
        <circle cx={lx+2} cy={ey-2} r="2" fill="white" opacity="0.9" />
        <circle cx={rx+2} cy={ey-2} r="2" fill="white" opacity="0.9" />
      </>
    )
    case 3: return (
      <>
        <ellipse cx={lx} cy={ey} rx="5.5" ry="2" fill="#1A0A00" />
        <ellipse cx={rx} cy={ey} rx="5.5" ry="2" fill="#1A0A00" />
        <path d={`M ${lx-5} ${ey-2} Q ${lx} ${ey-5} ${lx+5} ${ey-2}`} stroke="#1A0A00" strokeWidth="1.5" fill="none" />
        <path d={`M ${rx-5} ${ey-2} Q ${rx} ${ey-5} ${rx+5} ${ey-2}`} stroke="#1A0A00" strokeWidth="1.5" fill="none" />
      </>
    )
    case 4: return (
      <>
        <path d={`M ${lx-5} ${ey+1} Q ${lx} ${ey-5} ${lx+5} ${ey+1}`} stroke="#1A0A00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d={`M ${rx-5} ${ey+1} Q ${rx} ${ey-5} ${rx+5} ${ey+1}`} stroke="#1A0A00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    )
    case 5: return (
      <>
        <ellipse cx={lx} cy={ey+1} rx="5" ry="3.5" fill="#1A0A00" />
        <ellipse cx={rx} cy={ey+1} rx="5" ry="3.5" fill="#1A0A00" />
        <path d={`M ${lx-5} ${ey-2} Q ${lx+1} ${ey-6} ${lx+5} ${ey-1}`} fill="rgba(220,180,140,0.85)" />
        <path d={`M ${rx-5} ${ey-2} Q ${rx+1} ${ey-6} ${rx+5} ${ey-1}`} fill="rgba(220,180,140,0.85)" />
        <circle cx={lx+1} cy={ey} r="1.2" fill="white" opacity="0.55" />
        <circle cx={rx+1} cy={ey} r="1.2" fill="white" opacity="0.55" />
      </>
    )
    case 6: return (
      <>
        <circle cx={lx} cy={ey} r="6.5" fill="white" />
        <circle cx={lx} cy={ey} r="5" fill="#1A0A00" />
        <circle cx={lx} cy={ey} r="3" fill="#2C3E50" />
        <circle cx={rx} cy={ey} r="6.5" fill="white" />
        <circle cx={rx} cy={ey} r="5" fill="#1A0A00" />
        <circle cx={rx} cy={ey} r="3" fill="#2C3E50" />
        <circle cx={lx+1.5} cy={ey-1.5} r="1.5" fill="white" />
        <circle cx={rx+1.5} cy={ey-1.5} r="1.5" fill="white" />
      </>
    )
    case 7: {
      const starPts = (cx: number, cy: number) => Array.from({length:10},(_,i) => {
        const a = (i*Math.PI)/5 - Math.PI/2
        const r = i%2===0 ? 5.5 : 2.5
        return `${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`
      }).join(' ')
      return (
        <>
          <polygon points={starPts(lx,ey)} fill="#F0A500" />
          <polygon points={starPts(rx,ey)} fill="#F0A500" />
          <circle cx={lx} cy={ey} r="2" fill="#1A0A00" />
          <circle cx={rx} cy={ey} r="2" fill="#1A0A00" />
        </>
      )
    }
    default: return null
  }
}

// ─── Mouth ────────────────────────────────────────────────────────────────────

function Mouth({ style, skin }: { style: number; skin: string }) {
  switch (style) {
    case 0: // Calm — gentle small smile
      return (
        <path d="M 42 76 Q 50 83 58 76" stroke="rgba(0,0,0,0.30)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )
    case 1: // Happy — wide open smile with teeth
      return (
        <>
          <path d="M 36 74 Q 50 90 64 74" stroke="rgba(0,0,0,0.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* teeth fill */}
          <path d="M 37 74 Q 50 86 63 74 Q 50 80 37 74 Z" fill="white" />
          <path d="M 37 74 Q 50 86 63 74" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
          {/* tooth dividers */}
          <line x1="44" y1="74" x2="43" y2="81" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          <line x1="50" y1="74" x2="50" y2="83" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          <line x1="56" y1="74" x2="57" y2="81" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        </>
      )
    case 2: // Sad — downward curve
      return (
        <>
          <path d="M 42 80 Q 50 73 58 80" stroke="rgba(0,0,0,0.30)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* small quiver lines at corners */}
          <line x1="41" y1="78" x2="40" y2="82" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="59" y1="78" x2="60" y2="82" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )
    case 3: // Angry — sharp angled grimace
      return (
        <>
          <path d="M 39 79 L 44 75 L 50 77 L 56 75 L 61 79" stroke="rgba(0,0,0,0.40)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* gritted teeth hint */}
          <path d="M 42 76 L 58 76" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        </>
      )
    case 4: // Serious — flat straight line
      return (
        <line x1="41" y1="77" x2="59" y2="77" stroke="rgba(0,0,0,0.32)" strokeWidth="2.4" strokeLinecap="round" />
      )
    case 5: // Cigarette — side smirk + cigarette
      return (
        <>
          {/* smirk */}
          <path d="M 40 76 Q 46 80 52 77" stroke="rgba(0,0,0,0.30)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* cigarette body (white) */}
          <rect x="52" y="74" width="20" height="4" rx="2" fill="#F5F0E8" />
          <rect x="52" y="74" width="20" height="4" rx="2" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" fill="none" />
          {/* filter tip (amber) */}
          <rect x="69" y="74" width="5" height="4" rx="2" fill="#C8783A" />
          {/* lit end glow */}
          <circle cx="53" cy="76" r="1.5" fill="#FF6B2B" opacity="0.8" />
          {/* smoke wisps */}
          <path d="M 54 73 Q 52 68 55 63" stroke="rgba(160,160,160,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 58 72 Q 60 67 57 62" stroke="rgba(160,160,160,0.40)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      )
    default:
      return <path d="M 42 76 Q 50 83 58 76" stroke="rgba(0,0,0,0.30)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  }
}

// ─── Accessories ──────────────────────────────────────────────────────────────

function Accessory({ type }: { type: number }) {
  switch (type) {
    case 1:
      return (
        <>
          <circle cx="36" cy="57" r="8.5" fill="rgba(255,255,255,0.25)" stroke="#5a5a6a" strokeWidth="2" />
          <circle cx="64" cy="57" r="8.5" fill="rgba(255,255,255,0.25)" stroke="#5a5a6a" strokeWidth="2" />
          <line x1="44.5" y1="57" x2="55.5" y2="57" stroke="#5a5a6a" strokeWidth="2" />
          <line x1="17" y1="55" x2="27.5" y2="56" stroke="#5a5a6a" strokeWidth="2" />
          <line x1="72.5" y1="56" x2="83" y2="55" stroke="#5a5a6a" strokeWidth="2" />
        </>
      )
    case 2:
      return (
        <>
          <rect x="27" y="51.5" width="18" height="11" rx="2.5" fill="rgba(255,255,255,0.2)" stroke="#4a3728" strokeWidth="2" />
          <rect x="55" y="51.5" width="18" height="11" rx="2.5" fill="rgba(255,255,255,0.2)" stroke="#4a3728" strokeWidth="2" />
          <line x1="45" y1="57" x2="55" y2="57" stroke="#4a3728" strokeWidth="2" />
          <line x1="17" y1="55" x2="27" y2="56" stroke="#4a3728" strokeWidth="2" />
          <line x1="73" y1="56" x2="83" y2="55" stroke="#4a3728" strokeWidth="2" />
        </>
      )
    case 3:
      return (
        <path d="M 18 48 C 18 38 82 38 82 48 L 82 55 C 82 45 18 45 18 55 Z" fill="#E05555" opacity="0.92" />
      )
    case 4:
      return (
        <>
          <path d="M 30 34 L 35 22 L 42 32 L 50 18 L 58 32 L 65 22 L 70 34 L 66 38 L 34 38 Z" fill="#F0A500" />
          <path d="M 30 34 L 35 22 L 42 32 L 50 18 L 58 32 L 65 22 L 70 34 L 66 38 L 34 38 Z" fill="none" stroke="#E09000" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="50" cy="21" r="2.5" fill="#FFEC40" />
          <circle cx="36" cy="24" r="1.8" fill="#FFEC40" />
          <circle cx="64" cy="24" r="1.8" fill="#FFEC40" />
        </>
      )
    default: return null
  }
}

// ─── Body (neck + shirt) ──────────────────────────────────────────────────────

function Body({ bodyType, shirtColor, skinColor }: { bodyType: number; shirtColor: string; skinColor: string }) {
  // Dramatic differences per body type
  const configs = [
    { neckW: 9,  neckH: 12, sw: 20, sh: 22 },  // Slim
    { neckW: 12, neckH: 13, sw: 28, sh: 24 },  // Regular
    { neckW: 15, neckH: 12, sw: 38, sh: 26 },  // Athletic
  ]
  const c = configs[bodyType] ?? configs[1]
  const nx = 50 - c.neckW / 2
  const leftEdge = 50 - c.sw
  const rightEdge = 50 + c.sw
  // Shirt shine color (lighter version)
  const shineColor = 'rgba(255,255,255,0.22)'

  return (
    <>
      {/* Neck */}
      <rect x={nx} y={100} width={c.neckW} height={c.neckH} fill={skinColor} />
      {/* Shirt */}
      <path
        d={`M ${leftEdge} 128
            L ${leftEdge} ${112 + (bodyType === 2 ? 0 : 2)}
            Q ${50 - c.neckW/2 - 4} ${108} ${50 - c.neckW/2} 106
            L ${50 + c.neckW/2} 106
            Q ${50 + c.neckW/2 + 4} ${108} ${rightEdge} ${112 + (bodyType === 2 ? 0 : 2)}
            L ${rightEdge} 128 Z`}
        fill={shirtColor}
      />
      {/* Shirt top fold shadow */}
      <path
        d={`M ${50 - c.neckW/2} 106 Q 50 112 ${50 + c.neckW/2} 106`}
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Shirt shine streak */}
      <path
        d={`M ${leftEdge + 5} ${115} L ${leftEdge + 3} 128`}
        stroke={shineColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Athletic: shoulder definition */}
      {bodyType === 2 && (
        <>
          <path d={`M ${leftEdge} ${112} Q ${leftEdge - 2} ${118} ${leftEdge} 128`} stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />
          <path d={`M ${rightEdge} ${112} Q ${rightEdge + 2} ${118} ${rightEdge} 128`} stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />
        </>
      )}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AvatarSvgProps {
  config: Partial<AvatarConfig>
  size?: number
  className?: string
  showBody?: boolean
}

export default function AvatarSvg({ config, size = 64, className, showBody = true }: AvatarSvgProps) {
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...config }
  const skin = SKIN_COLORS[cfg.skin] ?? SKIN_COLORS[0]
  const hairColor = HAIR_COLORS[cfg.hair_color] ?? HAIR_COLORS[0]
  const shirtColor = SHIRT_COLORS[cfg.shirt] ?? SHIRT_COLORS[0]

  const vbHeight = showBody ? 128 : 110
  const svgHeight = showBody ? size : Math.round(size * (110 / 128))

  return (
    <svg
      viewBox={`0 0 100 ${vbHeight}`}
      width={size}
      height={svgHeight}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      className={className}
    >
      {/* 1. Back hair */}
      <HairBack style={cfg.hair_style} color={hairColor} />

      {/* 2. Ears */}
      <ellipse cx="17" cy="65" rx="5.5" ry="7.5" fill={skin} />
      <ellipse cx="83" cy="65" rx="5.5" ry="7.5" fill={skin} />

      {/* 3. Head */}
      <ellipse cx="50" cy="65" rx="33" ry="36" fill={skin} />

      {/* 4. Cheek blush */}
      <ellipse cx="26" cy="72" rx="8" ry="5" fill="rgba(255,120,90,0.13)" />
      <ellipse cx="74" cy="72" rx="8" ry="5" fill="rgba(255,120,90,0.13)" />

      {/* 5. Eyes */}
      <Eyes style={cfg.eyes} />

      {/* 6. Eyebrows */}
      <path d="M 30 50 Q 36 46 42 50" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 58 50 Q 64 46 70 50" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* 7. Nose */}
      <path d="M 48 66 Q 50 70 52 66" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 8. Mouth */}
      <Mouth style={cfg.mouth} skin={skin} />

      {/* 9. Front hair */}
      <HairFront style={cfg.hair_style} color={hairColor} />

      {/* 10. Accessory */}
      <Accessory type={cfg.accessory} />

      {/* 11. Body */}
      {showBody && <Body bodyType={cfg.body} shirtColor={shirtColor} skinColor={skin} />}
    </svg>
  )
}
