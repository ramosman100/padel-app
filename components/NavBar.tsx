'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function NavBar({ user, isAdmin }: { user: User | null; isAdmin?: boolean }) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="wii-card rounded-none border-x-0 border-t-0 px-6 py-3 flex items-center justify-between">
      <Link
        href={user ? '/dashboard' : '/'}
        className="font-bold text-xl text-wii-green"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        🎾 Padel Club
      </Link>
      <div className="flex items-center gap-5 text-sm font-semibold">
        <Link href="/" className="text-wii-muted hover:text-wii-text transition-colors">Rankings</Link>
        <Link href="/dashboard/calendar" className="text-wii-muted hover:text-wii-text transition-colors">Calendar</Link>
        <Link href="/dashboard/history" className="text-wii-muted hover:text-wii-text transition-colors">History</Link>
        {user ? (
          <>
            <Link href="/dashboard/log"     className="text-wii-muted hover:text-wii-text transition-colors">Log Match</Link>
            <Link href="/dashboard/profile" className="text-wii-muted hover:text-wii-text transition-colors">Profile</Link>
            {isAdmin && (
              <Link href="/dashboard/admin" className="text-wii-red/70 hover:text-wii-red font-bold transition-colors flex items-center gap-1">
                🛡️ Admin
              </Link>
            )}
            <button
              onClick={signOut}
              className="bg-white/70 border border-white/80 hover:bg-white/90 text-wii-muted font-bold px-4 py-1.5 rounded-full transition-all"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login"  className="text-wii-muted hover:text-wii-text transition-colors">Log in</Link>
            <Link href="/auth/signup" className="wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white font-bold px-4 py-1.5 rounded-full shadow-md shadow-wii-green/30 transition-all">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
