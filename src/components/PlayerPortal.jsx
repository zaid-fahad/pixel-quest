import { THEME } from "../constants/theme"; // Double check this path!
import RankingTable from './Rankboard'; 
import { Trophy, Code2, Lightbulb, ChevronRight, Crown, Terminal, Fingerprint, RefreshCw } from 'lucide-react';
import supabase from '../lib/supabase';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalTimer from './GlobalTimer';
import IUBPCLogo from "./IUBPCLogo";


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
    if (myPlayer?.id) {
      const pSub = supabase.channel(`p_${myPlayer.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `id=eq.${myPlayer.id}` }, payload => setMyPlayer(payload.new)).subscribe();
      return () => supabase.removeChannel(pSub);
    }
  }, [myPlayer?.id]);

  const join = async () => {
    if (isJoining || !joinCode || !nickname) return;
    setIsJoining(true);
    const { data: g } = await supabase.from('games').select('*').eq('join_code', joinCode.toUpperCase()).single();
    if (!g) { alert("Invalid Code"); setIsJoining(false); return; }
    // const avatars = ['👨‍💻', '👩‍💻', '🤖', '👾', '⚡', '💾'];
    const avatars = ['💀', '🦆', '🤖', '👾', '🐣', '🐧','🥲','😭','🙄','😴','🧐'];
    const { data: p } = await supabase.from('players').insert({ 
      game_id: g.id, 
      nickname, 
      avatar: avatars[Math.floor(Math.random() * avatars.length)] 
    }).select().single();
    if (p) { setGame(g); setMyPlayer(p); }
    setIsJoining(false);
  };

  const submit = async () => {
    if (!ans || !myPlayer) return;
    const currentRiddle = riddles[myPlayer.current_level];
    if (ans.toLowerCase().trim() === currentRiddle.answer.toLowerCase().trim()) {
      setFeedback('SUCCESS');
      const isLastLevel = myPlayer.current_level + 1 >= riddles.length;
      const updates = { current_level: myPlayer.current_level + 1, last_updated: new Date().toISOString() };
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

  // 1. JOIN SCREEN
 if (!game) {
    return (
      <div className="max-w-md mx-auto py-16 text-center animate-in fade-in zoom-in">
        <IUBPCLogo size="lg" />
        <h1 className={THEME.title}>QUEST_AUTH</h1>
        <div className={THEME.panel}>
          <div className="space-y-4">
            <div className="relative group">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input className={THEME.input + " pl-12 uppercase"} placeholder="SESSION_CODE" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            </div>
            <div className="relative group">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input className={THEME.input + " pl-12"} placeholder="USER_HANDLE" value={nickname} onChange={e => setNickname(e.target.value)} />
            </div>
            <button onClick={join} disabled={isJoining} className={THEME.btnPrimary + " w-full mt-2"}>
              {isJoining ? 'BOOTING...' : 'ESTABLISH LINK'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOBBY SCREEN (Logic remains the same)
  if (game.status === 'lobby') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-8 animate-in fade-in">
        <IUBPCLogo size="md" className="animate-pulse" />
        <h2 className="text-2xl font-mono text-white uppercase italic">Awaiting Start...</h2>
        <div className={THEME.panel}>
          <div className="text-7xl mb-4">{myPlayer?.avatar}</div>
          <div className="text-xl font-mono font-black text-emerald-400 border-t border-zinc-800 pt-4 uppercase">{myPlayer?.nickname}</div>
        </div>
      </div>
    );
  }

  const isFinished = riddles.length > 0 && myPlayer && myPlayer.current_level >= riddles.length;

  // 3. QUEST ENDED (Admin finished the game)
  if (game.status === 'finished') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-8 animate-in zoom-in">
        <IUBPCLogo size="sm" className="opacity-50" />
        <Trophy size={80} className="mx-auto text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
        <h2 className={THEME.title}>FINAL_RESULTS</h2>
        <div className={THEME.panel}>
          <RankingTable players={players} maxLevels={riddles.length} gameStartedAt={game.started_at} gameDuration={game.duration_seconds} compact />
        </div>
        <button onClick={() => window.location.reload()} className={THEME.btnSecondary + " w-full mt-4"}>RETURN_TO_TERMINAL</button>
      </div>
    );
  }

  // 4. PLAYER FINISHED EARLY (Game still active)
  if (isFinished && game.status === 'active') {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-8 animate-in slide-in-from-bottom-10">
        <IUBPCLogo size="md" className="animate-bounce" />
        <div className="space-y-2">
          <h2 className={THEME.title}>MISSION<br />ACCOMPLISHED</h2>
          <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase italic font-bold">Encrypted Data Sent to Admin</p>
        </div>
        
        <div className={THEME.panel}>
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-zinc-400 font-mono text-sm leading-relaxed">
            Excellent work, <span className="text-white font-bold">{myPlayer?.nickname}</span>. 
            The leaderboard is currently <span className="text-indigo-400 underline decoration-indigo-500/30">locked</span>. 
            It will be decrypted once the Admin concludes the session.
          </p>
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-center gap-4">
             <div className="text-left">
                <p className={THEME.label}>// CONNECTION</p>
                <p className="text-emerald-500 font-mono text-xs">STABLE</p>
             </div>
             <div className="h-8 w-px bg-zinc-800" />
             <div className="text-left">
                <p className={THEME.label}>// STATUS</p>
                <p className="text-white font-mono text-xs uppercase italic">STANDBY</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. ACTIVE GAME SCREEN
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 px-4">
      {/* Header and Riddle Logic remain exactly as you have them */}
      <div className="flex justify-between items-center">
        <IUBPCLogo size="md" />
        <GlobalTimer startedAt={game.started_at} durationSeconds={game.duration_seconds} />
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex items-center gap-4 backdrop-blur-md">
        <span className="text-3xl bg-black/40 p-2 rounded-xl border border-zinc-800">{myPlayer?.avatar}</span>
        <div>
          <p className="font-mono text-white text-sm font-black uppercase leading-none">{myPlayer?.nickname}</p>
          <p className="text-emerald-500 font-mono text-[10px] uppercase mt-1">LVL_{myPlayer?.current_level + 1}</p>
        </div>
      </div>

      <div className={THEME.panel + " min-h-[300px] flex flex-col justify-center"}>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className={`absolute inset-0 flex items-center justify-center z-20 font-mono font-black text-5xl backdrop-blur-md rounded-3xl ${feedback === 'SUCCESS' ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                {feedback === 'SUCCESS' ? '> SUCCESS' : '> ERROR'}
            </motion.div>
          )}
        </AnimatePresence>
        
        <h3 className={THEME.label}>// Current_Challenge.exe</h3>
        <p className="text-2xl font-bold text-white text-center leading-tight">
            {riddles[myPlayer?.current_level]?.question}
        </p>
        
        <div className="mt-auto flex justify-center pt-8">
            {showHint ? (
              <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30 text-indigo-300 text-xs font-mono italic">
                {riddles[myPlayer?.current_level]?.hint || 'No docs found.'}
              </div>
            ) : (
              <button onClick={() => setShowHint(true)} className="flex items-center gap-2 text-zinc-600 hover:text-indigo-400 text-[10px] font-mono uppercase font-bold">
                <Lightbulb size={14} /> Decrypt Hint
              </button>
            )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
            <Terminal size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-emerald-500 transition-colors" />
            <input className={THEME.input + " py-6 px-16 text-xl uppercase"} placeholder="TYPE_RESPONSE..." value={ans} onChange={e => setAns(e.target.value)} onKeyPress={e => e.key === 'Enter' && submit()} />
        </div>
        <button onClick={submit} className={THEME.btnPrimary + " w-full py-6 text-xl italic"}>
            RUN_COMMAND <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}