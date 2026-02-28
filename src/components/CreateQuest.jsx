// --- 4. CREATE QUEST COMPONENT (src/components/CreateQuest.jsx) ---
import { THEME } from ".././constants/theme"
import supabase from '.././lib/supabase';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';


export default function CreateQuest({ user, onCancel, onCreated }) {
  const [title, setTitle] = useState('');
  const [riddles, setRiddles] = useState([{ question: '', hint: '', answer: '' }]);

  const save = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: g } = await supabase
      .from('games')
      .insert({ title, join_code: code, admin_id: user.id })
      .select()
      .single();

    const riddlesWithId = riddles.map((r, i) => ({ ...r, game_id: g.id, order_index: i }));
    await supabase.from('riddles').insert(riddlesWithId);
    onCreated(g);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className={THEME.title}>Quest Forger</h2>
      <div className={THEME.panel}>
        <input className={THEME.input + " mb-6"} placeholder="Quest Title" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-6 border-b border-zinc-800">
          {riddles.map((r, i) => (
            <div key={i} className="p-4 bg-zinc-800/50 border-l-4 border-emerald-500 space-y-3 mb-4">
              <div className="flex justify-between font-black text-xs text-emerald-500 uppercase tracking-widest">
                LEVEL {i+1} 
                <button onClick={() => setRiddles(riddles.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-rose-500 transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>
              <textarea 
                className={THEME.input} 
                placeholder="The Riddle..." 
                value={r.question} 
                onChange={e => { const n = [...riddles]; n[i].question = e.target.value; setRiddles(n); }} 
              />
              <div className="grid grid-cols-2 gap-2">
                <input className={THEME.input} placeholder="Hint (Optional)" value={r.hint} onChange={e => { const n = [...riddles]; n[i].hint = e.target.value; setRiddles(n); }} />
                <input className={THEME.input} placeholder="Answer" value={r.answer} onChange={e => { const n = [...riddles]; n[i].answer = e.target.value; setRiddles(n); }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={() => setRiddles([...riddles, {question:'', hint:'', answer:''}])} className={THEME.btnSecondary + " flex-1"}>+ ADD LEVEL</button>
          <button onClick={save} disabled={!title || riddles.some(r => !r.question || !r.answer)} className={THEME.btnPrimary + " flex-1 disabled:opacity-50"}>FINALIZE QUEST</button>
          <button onClick={onCancel} className="text-zinc-500 hover:text-white uppercase font-black text-xs px-4">Cancel</button>
        </div>
      </div>
    </div>
  );
}