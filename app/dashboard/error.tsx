'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen px-4 pt-16 flex items-start justify-center">
      <div className="max-w-sm w-full wii-card p-8 text-center space-y-4">
        <div className="text-5xl">😵</div>
        <h2
          className="text-xl font-bold text-wii-text"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Something went wrong
        </h2>
        <p className="text-sm text-wii-muted">
          {error.message ?? 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={reset}
            className="wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold py-3 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95"
          >
            Try again
          </button>
          <Link
            href="/"
            className="wii-card py-3 text-sm font-bold text-wii-muted hover:text-wii-text transition-colors text-center rounded-3xl"
          >
            Go to Rankings
          </Link>
        </div>
      </div>
    </div>
  )
}
