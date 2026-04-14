'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full wii-card py-3.5 text-sm font-bold text-wii-red hover:bg-wii-red/5 transition-colors rounded-3xl text-center"
    >
      Sign out
    </button>
  )
}
