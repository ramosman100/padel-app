import { createSupabaseServerClient } from '@/lib/supabase-server'
import { computeLeaderboard } from '@/lib/stats'
import AvatarSvg from '@/components/avatar/AvatarSvg'

export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient()

  const { data: matchPlayers, error } = await supabase
    .from('match_players')
    .select(`
      player_id, won, score_for, score_against,
      players!match_players_player_id_fkey(display_name, avatar_url, avatar_config)
    `)

  if (error) console.error('Leaderboard query error:', error.message)

  const leaderboard = computeLeaderboard(matchPlayers ?? [])

  const podium = leaderboard.slice(0, 3)
  const rest   = leaderboard.slice(3)

  // Podium order: 2nd, 1st, 3rd (Wii-style visual podium)
  const podiumOrder = podium.length >= 2
    ? [podium[1], podium[0], podium[2]].filter(Boolean)
    : podium

  const podiumHeight = ['h-20', 'h-28', 'h-14'] // 2nd, 1st, 3rd
  const podiumColors = [
    'from-slate-300 to-slate-400',   // silver
    'from-yellow-300 to-amber-400',  // gold
    'from-orange-300 to-amber-600',  // bronze
  ]
  const podiumRankColors = [
    'text-slate-600',
    'text-amber-600',
    'text-orange-700',
  ]
  const podiumRings = [
    'ring-slate-300',
    'ring-amber-400',
    'ring-orange-400',
  ]
  const medals = ['🥈', '🥇', '🥉']

  return (
    <div className="min-h-screen px-4 pt-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6 px-1 animate-fade-in-up">
          <h1
            className="text-4xl font-bold text-wii-text tracking-tight"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            Rankings
          </h1>
          <p className="text-sm text-wii-muted mt-0.5">
            3 pts win · 1 pt draw · 0 loss
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="wii-channel p-10 text-center animate-wii-pop">
            <div className="text-6xl mb-4 animate-float inline-block">🎾</div>
            <p
              className="font-bold text-wii-text text-xl mb-1"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              No matches yet!
            </p>
            <p className="text-wii-muted text-sm">Log the first match to start the competition.</p>
          </div>
        ) : (
          <>
            {/* ── Podium (top 3) ────────────────────────────────────────── */}
            {podium.length > 0 && (
              <div className="mb-6">
                <div className="flex items-end justify-center gap-3 px-4 pb-2 pt-4">
                  {podiumOrder.map((entry, vi) => {
                    // vi = visual index (0=left/2nd, 1=center/1st, 2=right/3rd)
                    const actualRank = vi === 0 ? 1 : vi === 1 ? 0 : 2  // index into podium array
                    const trueRank   = podium.indexOf(entry)
                    const hasAvatar  = entry.avatar_config && Object.keys(entry.avatar_config).length > 0
                    const avatarSize = vi === 1 ? 72 : 56
                    const nameSize   = vi === 1 ? 'text-base' : 'text-sm'

                    void actualRank

                    return (
                      <div
                        key={entry.player_id}
                        className="flex flex-col items-center gap-2 flex-1 animate-fade-in-up"
                        style={{ animationDelay: `${vi * 80}ms` }}
                      >
                        {/* Medal */}
                        <span className="text-2xl">{medals[vi]}</span>

                        {/* Avatar */}
                        <div
                          className={`rounded-full overflow-hidden ring-4 shadow-lg ${podiumRings[vi]}`}
                          style={{
                            width: avatarSize, height: avatarSize,
                            background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)',
                          }}
                        >
                          {hasAvatar ? (
                            <AvatarSvg config={entry.avatar_config!} size={avatarSize} />
                          ) : (
                            <div
                              className="w-full h-full bg-wii-green flex items-center justify-center text-white font-bold"
                              style={{ fontSize: avatarSize * 0.28, fontFamily: 'var(--font-fredoka)' }}
                            >
                              {entry.display_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <p
                          className={`${nameSize} font-bold text-wii-text text-center leading-tight max-w-[100px]`}
                          style={{ fontFamily: 'var(--font-fredoka)', wordBreak: 'break-word' }}
                          title={entry.display_name}
                        >
                          {entry.display_name.length > 12
                            ? entry.display_name.slice(0, 11) + '…'
                            : entry.display_name}
                        </p>

                        {/* Points badge */}
                        <div
                          className={`px-3 py-1 rounded-full bg-gradient-to-b ${podiumColors[vi]} shadow-md`}
                        >
                          <span
                            className={`text-sm font-bold ${podiumRankColors[vi]}`}
                            style={{ fontFamily: 'var(--font-fredoka)' }}
                          >
                            {entry.points} pts
                          </span>
                        </div>

                        {/* Podium block */}
                        <div
                          className={`w-full rounded-t-2xl bg-gradient-to-b ${podiumColors[vi]} opacity-60 ${podiumHeight[vi]}`}
                        />
                      </div>
                    )
                    void trueRank
                  })}
                </div>
              </div>
            )}

            {/* ── Rest of the table (4th place onward) ──────────────────── */}
            {rest.length > 0 && (
              <div
                className="wii-card stagger-children"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                {/* Column headers */}
                <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-x-2 px-4 py-2.5 border-b border-white/60 bg-white/30">
                  <div />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">Player</p>
                  {['P','W','D','L','Pts'].map((h) => (
                    <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-wii-muted text-center">{h}</p>
                  ))}
                </div>

                {rest.map((entry, i) => {
                  const rank = i + 4
                  const hasAvatar = entry.avatar_config && Object.keys(entry.avatar_config).length > 0
                  return (
                    <div
                      key={entry.player_id}
                      className={`grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-x-2 px-4 py-3 items-center
                        hover:bg-white/40 transition-colors cursor-default
                        ${i < rest.length - 1 ? 'border-b border-white/50' : ''}`}
                    >
                      <span className="text-xs font-bold text-wii-muted text-center">{rank}</span>

                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}
                        >
                          {hasAvatar ? (
                            <AvatarSvg config={entry.avatar_config!} size={32} />
                          ) : (
                            <div className="w-full h-full bg-wii-blue flex items-center justify-center text-white font-bold text-[9px]"
                              style={{ fontFamily: 'var(--font-fredoka)' }}>
                              {entry.display_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-wii-text text-sm truncate">
                          {entry.display_name}
                        </span>
                      </div>

                      <span className="text-sm text-wii-muted text-center">{entry.played}</span>
                      <span className="text-sm font-bold text-wii-green text-center">{entry.wins}</span>
                      <span className="text-sm text-wii-muted text-center">{entry.draws}</span>
                      <span className="text-sm text-wii-red text-center">{entry.losses}</span>

                      <div className="flex justify-center">
                        <span className="text-sm font-bold bg-white/70 text-wii-text px-2 py-0.5 rounded-full min-w-[2rem] text-center shadow-sm">
                          {entry.points}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full table if no podium overflow */}
            {rest.length === 0 && leaderboard.length > 0 && (
              <div
                className="wii-card stagger-children"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-x-2 px-4 py-2.5 border-b border-white/60 bg-white/30">
                  <div />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-wii-muted">Player</p>
                  {['P','W','D','L','Pts'].map((h) => (
                    <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-wii-muted text-center">{h}</p>
                  ))}
                </div>
                {leaderboard.map((entry, i) => {
                  const hasAvatar = entry.avatar_config && Object.keys(entry.avatar_config).length > 0
                  const medalEmoji = ['🥇','🥈','🥉'][i]
                  return (
                    <div
                      key={entry.player_id}
                      className={`grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem] gap-x-2 px-4 py-3 items-center
                        hover:bg-white/40 transition-colors animate-fade-in-up
                        ${i === 0 ? 'bg-amber-50/40' : ''}
                        ${i < leaderboard.length - 1 ? 'border-b border-white/50' : ''}`}
                      style={{ animationDelay: `${i * 55}ms` }}
                    >
                      <span className="text-sm text-center">{i < 3 ? medalEmoji : <span className="text-wii-muted font-bold">{i+1}</span>}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #D4E8F7 0%, #B8D4EE 100%)' }}>
                          {hasAvatar ? <AvatarSvg config={entry.avatar_config!} size={32} /> : (
                            <div className="w-full h-full bg-wii-green flex items-center justify-center text-white font-bold text-[9px]">
                              {entry.display_name.slice(0,2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-wii-text text-sm truncate">{entry.display_name}</span>
                      </div>
                      <span className="text-sm text-wii-muted text-center">{entry.played}</span>
                      <span className="text-sm font-bold text-wii-green text-center">{entry.wins}</span>
                      <span className="text-sm text-wii-muted text-center">{entry.draws}</span>
                      <span className="text-sm text-wii-red text-center">{entry.losses}</span>
                      <div className="flex justify-center">
                        <span className={`text-sm font-bold px-2 py-0.5 rounded-full min-w-[2rem] text-center shadow-sm ${i === 0 ? 'bg-amber-400 text-white' : 'bg-white/70 text-wii-text'}`}>
                          {entry.points}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-3 px-2 flex flex-wrap gap-3 pb-2">
              {['P — Played','W — Wins','D — Draws','L — Losses','Pts — Points'].map((l) => (
                <span key={l} className="text-[10px] text-wii-muted font-medium">{l}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
