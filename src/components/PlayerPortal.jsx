// --- 6. PLAYER PORTAL COMPONENT (src/components/PlayerPortal.jsx) ---
import { THEME } from ".././constants/theme"
import RankingTable from '.././components/Rankboard'; // Ensure this filename matches
import { Trophy, Code2, Lightbulb, ChevronRight, Crown, Terminal, Fingerprint, RefreshCw } from 'lucide-react';
import supabase from '.././lib/supabase';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalTimer from './GlobalTimer';

export default function PlayerPortal({ game, setGame, players }) {
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [myPlayer, setMyPlayer] = useState(null);
  const [ans, setAns] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [riddles, setRiddles] = useState([]);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      const code = params.get('code');
      if (code) setJoinCode(code.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (game?.id) {
      supabase.from('riddles').select('*').eq('game_id', game.id).order('order_index', { ascending: true }).then(({ data }) => setRiddles(data || []));
    }
  }, [game?.id]);

  useEffect(() => {
    if (myPlayer) {
      const pSub = supabase.channel(`p_${myPlayer.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `id=eq.${myPlayer.id}` }, payload => setMyPlayer(payload.new)).subscribe();
      return () => supabase.removeChannel(pSub);
    }
  }, [myPlayer?.id]);

  const join = async () => {
    if (isJoining || !joinCode || !nickname) return;
    setIsJoining(true);
    try {
      const { data: g } = await supabase.from('games').select('*').eq('join_code', joinCode.toUpperCase()).single();
      if (!g) { alert("Invalid Code"); setIsJoining(false); return; }
      const avatars = ['👨‍💻', '👩‍💻', '🤖', '👾', '⚡', '💾', '🛰️', '🛡️'];
      const { data: p } = await supabase.from('players').insert({ 
        game_id: g.id, 
        nickname, 
        avatar: avatars[Math.floor(Math.random() * avatars.length)] 
      }).select().single();
      if (p) { setGame(g); setMyPlayer(p); }
    } catch (err) {
      console.error(err);
    }
    setIsJoining(false);
  };

  const submit = async () => {
    if (!ans || !myPlayer) return;
    const currentRiddle = riddles[myPlayer.current_level];
    if (ans.toLowerCase().trim() === currentRiddle.answer.toLowerCase().trim()) {
      setFeedback('SUCCESS');
      const isLastLevel = myPlayer.current_level + 1 >= riddles.length;
      const updates = { 
        current_level: myPlayer.current_level + 1, 
        last_updated: new Date().toISOString() 
      };
      if (isLastLevel) updates.finished_at = new Date().toISOString();
      
      const { data } = await supabase.from('players').update(updates).eq('id', myPlayer.id).select().single();
      if (data) setMyPlayer(data);
      setAns('');
      setShowHint(false);
    } else {
      setFeedback('ERROR');
    }
    setTimeout(() => setFeedback(null), 1500);
  };

  // 1. JOIN VIEW
  if (!game) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-in fade-in slide-in-from-bottom-8">
        <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Code2 size={48} className="text-white" />
            </div>
        </div>
        <h1 className={THEME.title}>IUBPC QUEST_</h1>
        <p className="text-zinc-500 font-mono text-[10px] tracking-widest mb-8 uppercase">// Connection Pending</p>
        
        <div className={THEME.panel}>
          <div className="space-y-4">
            <div className="relative">
                <Terminal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input className={THEME.input + " pl-12 uppercase tracking-widest"} placeholder="SESSION_CODE" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            </div>
            <div className="relative">
                <Fingerprint size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input className={THEME.input + " pl-12"} placeholder="USER_HANDLE" value={nickname} onChange={e => setNickname(e.target.value)} />
            </div>
            <button onClick={join} disabled={isJoining} className={THEME.btnSecondary + " w-full mt-2"}>
                {isJoining ? 'BOOTING...' : 'ESTABLISH LINK'}
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <a href="#/admin" className="text-[10px] font-mono text-zinc-600 hover:text-emerald-500 flex items-center justify-center gap-2 transition-colors">
                <Crown size={12} /> ROOT_ACCESS
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOBBY VIEW
  if (game.status === 'lobby') {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-8 animate-pulse">
        <RefreshCw size={48} className="text-emerald-500 animate-spin mx-auto" />
        <h2 className="text-2xl font-mono text-white italic tracking-widest uppercase">Syncing with Host...</h2>
        <div className={THEME.panel}>
           <div className="text-7xl mb-4 drop-shadow-2xl">{myPlayer?.avatar}</div>
           <div className="text-xl font-mono font-black text-emerald-400 border-t border-zinc-800 pt-4 uppercase">{myPlayer?.nickname}</div>
        </div>
      </div>
    );
  }

  const isFinished = riddles.length > 0 && myPlayer && myPlayer.current_level >= riddles.length;

  // 3. FINISHED VIEW
  if (game.status === 'finished' || (isFinished && game.status === 'active')) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8 animate-in zoom-in">
        <Trophy size={80} className="mx-auto text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
        <h2 className={THEME.title}>
          {game.status === 'finished' ? 'SYSTEM_SHUTDOWN' : 'TASK_COMPLETE'}
        </h2>
        <div className={THEME.panel}>
          <h3 className={THEME.label}>Final Rankings</h3>
          <RankingTable players={players} maxLevels={riddles.length} gameStartedAt={game.started_at} gameDuration={game.duration_seconds} compact />
        </div>
        {game.status === 'finished' && <button onClick={() => window.location.reload()} className={THEME.btnSecondary + " w-full"}>RETURN_TO_BASE</button>}
      </div>
    );
  }

  // 4. ACTIVE RIDDLE VIEW
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 px-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 p-3 pr-6 rounded-2xl flex items-center gap-4 flex-1 backdrop-blur-md">
          <span className="text-3xl bg-black/40 p-2 rounded-xl border border-zinc-800">{myPlayer?.avatar}</span>
          <div>
            <p className="font-mono text-white text-sm font-black uppercase leading-none tracking-tighter">{myPlayer?.nickname}</p>
            <p className="text-emerald-500 font-mono text-[10px] uppercase mt-1">LVL_{myPlayer?.current_level + 1}</p>
          </div>
        </div>
        <GlobalTimer startedAt={game.started_at} durationSeconds={game.duration_seconds} />
      </div>

      <div className={THEME.panel + " min-h-[350px] flex flex-col justify-center"}>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                className={`absolute inset-0 flex items-center justify-center z-20 font-mono font-black italic text-5xl backdrop-blur-md ${feedback === 'SUCCESS' ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                {feedback === 'SUCCESS' ? '> SUCCESS' : '> ERROR'}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center gap-2 mb-6 opacity-40">
            <Code2 size={14} className="text-emerald-500" />
            <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Active_Process.log</span>
        </div>

        <p className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug mb-10 text-center">
            {riddles[myPlayer?.current_level]?.question}
        </p>
        
        <div className="mt-auto flex justify-center">
            {showHint ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/30 text-indigo-300 text-xs font-mono italic">
                <span className="text-indigo-500 font-bold mr-2">// DOCS:</span>
                {riddles[myPlayer?.current_level]?.hint || 'No documentation found.'}
              </motion.div>
            ) : (
              <button onClick={() => setShowHint(true)} className="flex items-center gap-2 text-zinc-600 hover:text-indigo-400 text-[10px] font-mono font-black uppercase tracking-widest transition-colors">
                <Lightbulb size={14} /> Decrypt Hint
              </button>
            )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
            <Terminal size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" />
            <input 
                className={THEME.input + " py-6 px-16 text-xl uppercase group-focus:border-emerald-500 shadow-2xl shadow-black/40"} 
                placeholder="TYPE_RESPONSE..." 
                value={ans} 
                onChange={e => setAns(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && submit()} 
            />
        </div>
        <button onClick={submit} className={THEME.btnPrimary + " w-full py-6 text-xl italic"}>
            RUN_COMMAND <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}