import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('players').select('is_admin').eq('user_id', user.id).single()
  if (!data?.is_admin) return null
  return supabase
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await checkAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params

  // Delete match_players first (cascade should handle it, but be explicit)
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await checkAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const body = await req.json() as { played_at?: string }

  if (body.played_at) {
    const { error } = await supabase
      .from('matches')
      .update({ played_at: body.played_at })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
