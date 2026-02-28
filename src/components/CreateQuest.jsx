// --- 4. CREATE QUEST COMPONENT (src/components/CreateQuest.jsx) ---
import { THEME } from ".././constants/theme"
import supabase from '.././lib/supabase';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Timer } from 'lucide-react';

export default function CreateQuest({ user, onCancel, onCreated }) {
  const [title, setTitle] = useState('');
  const [durationMins, setDurationMins] = useState(10);
  const [riddles, setRiddles] = useState([{ question: '', hint: '', answer: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: g } = await supabase
      .from('games')
      .insert({ 
        title, 
        join_code: code, 
        admin_id: user.id, 
        status: 'lobby',
        duration_seconds: durationMins * 60 
      })
      .select()
      .single();

    if (g) {
      const riddlesWithId = riddles.map((r, i) => ({ ...r, game_id: g.id, order_index: i }));
      await supabase.from('riddles').insert(riddlesWithId);
      onCreated(g);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className={THEME.title}>FORGE QUEST</h2>
      <div className={THEME.panel}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={THEME.label}>Quest Title</label>
            <input className={THEME.input} placeholder="THE CRYSTAL CAVES" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={THEME.label}>Quest Timer (Minutes)</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                className={THEME.input} 
                min="1" 
                max="120" 
                value={durationMins} 
                onChange={e => setDurationMins(parseInt(e.target.value) || 1)} 
              />
              <Timer className="text-zinc-600" />
            </div>
          </div>
        </div>

        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-6 border-b border-zinc-800">
          {riddles.map((r, i) => (
            <div key={i} className="p-4 bg-zinc-800/50 border-l-4 border-emerald-500 space-y-3 mb-4">
              <div className="flex justify-between font-black text-xs text-emerald-500 uppercase">
                LEVEL {i+1} 
                <button onClick={() => setRiddles(riddles.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-rose-500 transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>
              <textarea className={THEME.input} placeholder="The Riddle..." value={r.question} onChange={e => { const n = [...riddles]; n[i].question = e.target.value; setRiddles(n); }} />
              <div className="grid grid-cols-2 gap-2">
                <input className={THEME.input} placeholder="Hint" value={r.hint} onChange={e => { const n = [...riddles]; n[i].hint = e.target.value; setRiddles(n); }} />
                <input className={THEME.input} placeholder="Answer" value={r.answer} onChange={e => { const n = [...riddles]; n[i].answer = e.target.value; setRiddles(n); }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-6">
          <button onClick={() => setRiddles([...riddles, {question:'', hint:'', answer:''}])} className={THEME.btnSecondary + " flex-1"}>+ ADD LEVEL</button>
          <button onClick={save} disabled={!title || riddles.some(r => !r.question || !r.answer) || isSaving} className={THEME.btnPrimary + " flex-1 disabled:opacity-50"}>
            {isSaving ? 'Forging...' : 'FINALIZE QUEST'}
          </button>
        </div>
      </div>
    </div>
  );
}