import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import WiiBadge from '@/components/ui/WiiBadge'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import SignOutButton from '@/components/ui/SignOutButton'
import DisplayNameEditor from '@/components/ui/DisplayNameEditor'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let { data: player } = await supabase
    .from('players')
    .select('id, display_name, created_at, avatar_config')
    .eq('user_id', user.id)
    .single()

  if (!player) {
    const displayName =
      user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Player'
    const { data: created } = await supabase
      .from('players')
      .insert({ user_id: user.id, display_name: displayName })
      .select('id, display_name, created_at, avatar_config')
      .single()
    player = created
  }

  const { data: matchPlayers } = await supabase
    .from('match_players')
    .select('won, score_for, score_against, sets, matches(played_at)')
    .eq('player_id', player?.id ?? '')
    .order('match_id', { ascending: false })
    .limit(20)

  const played = matchPlayers?.length ?? 0
  const wins = matchPlayers?.filter((m) => m.won).length ?? 0
  const losses = played - wins
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0

  const avatarConfig = player?.avatar_config as Partial<AvatarConfig> | null
  const hasAvatar = avatarConfig && Object.keys(avatarConfig).length > 0
  const initials = player?.display_name?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Profile header card */}
        <div className="wii-card p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)',
                  borderWidth: '3px',
                }}
              >
                {hasAvatar ? (
                  <AvatarSvg config={avatarConfig!} size={80} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-wii-green to-wii-blue flex items-center justify-center text-white font-bold text-2xl"
                    style={{ fontFamily: 'var(--font-fredoka)' }}>
                    {initials}
                  </div>
                )}
              </div>
              {/* Edit avatar button */}
              <Link
                href="/dashboard/profile/avatar"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-wii-blue text-white flex items-center justify-center shadow-md text-sm font-bold hover:bg-wii-blue-dark transition-colors"
                title="Edit avatar"
              >
                ✏
              </Link>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <DisplayNameEditor initialName={player?.display_name ?? 'Player'} />
              <p className="text-sm text-wii-muted truncate">{user.email}</p>
              {!hasAvatar && (
                <Link
                  href="/dashboard/profile/avatar"
                  className="inline-block mt-2 text-xs font-bold text-wii-blue hover:underline"
                >
                  Create your Mii →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Played', value: played,       color: 'text-wii-text' },
            { label: 'Wins',   value: wins,          color: 'text-wii-green' },
            { label: 'Losses', value: losses,        color: 'text-wii-red' },
            { label: 'Win %',  value: `${winRate}%`, color: winRate >= 50 ? 'text-wii-green' : 'text-wii-red' },
          ].map((s) => (
            <div key={s.label} className="wii-card p-3 text-center">
              <p
                className={`text-2xl font-bold ${s.color}`}
                style={{ fontFamily: 'var(--font-fredoka)' }}
              >
                {s.value}
              </p>
              <p className="text-[10px] text-wii-muted mt-0.5 font-semibold uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Recent matches */}
        <div className="wii-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3 border-b border-white/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">
              Recent Matches
            </p>
          </div>

          {!matchPlayers || matchPlayers.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-4xl mb-3">🎾</div>
              <p className="text-wii-muted text-sm mb-4">No matches logged yet.</p>
              <Link
                href="/dashboard/log"
                className="inline-block wii-btn-primary bg-wii-green hover:bg-wii-green-dark text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-wii-green/30 transition-all active:scale-95"
              >
                Log your first match →
              </Link>
            </div>
          ) : (
            <div>
              {matchPlayers.map((m, i) => {
                const sets = (m.sets ?? []) as { my: number; opp: number }[]
                const matchData = m.matches as unknown as { played_at: string } | null
                const playedAt = matchData?.played_at

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-3.5 ${
                      i < matchPlayers.length - 1 ? 'border-b border-white/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <WiiBadge variant={m.won ? 'win' : 'loss'} />
                      <div>
                        <p className="text-sm font-bold text-wii-text">
                          {m.score_for}–{m.score_against} sets
                        </p>
                        {sets.length > 0 && (
                          <p className="text-[11px] text-wii-muted">
                            {sets.map((s) => `${s.my}:${s.opp}`).join('  ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-wii-muted font-medium">
                      {playedAt
                        ? new Date(playedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sign out — mobile only (desktop has NavBar) */}
        <div className="pb-2 md:hidden">
          <SignOutButton />
        </div>

      </div>
    </div>
  )
}
