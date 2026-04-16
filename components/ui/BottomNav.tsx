'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface BottomNavProps {
  user: User | null
  isAdmin?: boolean
}

function TrophyIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9H3.75A2.25 2.25 0 0 1 1.5 6.75v-.75A2.25 2.25 0 0 1 3.75 3.75H6m12 5.25h2.25A2.25 2.25 0 0 0 22.5 6.75v-.75a2.25 2.25 0 0 0-2.25-2.25H18M6 9v6.75A2.25 2.25 0 0 0 8.25 18h7.5A2.25 2.25 0 0 0 18 15.75V9M6 9h12M9 21h6M12 18v3" />
    </svg>
  )
}

function CalendarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function ClockIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function UserIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  )
}

export default function BottomNav({ user, isAdmin }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const tabClass = (active: boolean, color = 'text-wii-green') =>
    `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all ${active ? color : 'text-wii-muted'}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="wii-card rounded-t-3xl rounded-b-none border-b-0 px-1 pt-2"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around">

          {/* Rankings */}
          <Link href="/" className={tabClass(isActive('/'))}>
            <TrophyIcon filled={isActive('/')} />
            <span className="text-[9px] font-bold">Ranks</span>
          </Link>

          {/* Calendar */}
          <Link href="/dashboard/calendar" className={tabClass(isActive('/dashboard/calendar'), 'text-wii-blue')}>
            <CalendarIcon filled={isActive('/dashboard/calendar')} />
            <span className="text-[9px] font-bold">Calendar</span>
          </Link>

          {/* Log Match — centre */}
          {user ? (
            <Link href="/dashboard/log" className="flex flex-col items-center gap-0.5 -mt-5">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 wii-btn-primary bg-wii-green ${
                isActive('/dashboard/log') ? 'shadow-wii-green/40' : 'shadow-wii-green/30'
              }`}>
                <PlusIcon />
              </div>
              <span className={`text-[9px] font-bold mt-0.5 ${isActive('/dashboard/log') ? 'text-wii-green' : 'text-wii-muted'}`}>
                Log
              </span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-0.5 -mt-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 shadow-sm opacity-40">
                <PlusIcon />
              </div>
              <span className="text-[9px] font-bold mt-0.5 text-wii-muted">Log</span>
            </div>
          )}

          {/* History */}
          <Link href="/dashboard/history" className={tabClass(isActive('/dashboard/history'), 'text-wii-gold')}>
            <ClockIcon filled={isActive('/dashboard/history')} />
            <span className="text-[9px] font-bold">History</span>
          </Link>

          {/* Profile / Sign in */}
          {user ? (
            <Link href="/dashboard/profile" className={tabClass(isActive('/dashboard/profile') && !isActive('/dashboard/profile/') && !isActive('/dashboard/admin'))}>
              <UserIcon filled={isActive('/dashboard/profile') && !isActive('/dashboard/profile/') && !isActive('/dashboard/admin')} />
              <span className="text-[9px] font-bold">Profile</span>
            </Link>
          ) : (
            <Link href="/auth/login" className={tabClass(isActive('/auth'), 'text-wii-blue')}>
              <LoginIcon />
              <span className="text-[9px] font-bold">Sign in</span>
            </Link>
          )}

          {/* Admin — only visible to admins */}
          {isAdmin && (
            <Link href="/dashboard/admin" className={tabClass(isActive('/dashboard/admin'), 'text-wii-red')}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill={isActive('/dashboard/admin') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-[9px] font-bold">Admin</span>
            </Link>
          )}

        </div>
      </div>
    </nav>
  )
}
