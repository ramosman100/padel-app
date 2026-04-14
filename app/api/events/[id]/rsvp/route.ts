import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!player) return NextResponse.json({ error: 'Player profile not found' }, { status: 400 })

  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status = body.status
  if (!['going', 'maybe', 'not_going'].includes(status ?? '')) {
    return NextResponse.json({ error: 'status must be going | maybe | not_going' }, { status: 400 })
  }

  // Upsert so player can change their RSVP
  const { error } = await supabase
    .from('event_rsvps')
    .upsert({ event_id: eventId, player_id: player.id, status }, { onConflict: 'event_id,player_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
