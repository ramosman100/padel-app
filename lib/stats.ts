import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

export type LeaderboardEntry = {
  player_id: string
  display_name: string
  avatar_url: string | null
  avatar_config: Partial<AvatarConfig> | null
  played: number
  wins: number
  draws: number
  losses: number
  win_rate: number
  points: number
  points_diff: number
}

function extractPlayer(raw: unknown): {
  display_name: string
  avatar_url: string | null
  avatar_config: Partial<AvatarConfig> | null
} | null {
  if (!raw) return null
  const p = Array.isArray(raw) ? raw[0] : raw
  if (!p) return null
  return p as { display_name: string; avatar_url: string | null; avatar_config: Partial<AvatarConfig> | null }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computeLeaderboard(matchPlayers: any[]): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>()

  for (const mp of matchPlayers) {
    const playerInfo = extractPlayer(mp.players)
    if (!playerInfo) continue

    const isDraw = mp.score_for === mp.score_against
    const isWin = !isDraw && mp.won
    const pts = isWin ? 3 : isDraw ? 1 : 0

    const existing = map.get(mp.player_id)
    if (!existing) {
      map.set(mp.player_id, {
        player_id: mp.player_id,
        display_name: playerInfo.display_name,
        avatar_url: playerInfo.avatar_url ?? null,
        avatar_config: playerInfo.avatar_config ?? null,
        played: 1,
        wins: isWin ? 1 : 0,
        draws: isDraw ? 1 : 0,
        losses: !isWin && !isDraw ? 1 : 0,
        win_rate: 0,
        points: pts,
        points_diff: mp.score_for - mp.score_against,
      })
    } else {
      existing.played++
      existing.wins += isWin ? 1 : 0
      existing.draws += isDraw ? 1 : 0
      existing.losses += !isWin && !isDraw ? 1 : 0
      existing.points += pts
      existing.points_diff += mp.score_for - mp.score_against
    }
  }

  return Array.from(map.values())
    .map((e) => ({
      ...e,
      win_rate: e.played > 0 ? Math.round((e.wins / e.played) * 100) : 0,
    }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins || b.win_rate - a.win_rate)
}
