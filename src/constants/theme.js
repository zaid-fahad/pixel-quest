// // --- 1. THEME CONSTANTS (src/constants/theme.js) ---
// export  const THEME = {
//   panel: "bg-zinc-900 border-4 border-zinc-700 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
//   btnPrimary: "bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter",
//   btnSecondary: "bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter",
//   input: "bg-zinc-800 border-2 border-zinc-600 p-3 text-white focus:border-emerald-500 outline-none w-full font-mono placeholder:text-zinc-600",
//   label: "block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2 font-black",
//   title: "text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 mb-2 uppercase tracking-tighter italic"
// };

// --- 1. THEME CONSTANTS (src/constants/theme.js) ---
export const THEME = {
  // Sleeker panel with a subtle indigo glow
  panel: "bg-[#0f172a]/90 border border-slate-800 p-8 rounded-xl backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] relative overflow-hidden",

  // Emerald Green for Primary Actions (Success/Run)
  btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-emerald-900/20 disabled:opacity-50",
  
  // Royal Purple for Secondary/Branding Actions
  btnSecondary: "bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-indigo-900/20",

  // Terminal-style input
  input: "bg-black/40 border border-zinc-700 p-4 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-full font-mono placeholder:text-zinc-700 transition-all",
  
  // Monospace labels
  label: "block text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3 font-mono font-bold",
  
  // IUBPC Gradient Title (Green to Purple)
  title: "text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-indigo-500 mb-2 uppercase tracking-tighter italic"
};