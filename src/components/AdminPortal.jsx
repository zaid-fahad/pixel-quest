// --- 5. ADMIN PORTAL COMPONENT (src/components/AdminPortal.jsx) ---
import Rankboard from '.././components/Rankboard';
import CreateQuest from '.././components/CreateQuest';
import { THEME } from ".././constants/theme"
import { ShieldCheck, UserPlus, LogIn, Plus } from 'lucide-react';
import supabase from '.././lib/supabase';
import { useState } from 'react';
import { useEffect } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { QrCode, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// import { useRef } from 'react';
// import { useCallback } from 'react';

export default function AdminPortal({ user, game, setGame, players }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [myGames, setMyGames] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [riddleCount, setRiddleCount] = useState(0);

  // Fetch riddle count for the active game to scale the map
  useEffect(() => {
    if (game?.id) {
      supabase
        .from('riddles')
        .select('id', { count: 'exact' })
        .eq('game_id', game.id)
        .then(({ count }) => setRiddleCount(count || 0));
    }
  }, [game?.id]);

  useEffect(() => {
    if (user && !game) {
      fetchMyGames();
    }
  }, [user, game]);

  const fetchMyGames = async () => {
    setIsLoadingGames(true);
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setMyGames(data);
    setIsLoadingGames(false);
  };

  const handleAuth = async () => {
    setStatusMsg('');
    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setStatusMsg(`Error: ${error.message}`);
      else setStatusMsg('Check your email for confirmation!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setStatusMsg(`Error: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 animate-in fade-in duration-700">
        <h1 className={THEME.title + " text-center"}>MASTER PORTAL</h1>
        <div className={THEME.panel}>
          <div className="space-y-4">
            <input className={THEME.input} type="email" placeholder="Master Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className={THEME.input} type="password" placeholder="Secret Key" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleAuth} className={THEME.btnPrimary + " w-full"}>
              {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
              {isRegistering ? 'CREATE MASTER ACCOUNT' : 'ENTER HUB'}
            </button>
            {statusMsg && <p className="text-[10px] text-amber-500 font-bold text-center uppercase tracking-tight">{statusMsg}</p>}
            <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-[10px] text-zinc-500 hover:text-emerald-500 uppercase font-black tracking-widest mt-2">
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) return <CreateQuest user={user} onCancel={() => setIsCreating(false)} onCreated={(g) => { setGame(g); setIsCreating(false); }} />;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap justify-between items-end border-b-4 border-zinc-800 pb-6 gap-4">
        <div>
          <h1 className={THEME.title}>MASTER HUB</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Authorized: {user.email}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsCreating(true)} className={THEME.btnSecondary}><Plus size={18} /> NEW QUEST</button>
          <button onClick={() => supabase.auth.signOut()} className="text-rose-500 font-bold text-xs uppercase hover:underline">Exit Hub</button>
        </div>
      </div>

      {!game ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className={THEME.label}>Your Quest History</h3>
            <button onClick={fetchMyGames} className="text-zinc-500 hover:text-emerald-500 transition-colors"><RefreshCw size={16} className={isLoadingGames ? 'animate-spin' : ''} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGames.length === 0 && !isLoadingGames && (
              <div className="col-span-full text-center py-20 border-4 border-dashed border-zinc-800">
                <p className="text-zinc-600 uppercase font-black italic">No Quests Found. Create your first one!</p>
              </div>
            )}
            {myGames.map(g => (
              <div key={g.id} className={THEME.panel + " hover:border-emerald-500 transition-colors cursor-pointer group"} onClick={() => setGame(g)}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-black uppercase italic group-hover:text-emerald-400">{g.title}</h4>
                  <span className={`text-[8px] font-black px-2 py-1 uppercase ${g.status === 'active' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    {g.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                   <span>CODE: {g.join_code}</span>
                   <span>{new Date(g.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={THEME.panel}>
              <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <button onClick={() => setGame(null)} className="text-zinc-500 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase"><ArrowRight size={12} className="rotate-180" /> Back</button>
                <div>
                  <h2 className="text-3xl font-black text-emerald-400 italic uppercase tracking-tighter">{game.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-zinc-500 font-mono text-xs">JOIN CODE: <span className="text-white bg-zinc-800 px-2 select-all font-bold">{game.join_code}</span></p>
                    <button 
                      onClick={() => setShowInvite(true)} 
                      className="text-emerald-500 hover:text-emerald-400 p-1 flex items-center gap-1 text-[10px] font-black uppercase"
                    >
                      <QrCode size={16} /> Invite
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {game.status === 'lobby' && (
                    <button 
                      onClick={async () => {
                        const { data } = await supabase.from('games').update({ status: 'active' }).eq('id', game.id).select().single();
                        if (data) setGame(data);
                      }} 
                      className={THEME.btnPrimary}
                    >START GAME</button>
                  )}
                  {game.status === 'active' && (
                    <button 
                      onClick={async () => {
                        const { data } = await supabase.from('games').update({ status: 'finished' }).eq('id', game.id).select().single();
                        if (data) setGame(data);
                      }} 
                      className="bg-rose-600 hover:bg-rose-500 text-white p-3 font-bold border-b-4 border-rose-900 active:translate-y-1 active:border-b-0 transition-all uppercase text-xs"
                    >END QUEST</button>
                  )}
                </div>
              </div>
              <h3 className={THEME.label}>World Progress Map</h3>
              <Rankboard players={players} maxLevels={riddleCount} />
            </div>
          </div>
          <div className={THEME.panel}>
            <h3 className={THEME.label}>Active Adventurers ({players.length})</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {players.length === 0 && <p className="text-zinc-700 italic text-center py-4">Waiting for heroes...</p>}
              {players.map(p => (
                <div key={p.id} className="p-3 bg-zinc-800 flex justify-between items-center border-l-4 border-emerald-500 hover:bg-zinc-700 transition-colors">
                  <span className="font-bold text-sm">{p.avatar} {p.nickname}</span>
                  <span className="text-[10px] text-zinc-500 font-black">LEVEL {p.current_level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className={THEME.panel + " max-w-sm w-full relative border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"}
            >
              <button 
                onClick={() => setShowInvite(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-black italic uppercase text-emerald-400">Invite Heroes</h3>
                
                {/* Fixed QR URL generation for local/preview consistency */}
                <div className="bg-white p-4 inline-block shadow-[8px_8px_0px_0px_#10b981] rounded-none">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/player?code=' + game?.join_code)}`}
                    alt="Join QR Code"
                    className="w-48 h-48"
                    onError={(e) => e.target.src = "https://placehold.co/200x200?text=QR+Error"}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className={THEME.label}>Join Code</label>
                  <div className="bg-zinc-800 border-2 border-zinc-700 p-3 font-mono font-black text-3xl tracking-[0.3em] text-emerald-400 select-all shadow-inner">
                    {game?.join_code}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Adventurers scan to join the quest</p>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
