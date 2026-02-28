// --- 6. PLAYER PORTAL COMPONENT (src/components/PlayerPortal.jsx) ---
import { THEME } from ".././constants/theme"
import Rankboard from '.././components/Rankboard';
import { Trophy, Gamepad2, Lightbulb, ChevronRight, Crown } from 'lucide-react';
import supabase from '.././lib/supabase';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';



export default function PlayerPortal({ game, setGame, players }) {
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [myPlayer, setMyPlayer] = useState(null);
  const [ans, setAns] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [riddles, setRiddles] = useState([]);
  const [isJoining, setIsJoining] = useState(false);

  // Fix: Correctly parse code from Hash URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryStr = hash.split('?')[1];
      const params = new URLSearchParams(queryStr);
      const codeFromUrl = params.get('code');
      if (codeFromUrl && !joinCode) setJoinCode(codeFromUrl.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (game?.id) {
      supabase
        .from('riddles')
        .select('*')
        .eq('game_id', game.id)
        .order('order_index', { ascending: true })
        .then(({ data }) => setRiddles(data || []));
    }
  }, [game?.id]);

  useEffect(() => {
    if (myPlayer) {
      const pSub = supabase
        .channel(`player_${myPlayer.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `id=eq.${myPlayer.id}` }, 
          payload => setMyPlayer(payload.new)
        ).subscribe();
      return () => supabase.removeChannel(pSub);
    }
  }, [myPlayer?.id]);

  const join = async () => {
    if (!joinCode || !nickname || isJoining) return;
    setIsJoining(true);
    const { data: g } = await supabase.from('games').select('*').eq('join_code', joinCode.toUpperCase()).single();
    if (!g) {
      alert("Dungeon code invalid!");
      setIsJoining(false);
      return;
    }
    
    const { data: p, error } = await supabase.from('players').insert({
      game_id: g.id,
      nickname,
      avatar: ['🧙‍♂️', '🧝‍♀️', '🧛‍♂️', '🤺', '🏹', '🏴‍☠️', '🐉', '🐈‍⬛'][Math.floor(Math.random() * 8)]
    }).select().single();
    
    if (p) {
      setGame(g);
      setMyPlayer(p);
    } else {
      console.error("Join error:", error);
    }
    setIsJoining(false);
  };

  const submit = async () => {
    if (!ans || !myPlayer) return;
    const currentRiddle = riddles[myPlayer.current_level];
    if (ans.toLowerCase().trim() === currentRiddle.answer.toLowerCase().trim()) {
      setFeedback('YES!');
      const { data } = await supabase.from('players')
        .update({ current_level: myPlayer.current_level + 1, last_updated: new Date() })
        .eq('id', myPlayer.id)
        .select()
        .single();
      if (data) setMyPlayer(data);
      setAns('');
      setShowHint(false);
    } else {
      setFeedback('NO!');
    }
    setTimeout(() => setFeedback(null), 1500);
  };

  if (!game) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-in zoom-in duration-500">
        <Gamepad2 size={64} className="mx-auto text-emerald-500 mb-6 animate-bounce" />
        <h1 className={THEME.title}>ENTER QUEST</h1>
        <div className={THEME.panel}>
          <div className="space-y-4">
            <input className={THEME.input + " text-center text-2xl uppercase tracking-widest"} placeholder="JOIN CODE" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            <input className={THEME.input + " text-center"} placeholder="HERO NAME" value={nickname} onChange={e => setNickname(e.target.value)} />
            <button onClick={join} disabled={isJoining} className={THEME.btnPrimary + " w-full disabled:opacity-50"}>
              {isJoining ? 'Joining...' : 'ENTER DUNGEON'}
            </button>
          </div>
          <div className="mt-8 text-center opacity-50 hover:opacity-100 transition-opacity">
            <a href="#/admin" className="text-[10px] uppercase font-black tracking-widest text-zinc-500 hover:text-emerald-500 flex items-center justify-center gap-1">
              <Crown size={12} /> Master Entrance
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (game.status === 'lobby') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-8">
        <div className="flex justify-center"><div className="w-16 h-16 border-4 border-t-emerald-500 border-zinc-800 rounded-full animate-spin"></div></div>
        <h2 className="text-2xl font-black uppercase italic tracking-widest text-emerald-400 animate-pulse">Waiting for Master to Start...</h2>
        <div className={THEME.panel}>
           <h3 className={THEME.label}>Your Character</h3>
           <div className="text-6xl mb-2">{myPlayer?.avatar}</div>
           <div className="text-xl font-black uppercase tracking-tighter">{myPlayer?.nickname}</div>
        </div>
      </div>
    );
  }

  // --- LOGIC: If player finished but game is still ACTIVE ---
  // Ensure riddles are loaded before checking completion
  const isFinished = riddles.length > 0 && myPlayer && myPlayer.current_level >= riddles.length;

  if (isFinished && game.status === 'active') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <Trophy size={80} className="mx-auto text-amber-500 opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw size={32} className="text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-3xl font-black uppercase italic text-emerald-400 tracking-tighter leading-none">Quest Completed!</h2>
        <div className={THEME.panel}>
          <p className="text-zinc-400 font-bold uppercase text-[10px] mb-4 tracking-widest">All riddles solved.</p>
          <div className="bg-zinc-800 p-6 border-2 border-dashed border-zinc-700 shadow-inner">
            <p className="text-amber-400 font-black animate-pulse text-sm">WAITING FOR THE MASTER TO DECLARE VICTORY...</p>
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em]">The Final Ranking will appear once the session ends.</p>
      </div>
    );
  }

  // --- LOGIC: If game is officially FINISHED (Winners Screen) ---
  if (game.status === 'finished') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8 animate-in fade-in duration-1000">
        <Trophy size={80} className="mx-auto text-amber-500 animate-bounce" />
        <h2 className="text-5xl font-black uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-lg">QUEST OVER!</h2>
        <div className={THEME.panel + " border-emerald-500"}>
          <h3 className={THEME.label}>Final Rankboard</h3>
          <Rankboard players={players} maxLevels={riddles.length} compact />
        </div>
        <button onClick={() => window.location.reload()} className={THEME.btnSecondary}>Return to Home Realm</button>
      </div>
    );
  }

  if (!myPlayer || riddles.length === 0) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-emerald-500 font-mono animate-pulse uppercase text-xs tracking-[0.3em]">
      Preparing Dungeon...
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in slide-in-from-bottom-8">
      <div className="flex flex-wrap justify-between items-center bg-zinc-900 border-4 border-zinc-800 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-4">
        <span className="text-3xl">{myPlayer.avatar} <span className="text-lg font-black uppercase tracking-tighter">{myPlayer.nickname}</span></span>
        <div className="text-right">
          <p className="text-[8px] text-zinc-500 uppercase font-black mb-1">Current Progress</p>
          <span className="text-emerald-400 font-black text-2xl">LVL {myPlayer.current_level + 1} / {riddles.length}</span>
        </div>
      </div>

      <div className={THEME.panel + " min-h-[320px] flex flex-col justify-center relative overflow-hidden"}>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 2 }} exit={{ scale: 0 }} className={`absolute inset-0 flex items-center justify-center z-20 font-black italic text-6xl ${feedback === 'YES!' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
        <h3 className={THEME.label}>Active Riddle</h3>
        <p className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight mb-12">
          {riddles[myPlayer.current_level]?.question}
        </p>
        
        {showHint ? (
          <div className="bg-amber-950/40 p-4 border-l-4 border-amber-500 text-amber-200 text-sm italic animate-in slide-in-from-left">
            "Psst... {riddles[myPlayer.current_level]?.hint || 'No help for this one, hero!'}"
          </div>
        ) : (
          <button onClick={() => setShowHint(true)} className="flex items-center gap-2 text-zinc-600 hover:text-amber-500 text-[10px] font-black uppercase tracking-widest transition-colors mt-auto">
            <Lightbulb size={14} /> Reveal Secret Hint
          </button>
        )}
      </div>

      <div className="space-y-4">
        <input 
          className={THEME.input + " text-2xl py-6 text-center uppercase tracking-[0.2em]"} 
          placeholder="TYPE ANSWER..." 
          value={ans} 
          onChange={e => setAns(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && submit()} 
        />
        <button onClick={submit} className={THEME.btnPrimary + " w-full py-6 text-xl"}>UNLOCK NEXT LEVEL <ChevronRight /></button>
      </div>
    </div>
  );
}
