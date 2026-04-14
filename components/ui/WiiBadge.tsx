interface WiiBadgeProps {
  variant: 'win' | 'loss' | 'draw' | 'new'
  children?: React.ReactNode
}

const variants = {
  win:  { bg: 'bg-gradient-to-b from-wii-green/20 to-wii-green/10', text: 'text-wii-green', border: 'border-wii-green/40', shadow: 'shadow-wii-green/20' },
  loss: { bg: 'bg-gradient-to-b from-wii-red/20 to-wii-red/10',   text: 'text-wii-red',   border: 'border-wii-red/40',   shadow: 'shadow-wii-red/20'   },
  draw: { bg: 'bg-gradient-to-b from-wii-gold/20 to-wii-gold/10', text: 'text-wii-gold',  border: 'border-wii-gold/40',  shadow: 'shadow-wii-gold/20'  },
  new:  { bg: 'bg-gradient-to-b from-wii-blue/20 to-wii-blue/10', text: 'text-wii-blue',  border: 'border-wii-blue/40',  shadow: 'shadow-wii-blue/20'  },
}

const defaultLabels = { win: 'WIN', loss: 'LOSS', draw: 'DRAW', new: 'NEW' }

export default function WiiBadge({ variant, children }: WiiBadgeProps) {
  const v = variants[variant]
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border shadow-sm ${v.bg} ${v.text} ${v.border} ${v.shadow}`}
      style={{ fontFamily: 'var(--font-fredoka)' }}
    >
      {children ?? defaultLabels[variant]}
    </span>
  )
}
