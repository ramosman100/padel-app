import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { display_name?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { display_name } = body
  if (!display_name || typeof display_name !== 'string' || display_name.trim().length === 0) {
    return NextResponse.json({ error: 'display_name is required' }, { status: 400 })
  }

  const trimmed = display_name.trim().slice(0, 40)

  const { error } = await supabase
    .from('players')
    .update({ display_name: trimmed })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, display_name: trimmed })
}
