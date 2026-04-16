import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('players').select('id, is_admin').eq('user_id', user.id).single()
  if (!data?.is_admin) return null
  return { supabase, adminId: data.id }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await checkAdmin()
  if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { supabase } = result
  const { id } = await params

  const body = await req.json() as { display_name?: string; is_admin?: boolean }
  const update: Record<string, unknown> = {}
  if (body.display_name !== undefined) update.display_name = body.display_name.trim().slice(0, 40)
  if (body.is_admin !== undefined) update.is_admin = body.is_admin

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await supabase.from('players').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await checkAdmin()
  if (!result) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { supabase, adminId } = result
  const { id } = await params

  // Prevent self-deletion
  if (id === adminId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
