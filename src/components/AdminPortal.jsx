// --- 5. ADMIN PORTAL COMPONENT (src/components/AdminPortal.jsx) ---
import CreateQuest from '.././components/CreateQuest';
import { THEME } from ".././constants/theme"
import { ShieldCheck, UserPlus, LogIn, LogOut, Plus, Radio } from 'lucide-react';
import supabase from '.././lib/supabase';
import { useState } from 'react';
import { useEffect } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { QrCode, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import formatTime from '.././lib/timerHelper';
import RankingTable from '.././components/Rankboard';
import GlobalTimer from './GlobalTimer';
import IUBPCLogo from './IUBPCLogo';
// import { useRef } from 'react';
// import { useCallback } from 'react';

export default function AdminPortal({ user, game, setGame, players }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [myGames, setMyGames] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [maxLv, setMaxLv] = useState(0);

  useEffect(() => {
    if (game?.id) {
      supabase.from('riddles').select('id', { count: 'exact' }).eq('game_id', game.id).then(({ count }) => setMaxLv(count || 0));
    }
  }, [game?.id]);

  useEffect(() => {
    if (user && !game) fetchMyGames();
  }, [user, game]);

  const fetchMyGames = async () => {
    const { data } = await supabase.from('games').select('*').eq('admin_id', user.id).order('created_at', { ascending: false });
    if (data) setMyGames(data);
  };

  const startQuest = async () => {
    const { data } = await supabase
      .from('games')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', game.id)
      .select()
      .single();
    if (data) setGame(data);
  };

  const endQuest = async () => {
    const { data } = await supabase.from('games').update({ status: 'finished' }).eq('id', game.id).select().single();
    if (data) setGame(data);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <IUBPCLogo size="lg" />
        <h1 className={THEME.title}>IUBPC</h1>
        <div className={THEME.panel}>
          <div className="space-y-4">
            <input className={THEME.input} type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input className={THEME.input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={async () => {
              const { error } = isRegistering 
                ? await supabase.auth.signUp({ email, password })
                : await supabase.auth.signInWithPassword({ email, password });
              if (error) setStatusMsg(error.message);
            }} className={THEME.btnPrimary + " w-full"}>
              {isRegistering ? 'SIGN UP' : 'LOGIN'}
            </button>
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-[10px] text-zinc-500 uppercase hover:text-emerald-500">{isRegistering ? 'Login' : 'Need an account?'}</button>
            {statusMsg && <p className="text-rose-500 text-[10px] uppercase font-bold">{statusMsg}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) return <CreateQuest user={user} onCancel={() => setIsCreating(false)} onCreated={(g) => { setGame(g); setIsCreating(false); }} />;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4">

<div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-8 mb-8 gap-6">
  {/* Branding & Status Section */}
  <div className="flex items-center gap-5">
    <IUBPCLogo size="md" className="mb-0" /> 
    <div className="h-10 w-[1px] bg-zinc-800 hidden md:block" /> {/* Vertical Divider */}
    <div>
      <h1 className={`${THEME.title} !mb-0 leading-none`}>
        Treasure<span className="text-white">Hunt</span>
      </h1>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <Radio size={10} className="text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-tighter">System_Online</span>
        </div>
        <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest hidden sm:block">
          Admin: {user?.email?.split('@')[0] || 'root'}
        </span>
      </div>
    </div>
  </div>

  {/* Action Section */}
  <div className="flex items-center gap-3">
    <button 
      onClick={() => setIsCreating(true)} 
      className={`${THEME.btnPrimary} !py-2.5 !px-5 text-sm shadow-emerald-500/10`}
    >
      <Plus size={18} /> 
      <span className="hidden sm:inline">NEW_QUEST</span>
    </button>
    
    <button 
      onClick={() => supabase.auth.signOut()} 
      className="p-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all border border-transparent hover:border-rose-500/20 group"
      title="Exit System"
    >
      <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
    </button>
  </div>
</div>

      {!game ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myGames.map(g => (
            <div key={g.id} className={THEME.panel + " cursor-pointer group hover:border-emerald-500"} onClick={() => setGame(g)}>
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-black uppercase italic group-hover:text-emerald-400">{g.title}</h4>
                <span className="text-[8px] bg-zinc-800 px-2 py-1 uppercase font-black">{g.status}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>CODE: {g.join_code}</span>
                <span>{formatTime(g.duration_seconds)} Limit</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={THEME.panel}>
              <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <button onClick={() => setGame(null)} className="text-zinc-500 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase"><ArrowRight size={12} className="rotate-180" /> Back</button>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-emerald-400 italic uppercase tracking-tighter">{game.title}</h2>
                  <p className="text-zinc-500 font-mono text-lg">JOIN CODE: <span className="text-white bg-zinc-800 px-2 font-bold">{game.join_code}</span></p>
                </div>
                <div className="flex gap-2">
                  {game.status === 'lobby' && <button onClick={startQuest} className={THEME.btnPrimary}>START QUEST</button>}
                  {game.status === 'active' && <button onClick={endQuest} className="bg-rose-600 hover:bg-rose-500 text-white p-3 font-bold border-b-4 border-rose-900 uppercase text-xs">END QUEST</button>}
                  <button onClick={() => setShowInvite(true)} className="bg-slate-800 p-3 border-b-4 border-slate-700 hover:text-emerald-400"><QrCode size={18} /></button>
                </div>
              </div>

              {game.status === 'active' && (
                <div className="mb-8">
                  <GlobalTimer startedAt={game.started_at} durationSeconds={game.duration_seconds} onExpire={endQuest} isMaster />
                </div>
              )}

              <h3 className={THEME.label}>Dungeon Rankings</h3>
              <RankingTable players={players} maxLevels={maxLv} gameStartedAt={game.started_at} gameDuration={game.duration_seconds} />
            </div>
          </div>
          
          <div className={THEME.panel}>
            <h3 className={THEME.label}>Adventurers ({players.length})</h3>
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.id} className="p-3 bg-slate-800 flex justify-between items-center border-l-4 border-emerald-500">
                  <span className="font-bold text-sm">{p.avatar} {p.nickname}</span>
                  <span className="text-[10px] text-zinc-500 font-black">LVL {p.current_level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showInvite && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className={THEME.panel + " max-w-sm w-full relative"}>
              <button onClick={() => setShowInvite(false)} className="absolute top-4 right-4 text-zinc-500"><X size={20} /></button>
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-black italic uppercase text-emerald-400">Summon Heroes</h3>
                <div className="bg-white p-4 inline-block shadow-[8px_8px_0px_0px_#10b981]">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/player?code=' + game?.join_code)}`} className="w-48 h-48" />
                
                </div>
                <div className="bg-slate-950 p-3 font-mono font-black text-3xl tracking-[0.3em] text-emerald-400">{game?.join_code}</div>
              <button 
                    onClick={() => {
                      const link = window.location.origin + window.location.pathname + '#/player?code=' + game?.join_code;
                      navigator.clipboard.writeText(link);
                      alert("Link copied to clipboard!");
                    }}
                    className="text-[10px] text-emerald-500 hover:underline uppercase font-bold"
                  >
                    Copy Invitation Link
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
