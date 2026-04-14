import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import AvatarCreator from '@/components/avatar/AvatarCreator'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

export default async function AvatarEditorPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: player } = await supabase
    .from('players')
    .select('avatar_config')
    .eq('user_id', user.id)
    .single()

  const avatarConfig: Partial<AvatarConfig> =
    (player?.avatar_config as Partial<AvatarConfig>) ?? {}

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/dashboard/profile"
            className="wii-card px-3 py-2 text-sm font-bold text-wii-muted hover:text-wii-text transition-colors"
          >
            ← Back
          </Link>
          <h1
            className="text-2xl font-bold text-wii-text"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            Customize Mii
          </h1>
        </div>

        <AvatarCreator initialConfig={avatarConfig} />

      </div>
    </div>
  )
}
