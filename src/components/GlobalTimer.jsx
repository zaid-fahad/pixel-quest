// --- 5. GLOBAL COUNTDOWN COMPONENT ---
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import formatTime from '.././lib/timerHelper';
import { THEME } from '.././constants/theme';

export default function GlobalTimer({ startedAt, durationSeconds, onExpire, isMaster }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const calculate = () => {
      const start = new Date(startedAt).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = durationSeconds - elapsed;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(remaining);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationSeconds]);

  return (
    <div className={`flex flex-col items-center justify-center p-4 border-4 border-slate-950 ${timeLeft < 30 ? 'border-rose-600 animate-pulse' : 'border-slate-900'} ${THEME.panel} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] flex items-center gap-2 mb-1">
        <Clock size={12} /> Time Remaining
      </span>
      <span className={`text-4xl font-mono font-black tracking-widest ${timeLeft < 300 ? 'text-rose-500' : 'text-white'}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}