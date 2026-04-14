'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/log')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🎾</div>
        <h1
          className="text-3xl font-bold text-wii-text"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Join the crew!
        </h1>
        <p className="text-wii-muted text-sm mt-1">Create your player profile</p>
      </div>

      {/* Card */}
      <div className="wii-card w-full max-w-sm p-6 space-y-4">
        {error && (
          <div className="bg-wii-red/10 border border-wii-red/25 text-wii-red text-sm rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-wii-muted mb-1.5">
              Your name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Rafa"
              className="w-full bg-white/70 border border-white/80 rounded-2xl px-4 py-3 text-sm text-wii-text focus:outline-none focus:ring-2 focus:ring-wii-green/50 focus:border-wii-green/50 transition-all placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-wii-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/70 border border-white/80 rounded-2xl px-4 py-3 text-sm text-wii-text focus:outline-none focus:ring-2 focus:ring-wii-green/50 focus:border-wii-green/50 transition-all placeholder:text-gray-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-wii-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/70 border border-white/80 rounded-2xl px-4 py-3 text-sm text-wii-text focus:outline-none focus:ring-2 focus:ring-wii-green/50 focus:border-wii-green/50 transition-all placeholder:text-gray-300"
              placeholder="min. 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold py-3.5 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-wii-muted mt-5">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-wii-green font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
