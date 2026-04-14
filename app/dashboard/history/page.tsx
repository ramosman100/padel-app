import { createSupabaseServerClient } from '@/lib/supabase-server'
import HistoryClient from './HistoryClient'
import type { AvatarConfig } from '@/components/avatar/AvatarSvg'

export const revalidate = 0

export type MatchRow = {
  id: string           // match id
  played_at: string
  won: boolean
  score_for: number
  score_against: number
  sets: { my: number; opp: number }[]
  // who was on my side
  partner: { id: string; display_name: string; avatar_config: Partial<AvatarConfig> | null } | null
  // opponents
  opponents: { id: string; display_name: string; avatar_config: Partial<AvatarConfig> | null }[]
}

function pickPlayer(raw: unknown): { id: string; display_name: string; avatar_config: Partial<AvatarConfig> | null } | null {
  if (!raw) return null
  const p = Array.isArray(raw) ? raw[0] : raw
  if (!p) return null
  return p as { id: string; display_name: string; avatar_config: Partial<AvatarConfig> | null }
}

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all match_players rows, joined with their match + partner + player info
  const { data: raw } = await supabase
    .from('match_players')
    .select(`
      match_id,
      won,
      score_for,
      score_against,
      sets,
      partner_id,
      player_id,
      players!match_players_player_id_fkey(id, display_name, avatar_config),
      partner:players!match_players_partner_id_fkey(id, display_name, avatar_config),
      matches!inner(id, played_at)
    `)
    .order('match_id', { ascending: false })
    .limit(200)

  // Group by match_id so we can show both sides per match
  type RawRow = {
    match_id: string
    won: boolean
    score_for: number
    score_against: number
    sets: { my: number; opp: number }[]
    partner_id: string | null
    player_id: string
    players: unknown
    partner: unknown
    matches: unknown
  }

  const matchMap = new Map<string, { played_at: string; rows: RawRow[] }>()
  for (const row of (raw ?? []) as RawRow[]) {
    const m = row.matches as { id: string; played_at: string } | null
    if (!m) continue
    if (!matchMap.has(row.match_id)) {
      matchMap.set(row.match_id, { played_at: m.played_at, rows: [] })
    }
    matchMap.get(row.match_id)!.rows.push(row)
  }

  // Get current player id (optional — used to mark "your" result)
  let myPlayerId: string | null = null
  if (user) {
    const { data: p } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .single()
    myPlayerId = p?.id ?? null
  }

  // Build MatchRow[] from my perspective if logged in, otherwise from any perspective
  const matches: MatchRow[] = []

  for (const [matchId, { played_at, rows }] of matchMap) {
    // Try to find "my" row first; fall back to first row
    const myRow = rows.find((r) => r.player_id === myPlayerId) ?? rows[0]
    if (!myRow) continue

    // Opponents are rows on the losing/other side
    const opponents = rows
      .filter((r) => r.won !== myRow.won && r.player_id !== myRow.player_id)
      .map((r) => pickPlayer(r.players))
      .filter(Boolean) as { id: string; display_name: string; avatar_config: Partial<AvatarConfig> | null }[]

    // Also include the partner listed in myRow
    const partner = pickPlayer(myRow.partner)

    matches.push({
      id: matchId,
      played_at,
      won: myRow.won,
      score_for: myRow.score_for,
      score_against: myRow.score_against,
      sets: (myRow.sets ?? []) as { my: number; opp: number }[],
      partner,
      opponents,
    })
  }

  // Collect all unique player names for filter dropdown
  const playerNames = Array.from(
    new Set(
      matches.flatMap((m) => [
        ...(m.partner ? [m.partner.display_name] : []),
        ...m.opponents.map((o) => o.display_name),
      ])
    )
  ).sort()

  return <HistoryClient matches={matches} myPlayerId={myPlayerId} playerNames={playerNames} />
}
