import React from 'react';

const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

function DiceBar({ onRoll }) {
  const playSound = (frequency = 600) => {
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
    <div className="h-12 border-t border-vtt-border bg-vtt-panel flex items-center px-4 justify-between z-20">
      <div className="flex items-center space-x-2">
        <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase font-bold mr-1">Tirar:</span>
        {DICE_TYPES.map(die => (
          <button 
            key={die}
            onClick={() => { playSound(); onRoll(die); }}
            className="w-8 h-7 bg-vtt-black hover:bg-vtt-surface border border-vtt-border hover:border-vtt-gold text-vtt-gold text-[10px] font-mono font-bold transition-all active:scale-95 flex items-center justify-center uppercase"
          >
            {die}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-1">
        <span className="text-[9px] font-mono text-zinc-600 uppercase">Acento de interfaz</span>
        <div className="w-1.5 h-1.5 bg-vtt-gold"></div>
      </div>
    </div>
  );
}

export default DiceBar;
