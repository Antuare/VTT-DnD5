import React from 'react';

function Toolbar() {
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
    <div className="w-12 h-full bg-vtt-panel border-r border-vtt-border flex flex-col items-center py-3 justify-between z-20">
      {/* Logo o Icono de Cabecera */}
      <div 
        className="w-8 h-8 flex items-center justify-center border border-vtt-border bg-vtt-surface text-vtt-gold cursor-pointer hover:border-vtt-gold transition-colors" 
        title="VTT Core"
      >
        <i className="fa-solid fa-dice-d20 text-base"></i>
      </div>

      {/* Herramientas de Control */}
      <div className="flex flex-col space-y-2">
        <button 
          onClick={() => playSound(600)} 
          className="w-8 h-8 flex items-center justify-center bg-vtt-active text-vtt-gold border border-vtt-border hover:border-vtt-gold transition-colors" 
          title="Puntero"
        >
          <i className="fa-solid fa-arrow-pointer"></i>
        </button>
        <button 
          onClick={() => playSound(600)} 
          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-200 border border-transparent hover:border-vtt-border transition-colors" 
          title="Medir Distancia"
        >
          <i className="fa-solid fa-ruler"></i>
        </button>
        <button 
          onClick={() => playSound(600)} 
          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-200 border border-transparent hover:border-vtt-border transition-colors" 
          title="Dibujar"
        >
          <i className="fa-solid fa-pencil"></i>
        </button>
        <button 
          onClick={() => playSound(600)} 
          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-200 border border-transparent hover:border-vtt-border transition-colors" 
          title="Niebla de Guerra"
        >
          <i className="fa-solid fa-eye-slash"></i>
        </button>
      </div>

      {/* Configuración */}
      <button 
        onClick={() => playSound(500)} 
        className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-vtt-border border border-transparent transition-colors" 
        title="Ajustes"
      >
        <i className="fa-solid fa-sliders"></i>
      </button>
    </div>
  );
}

export default Toolbar;
