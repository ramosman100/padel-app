-- Migration v3: Avatar customization + profile fields
-- Run this in the Supabase SQL editor

ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_config jsonb DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS motto text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS favorite_court text;

-- Allow authenticated users to update their own avatar_config / motto / court
-- (existing UPDATE policy on players already covers this if using user_id = auth.uid())
-- No new RLS policies needed — existing UPDATE policy handles it.
