import { requireAdmin } from '@/lib/admin'
import AdminPanel from '@/components/admin/AdminPanel'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

export default async function AdminPage() {
  const { supabase } = await requireAdmin()

  // All players
  const { data: players } = await supabase
    .from('players')
    .select('id, display_name, is_admin, created_at, avatar_config, user_id')
    .order('display_name')

  // Recent 60 matches with player details
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, played_at,
      match_players(
        player_id, won, score_for, score_against,
        players!match_players_player_id_fkey(id, display_name)
      )
    `)
    .order('played_at', { ascending: false })
    .limit(60)

  type RawPlayer = {
    id: string
    display_name: string
    is_admin: boolean
    created_at: string
    avatar_config: Partial<AvatarConfig> | null
    user_id: string | null
  }

  type RawMatchPlayer = {
    player_id: string
    won: boolean
    score_for: number
    score_against: number
    players: { id: string; display_name: string } | { id: string; display_name: string }[] | null
  }

  type RawMatch = {
    id: string
    played_at: string
    match_players: RawMatchPlayer[]
  }

  // Normalise matches for the client
  const normalised = (matches ?? []).map((m: RawMatch) => {
    const mps = (m.match_players ?? []).map((mp: RawMatchPlayer) => {
      const p = Array.isArray(mp.players) ? mp.players[0] : mp.players
      return {
        player_id: mp.player_id,
        display_name: p?.display_name ?? 'Unknown',
        won: mp.won,
        score_for: mp.score_for,
        score_against: mp.score_against,
      }
    })

    // Find winners side to get canonical score
    const winner = mps.find((mp) => mp.won)

    return {
      id: m.id,
      played_at: m.played_at,
      player_names: [...new Set(mps.map((mp) => mp.display_name))],
      score: winner ? `${winner.score_for} : ${winner.score_against}` : '? : ?',
      winner_names: mps.filter((mp) => mp.won).map((mp) => mp.display_name),
    }
  })

  return (
    <AdminPanel
      players={(players ?? []) as RawPlayer[]}
      matches={normalised}
    />
  )
}
