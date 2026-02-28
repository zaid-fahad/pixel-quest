-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- 2. CREATE TABLES (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "admin_id" uuid NOT NULL,
    "title" text NOT NULL,
    "join_code" text NOT NULL,
    "status" text NOT NULL DEFAULT 'lobby'::text,
    "duration_seconds" integer NOT NULL DEFAULT 600,
    "started_at" timestamp with time zone,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "games_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "games_join_code_key" UNIQUE ("join_code"),
    CONSTRAINT "games_status_check" CHECK (status = ANY (ARRAY['lobby'::text, 'active'::text, 'finished'::text]))
);

CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "game_id" uuid NOT NULL,
    "nickname" text NOT NULL,
    "avatar" text,
    "current_level" integer NOT NULL DEFAULT 0,
    "finished_at" timestamp with time zone,
    "last_updated" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."riddles" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "game_id" uuid NOT NULL,
    "question" text NOT NULL,
    "hint" text,
    "answer" text NOT NULL,
    "order_index" integer NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "riddles_pkey" PRIMARY KEY ("id")
);

-- 3. ENSURE NEW COLUMNS EXIST (If tables were created in a previous version)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='duration_seconds') THEN
        ALTER TABLE public.games ADD COLUMN duration_seconds integer NOT NULL DEFAULT 600;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='started_at') THEN
        ALTER TABLE public.games ADD COLUMN started_at timestamp with time zone;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='finished_at') THEN
        ALTER TABLE public.players ADD COLUMN finished_at timestamp with time zone;
    END IF;
END $$;

-- 4. FOREIGN KEYS
ALTER TABLE "public"."games" DROP CONSTRAINT IF EXISTS "games_admin_id_fkey";
ALTER TABLE "public"."games" ADD CONSTRAINT "games_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."players" DROP CONSTRAINT IF EXISTS "players_game_id_fkey";
ALTER TABLE "public"."players" ADD CONSTRAINT "players_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;

ALTER TABLE "public"."riddles" DROP CONSTRAINT IF EXISTS "riddles_game_id_fkey";
ALTER TABLE "public"."riddles" ADD CONSTRAINT "riddles_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_games_join_code ON public.games(join_code);
CREATE INDEX IF NOT EXISTS idx_players_game_id ON public.players(game_id);
CREATE INDEX IF NOT EXISTS idx_riddles_game_id ON public.riddles(game_id);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riddles ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES (DROP AND RECREATE TO ENSURE UPDATES)
DROP POLICY IF EXISTS "Admins can manage their own games" ON "public"."games";
CREATE POLICY "Admins can manage their own games" ON "public"."games" FOR ALL TO authenticated USING ((auth.uid() = admin_id));

DROP POLICY IF EXISTS "Public access to game info via join code" ON "public"."games";
CREATE POLICY "Public access to game info via join code" ON "public"."games" FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Players can update their own progress" ON "public"."players";
CREATE POLICY "Players can update their own progress" ON "public"."players" FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Public can join games" ON "public"."players";
CREATE POLICY "Public can join games" ON "public"."players" FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view player progress" ON "public"."players";
CREATE POLICY "Public can view player progress" ON "public"."players" FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage riddles" ON "public"."riddles";
CREATE POLICY "Admins can manage riddles" ON "public"."riddles" FOR ALL TO authenticated USING ((EXISTS (SELECT 1 FROM public.games WHERE games.id = riddles.game_id AND games.admin_id = auth.uid())));

DROP POLICY IF EXISTS "Players can view riddles for active games" ON "public"."riddles";
CREATE POLICY "Players can view riddles for active games" ON "public"."riddles" FOR SELECT TO public USING (true);

-- 8. REALTIME CONFIGURATION
-- Re-create publication to ensure all columns are tracked
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.games, public.players;

-- 9. GRANTS
GRANT ALL ON TABLE "public"."games" TO "anon", "authenticated", "service_role";
GRANT ALL ON TABLE "public"."players" TO "anon", "authenticated", "service_role";
GRANT ALL ON TABLE "public"."riddles" TO "anon", "authenticated", "service_role";