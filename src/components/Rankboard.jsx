// --- 3. RANKBOARD COMPONENT (src/components/Rankboard.jsx) ---
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Lightbulb, ChevronRight, Crown } from 'lucide-react';
import formatTime from '.././lib/timerHelper';
import { useMemo } from 'react';
import { THEME } from '.././constants/theme';

export default function RankingTable({ players, maxLevels, gameStartedAt, gameDuration, compact }) {
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // Sort by Level Descending
      if (b.current_level !== a.current_level) {
        return b.current_level - a.current_level;
      }
      // If levels tie, sort by time taken (finished_at or last_updated) Ascending
      const timeA = a.finished_at ? new Date(a.finished_at).getTime() : new Date(a.last_updated).getTime();
      const timeB = b.finished_at ? new Date(b.finished_at).getTime() : new Date(b.last_updated).getTime();
      return timeA - timeB;
    });
  }, [players]);

  return (
    <div className={`w-full sm:overflow-hidden overflow-x-scroll scroll-smooth  ${THEME.panel} ${compact ? 'max-h-[300px] overflow-y-auto' : ''}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900 border-b-4 border-slate-800">
            <th className="p-4 text-[10px] font-black uppercase text-slate-500">Rank</th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-500">Adventurer</th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-500">Level</th>
            <th className="p-4 text-[10px] font-black uppercase text-slate-500 text-right">Time Taken</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-zinc-800">
          {sortedPlayers.map((p, idx) => {
            const timeDiff = p.finished_at 
              ? (new Date(p.finished_at).getTime() - new Date(gameStartedAt).getTime()) / 1000
              : (new Date(p.last_updated).getTime() - new Date(gameStartedAt).getTime()) / 1000;
            
            return (
              <motion.tr 
                layout
                key={p.id} 
                className={`${idx === 0 ? 'bg-emerald-500/10' : ''} transition-colors`}
              >
                <td className="p-4 font-mono font-black italic text-xl">
                  {idx === 0 ? <Crown className="text-amber-400" size={24} /> : `#${idx + 1}`}
                </td>
                <td className="p-4 flex items-center gap-3">
                  <span className="text-3xl">{p.avatar}</span>
                  <span className="font-bold uppercase tracking-tighter">{p.nickname}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 font-black text-xs border ${p.current_level >= maxLevels && maxLevels > 0 ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {p.current_level} / {maxLevels}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-zinc-400">
                  {p.current_level > 0 && gameStartedAt ? formatTime(Math.max(0, Math.floor(timeDiff))) : '--:--'}
                </td>
              </motion.tr>
            );
          })}
          {sortedPlayers.length === 0 && (
            <tr>
              <td colSpan="4" className="p-12 text-center text-zinc-700 italic uppercase font-bold tracking-widest">
                No Heroes in the Dungeon Yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}