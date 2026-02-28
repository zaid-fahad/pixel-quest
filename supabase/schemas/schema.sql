-- --
-- PIXELQUEST: DECLARATIVE DATABASE SCHEMA
-- This file represents the full desired state of the database.

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- 2. TABLES

-- GAMES: The core session table
CREATE TABLE "public"."games" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "join_code" "text" NOT NULL,
    "status" "text" DEFAULT 'lobby'::"text" NOT NULL,
    "duration_seconds" INTEGER DEFAULT 600 NOT NULL, -- Admin set timer (default 10 mins)
    "started_at" TIMESTAMP WITH TIME ZONE,            -- Set when admin starts the game
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    CONSTRAINT "games_status_check" CHECK (("status" = ANY (ARRAY['lobby'::"text", 'active'::"text", 'finished'::"text"])))
);

-- RIDDLES: The level data
CREATE TABLE "public"."riddles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "game_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "hint" "text",
    "answer" "text" NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL
);

-- PLAYERS: Real-time progress tracking
CREATE TABLE "public"."players" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "game_id" "uuid" NOT NULL,
    "nickname" "text" NOT NULL,
    "avatar" "text",
    "current_level" INTEGER DEFAULT 0 NOT NULL,
    "finished_at" TIMESTAMP WITH TIME ZONE,          -- Used to calculate total time for ranking
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL
);

-- 3. PRIMARY KEYS & CONSTRAINTS
ALTER TABLE ONLY "public"."games" ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."games" ADD CONSTRAINT "games_join_code_key" UNIQUE ("join_code");
ALTER TABLE ONLY "public"."riddles" ADD CONSTRAINT "riddles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."players" ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");

-- 4. FOREIGN KEYS
ALTER TABLE ONLY "public"."games" ADD CONSTRAINT "games_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."riddles" ADD CONSTRAINT "riddles_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."players" ADD CONSTRAINT "players_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."riddles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;

-- Games Policies
CREATE POLICY "Admins can manage their own games" ON "public"."games" FOR ALL TO "authenticated" USING (("auth"."uid"() = "admin_id"));
CREATE POLICY "Public access to game info via join code" ON "public"."games" FOR SELECT USING (true);

-- Riddles Policies
CREATE POLICY "Admins can manage riddles" ON "public"."riddles" FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1 FROM "public"."games" WHERE (("games"."id" = "riddles"."game_id") AND ("games"."admin_id" = "auth"."uid"())))));
CREATE POLICY "Players can view riddles for active games" ON "public"."riddles" FOR SELECT USING (true);

-- Players Policies
CREATE POLICY "Public can join games" ON "public"."players" FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update their own progress" ON "public"."players" FOR UPDATE USING (true);
CREATE POLICY "Public can view player progress" ON "public"."players" FOR SELECT USING (true);

-- 6. REALTIME REPLICATION
-- Enable Realtime for the publication
BEGIN;
DROP PUBLICATION IF EXISTS "supabase_realtime";
CREATE PUBLICATION "supabase_realtime";
COMMIT;

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."games";
ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."players";

-- 7. INDEXES
CREATE INDEX "idx_games_join_code" ON "public"."games" USING "btree" ("join_code");
CREATE INDEX "idx_players_game_id" ON "public"."players" USING "btree" ("game_id");
CREATE INDEX "idx_riddles_game_id" ON "public"."riddles" USING "btree" ("game_id");