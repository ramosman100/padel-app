-- Migration v5: Admin role
-- Run in Supabase SQL Editor

-- 1. Add is_admin column to players
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Set YOUR account as admin (run after this migration)
--    Replace the email below with your actual email
UPDATE public.players
SET is_admin = true
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ramosman100@gmail.com');

-- 3. RLS: Admins can update any player row
CREATE POLICY IF NOT EXISTS "Admins can update any player" ON public.players
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );

-- 4. RLS: Admins can delete any player
CREATE POLICY IF NOT EXISTS "Admins can delete players" ON public.players
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.players p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );

-- 5. RLS: Admins can delete any match
CREATE POLICY IF NOT EXISTS "Admins can delete matches" ON public.matches
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.players p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );

-- 6. RLS: Admins can update any match
CREATE POLICY IF NOT EXISTS "Admins can update matches" ON public.matches
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );

-- 7. RLS: Admins can update any match_player row
CREATE POLICY IF NOT EXISTS "Admins can update match_players" ON public.match_players
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );

-- 8. RLS: Admins can delete any match_player row
CREATE POLICY IF NOT EXISTS "Admins can delete match_players" ON public.match_players
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.players p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );

-- 9. RLS: Admins can insert match_players (needed for re-logging corrected matches)
CREATE POLICY IF NOT EXISTS "Admins can insert match_players" ON public.match_players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.players p WHERE p.user_id = auth.uid() AND p.is_admin = true)
  );
