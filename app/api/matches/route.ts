import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { PlayerValue, SetScore } from '@/lib/types'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function resolvePlayer(supabase: SupabaseClient, input: PlayerValue | null): Promise<string | null> {
  if (!input) return null
  if (input.type === 'existing') return input.id

  const { data, error } = await supabase
    .from('players')
    .insert({ display_name: input.display_name })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve the caller's player record (via user_id, not auth id directly)
  const { data: myPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!myPlayer) return NextResponse.json({ error: 'Player profile not found. Try signing out and back in.' }, { status: 400 })

  const body = await request.json() as {
    played_at: string
    my_partner: PlayerValue | null
    opp1: PlayerValue
    opp2: PlayerValue | null
    sets: SetScore[]
  }

  const { played_at, my_partner, opp1, opp2, sets } = body

  if (!opp1 || !sets?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Calculate game score from sets
  const score_for = sets.filter((s) => s.my > s.opp).length
  const score_against = sets.filter((s) => s.opp > s.my).length
  const won = score_for > score_against
  const setsFlipped = sets.map((s) => ({ my: s.opp, opp: s.my }))

  try {
    const [myPartnerId, opp1Id, opp2Id] = await Promise.all([
      resolvePlayer(supabase, my_partner),
      resolvePlayer(supabase, opp1),
      resolvePlayer(supabase, opp2),
    ])

    if (!opp1Id) throw new Error('Could not resolve opponent')

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({ played_at, created_by: myPlayer.id })
      .select('id')
      .single()

    if (matchError || !match) throw new Error(matchError?.message ?? 'Failed to create match')

    const rows = [
      { match_id: match.id, player_id: myPlayer.id, partner_id: myPartnerId, score_for, score_against, sets, won },
      { match_id: match.id, player_id: opp1Id, partner_id: opp2Id, score_for: score_against, score_against: score_for, sets: setsFlipped, won: !won },
    ]

    if (myPartnerId) {
      rows.push({ match_id: match.id, player_id: myPartnerId, partner_id: myPlayer.id, score_for, score_against, sets, won })
    }
    if (opp2Id) {
      rows.push({ match_id: match.id, player_id: opp2Id, partner_id: opp1Id, score_for: score_against, score_against: score_for, sets: setsFlipped, won: !won })
    }

    const { error: mpError } = await supabase.from('match_players').insert(rows)
    if (mpError) throw new Error(mpError.message)

    return NextResponse.json({ matchId: match.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
