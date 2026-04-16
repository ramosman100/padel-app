import { createSupabaseServerClient } from './supabase-server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: player } = await supabase
    .from('players')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .single()

  if (!player?.is_admin) redirect('/dashboard')

  return { user, player, supabase }
}

export async function getIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase
      .from('players')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()
    return data?.is_admin === true
  } catch {
    return false
  }
}
