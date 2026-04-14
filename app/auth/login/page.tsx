'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">

      {/* Logo + hero */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="text-6xl mb-3 animate-float inline-block">🎾</div>
        <h1
          className="text-4xl font-bold text-wii-text"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Welcome back!
        </h1>
        <p className="text-wii-muted text-sm mt-1">Sign in to your Padel Club account</p>
      </div>

      {/* Card */}
      <div className="wii-channel w-full max-w-sm p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        {error && (
          <div className="bg-wii-red/10 border-2 border-wii-red/25 text-wii-red text-sm rounded-2xl px-4 py-3 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-1.5"
              style={{ fontFamily: 'var(--font-fredoka)' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/80 border-2 border-white/90 rounded-2xl px-4 py-3 text-sm text-wii-text focus:outline-none focus:ring-2 focus:ring-wii-green/50 focus:border-wii-green/40 transition-all placeholder:text-gray-300 shadow-inner"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-wii-muted mb-1.5"
              style={{ fontFamily: 'var(--font-fredoka)' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/80 border-2 border-white/90 rounded-2xl px-4 py-3 text-sm text-wii-text focus:outline-none focus:ring-2 focus:ring-wii-green/50 focus:border-wii-green/40 transition-all placeholder:text-gray-300 shadow-inner"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full wii-btn-primary bg-wii-green text-white font-bold py-3.5 rounded-full shadow-lg shadow-wii-green/35 transition-all ${loading ? 'opacity-50' : ''}`}
            style={{ fontFamily: 'var(--font-fredoka)', fontSize: '1rem' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-wii-muted mt-5 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        No account?{' '}
        <Link href="/auth/signup" className="text-wii-green font-bold hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
