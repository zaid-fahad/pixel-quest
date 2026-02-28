// --- 3. RANKBOARD COMPONENT (src/components/Rankboard.jsx) ---
import { motion } from 'framer-motion';
import supabase from '.././lib/supabase';
import { useState, useEffect } from 'react';
import CreateQuest from './CreateQuest';

export default function Rankboard({ players, maxLevels, compact }) {
  // Use the maxLevels passed from parent to ensure consistency
  const levels = Array.from({ length: maxLevels + 1 }, (_, i) => i);

  return (
    <div className="relative w-full overflow-hidden pt-12 pb-6">
      <div className="absolute left-0 right-0 h-2 bg-zinc-800 bottom-14 border-y border-zinc-700"></div>
      <div className="flex justify-between relative px-4">
        {levels.map(lv => (
          <div key={lv} className="flex-1 flex flex-col items-center relative min-w-[50px]">
            <div className="absolute h-full w-[1px] border-l border-dashed border-zinc-800 bottom-14"></div>
            <span className="mt-auto text-[8px] font-black text-zinc-600">{lv === maxLevels ? '🏁' : `L${lv}`}</span>
            <div className="absolute bottom-14 flex flex-col-reverse gap-1">
              {players.filter(p => parseInt(p.current_level) === lv).map(p => (
                <motion.div layout key={p.id} className="text-2xl animate-bounce">
                  {p.avatar}
                  {!compact && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] bg-black px-1 border border-zinc-800 whitespace-nowrap z-20">
                      {p.nickname}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}