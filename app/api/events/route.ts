import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('game_events')
    .select(`
      id, title, scheduled_at, court, notes, max_players, created_at,
      created_by,
      players!game_events_created_by_fkey(display_name, avatar_config),
      event_rsvps(player_id, status, players!event_rsvps_player_id_fkey(display_name, avatar_config))
    `)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!player) return NextResponse.json({ error: 'Player profile not found' }, { status: 400 })

  let body: { title?: string; scheduled_at?: string; court?: string; notes?: string; max_players?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, scheduled_at, court, notes, max_players } = body

  if (!title?.trim() || !scheduled_at) {
    return NextResponse.json({ error: 'title and scheduled_at are required' }, { status: 400 })
  }

  const { data: event, error } = await supabase
    .from('game_events')
    .insert({
      created_by: player.id,
      title: title.trim(),
      scheduled_at,
      court: court?.trim() || null,
      notes: notes?.trim() || null,
      max_players: max_players ?? 4,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-RSVP the creator as "going"
  await supabase.from('event_rsvps').insert({
    event_id: event.id,
    player_id: player.id,
    status: 'going',
  })

  return NextResponse.json({ eventId: event.id }, { status: 201 })
}
