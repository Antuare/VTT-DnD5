import React from 'react';

function TopBar({ isRightPanelOpen, onTogglePanel }) {
  const playSound = (frequency = 900) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // AudioContext bloqueado por política del navegador
    }
  };

  return (
    <div className="h-10 border-b border-vtt-border bg-vtt-panel flex items-center justify-between px-4 z-20">
      <div className="flex items-center space-x-2 font-mono">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        <span className="text-[10px] tracking-wider text-zinc-400 uppercase font-bold">MESA ACTUAL:</span>
        <span className="text-[10px] text-vtt-gold font-bold">CALABOZO DE LAS SOMBRAS</span>
      </div>
      
      {/* Marcador de iniciativa vacío / Minimalista */}
      <div className="flex items-center space-x-2 bg-vtt-black/60 px-3 py-1 border border-vtt-border">
        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Turno Activo:</span>
        <span className="font-mono text-zinc-400">Esperando Iniciativa...</span>
      </div>

      <button 
        onClick={() => { playSound(); onTogglePanel(); }} 
        className="text-zinc-500 hover:text-zinc-200 border border-transparent hover:border-vtt-border px-2 py-0.5 transition-colors"
        title="Alternar panel lateral"
      >
        <i className={`fa-solid ${isRightPanelOpen ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
      </button>
    </div>
  );
}

export default TopBar;
