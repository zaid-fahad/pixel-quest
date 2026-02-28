-- Add Timer columns to games
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 600 NOT NULL,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Add Final Time column to players
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE;

-- Ensure Realtime is still enabled
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
