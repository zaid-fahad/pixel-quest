🕹️ PIXEL QUEST

PixelQuest is a hybrid online/offline treasure hunt engine designed with a retro 2D-platformer aesthetic. Inspired by the high-energy competitive nature of Kahoot, it allows a "Master" to create complex quests involving riddles and hints, while "Adventurers" compete in real-time to solve them before the clock runs out.

🎨 Aesthetic & Vibe

PixelQuest is built to feel like an indie game from the 90s:

UI/UX: Deep Zinc-950 backgrounds with high-contrast Emerald and Amber accents.

Visual Effects: Integrated CRT scanline overlays and pixel-perfect panel borders.

Animations: Bouncy, sprite-like transitions powered by Framer Motion.

Leaderboard: A high-stakes ranking table that tracks not just progress, but precision timing.

🚀 Technical Stack

Frontend: React (Vite)

Styling: Tailwind CSS 4 (using the high-performance lightning-css engine)

Backend/Database: Supabase (PostgreSQL)

Real-time: Supabase Realtime (Postgres Changes & Broadcast)

Auth: Supabase Auth (Admin login/signup)

Icons: Lucide React

✨ Features

👑 Master Portal (Admin)

Quest Forger: Create levels with riddles, optional hints, and answers.

Dungeon Clock: Set a custom duration (minutes) for the entire quest.

Hero Summoning: Generate unique Join Codes and auto-generated QR codes for physical/offline entry.

Live Monitoring: A real-time ranking table showing exactly which level every player is on and their total elapsed time.

🏹 Adventurer Portal (Player)

Easy Entry: Join via a 6-character code or by scanning a QR link.

Gameplay: Real-time riddle solving. Solve the current level to "unlock" the next.

Hint System: Request a secret hint if you get stuck (managed by the Master).

Synchronized Timer: A global countdown visible to all players simultaneously.

Finish Line: Automatic transition to a "Quest Completed" state, waiting for the Master to officially end the session and announce winners.

🛠️ Local Setup

1. Prerequisites

Node.js (v18+)

Supabase Account & CLI

2. Database Initialization

Use the provided update_schema.sql file in your Supabase SQL Editor to establish the database structure. This script is idempotent and handles:

Tables: games, riddles, players.

Policies: Row Level Security (RLS) for Admin-only management and public player progress.

Realtime: Enables replication for instant UI updates.

3. Frontend Installation

# Clone the repository
git clone [https://github.com/your-repo/pixel-quest.git](https://github.com/your-repo/pixel-quest.git)
cd pixel-quest

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env


4. Configuration

Add your Supabase credentials to the .env file:

VITE_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
VITE_SUPABASE_ANON_KEY=your-public-anon-key


5. Launch

npm run dev


🏆 Ranking Logic

The leaderboard uses a two-tier sorting system to declare winners:

Current Level: Players on a higher level always rank higher.

Total Time: If levels are tied, the player who reached that level first (or finished the game faster) takes the lead.

🗺️ Roadmap

[ ] Support for image-based riddles (Supabase Storage).

[ ] Point-based scoring (hints cost points).

[ ] Sound effect pack (8-bit fanfares).

[ ] Multi-admin support for co-hosting quests.

Forge your quest. Summon your heroes. Start the clock. 🏁