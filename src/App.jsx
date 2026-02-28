import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Play, Trash2, ChevronRight, Lightbulb, 
  CheckCircle, Crown, Lock, LogOut, Settings,
  ArrowRight, ShieldCheck, Gamepad2, Users, Plus, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import supabase from './lib/supabase';
import AdminPortal from './components/AdminPortal';
import PlayerPortal from './components/PlayerPortal';



// --- 7. MAIN APP ENTRY (src/App.jsx) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState(window.location.hash || '#/player');
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    const handleHash = () => setView(window.location.hash || '#/player');
    window.addEventListener('hashchange', handleHash);
    setLoading(false);
    return () => { subscription.unsubscribe(); window.removeEventListener('hashchange', handleHash); };
  }, []);

  useEffect(() => {
    if (!game?.id) return;
    const gSub = supabase.channel(`g_${game.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${game.id}` }, payload => setGame(payload.new)).subscribe();
    const pSub = supabase.channel(`ps_${game.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${game.id}` }, () => fetchPlayers(game.id)).subscribe();
    fetchPlayers(game.id);
    return () => { supabase.removeChannel(gSub); supabase.removeChannel(pSub); };
  }, [game?.id]);

  const fetchPlayers = async (gid) => {
    const { data } = await supabase.from('players').select('*').eq('game_id', gid);
    if (data) setPlayers(data);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-mono animate-pulse">INITIALIZING...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-zinc-100 font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {view.startsWith('#/admin') ? (
          <AdminPortal user={user} game={game} setGame={setGame} players={players} />
        ) : (
          <PlayerPortal game={game} setGame={setGame} players={players} />
        )}
      </div>
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50 bg-[length:100%_4px,3px_100%] opacity-20"></div>
    </div>
  );
}