import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="wii-card p-10 text-center max-w-sm w-full space-y-4">
        <div className="text-6xl">🎾</div>
        <h1
          className="text-3xl font-bold text-wii-text"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Out of bounds!
        </h1>
        <p className="text-wii-muted text-sm">
          This page doesn&apos;t exist — the ball went wide.
        </p>
        <Link
          href="/"
          className="inline-block wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95 mt-2"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Back to Rankings
        </Link>
      </div>
    </div>
  )
}
