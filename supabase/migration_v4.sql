-- Migration v4: Game calendar events + RSVPs
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS game_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    uuid REFERENCES players(id) ON DELETE SET NULL,
  title         text NOT NULL,
  scheduled_at  timestamptz NOT NULL,
  court         text,
  notes         text,
  max_players   int DEFAULT 4,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id   uuid REFERENCES game_events(id) ON DELETE CASCADE,
  player_id  uuid REFERENCES players(id) ON DELETE CASCADE,
  status     text CHECK (status IN ('going', 'maybe', 'not_going')) DEFAULT 'going',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, player_id)
);

-- RLS
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- game_events: anyone can read, authenticated users can insert, only creator can update/delete
CREATE POLICY "Public read game_events"    ON game_events FOR SELECT USING (true);
CREATE POLICY "Auth insert game_events"    ON game_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator update game_events" ON game_events FOR UPDATE USING (
  created_by IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "Creator delete game_events" ON game_events FOR DELETE USING (
  created_by IN (SELECT id FROM players WHERE user_id = auth.uid())
);

-- event_rsvps: anyone can read, authenticated users can insert/update their own
CREATE POLICY "Public read event_rsvps"  ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Auth insert event_rsvps"  ON event_rsvps FOR INSERT WITH CHECK (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
CREATE POLICY "Auth update event_rsvps"  ON event_rsvps FOR UPDATE USING (
  player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
);
