import React from 'react';

interface SidebarToolsProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  onRollDice: (dice: string) => void;
  isConnected?: boolean;
}

const SidebarTools: React.FC<SidebarToolsProps> = ({ 
  selectedTool, 
  onToolChange, 
  onRollDice,
  isConnected = true
}) => {
  // Efecto de sonido sintetizado básico para clicks e interacciones de la UI
  const playSound = (frequency = 1000, duration = 0.05) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext bloqueado por política del navegador
    }
  };

  const tools = [
    { id: 'select', name: 'Puntero', icon: 'fa-arrow-pointer' },
    { id: 'measure', name: 'Medir Distancia', icon: 'fa-ruler' },
    { id: 'draw', name: 'Dibujar', icon: 'fa-pencil' },
    { id: 'fog', name: 'Niebla de Guerra', icon: 'fa-eye-slash' },
  ];

  const dicePresets = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

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
          onClick={() => { playSound(600); onToolChange('select'); }}
          className={`w-8 h-8 flex items-center justify-center border transition-colors ${
            selectedTool === 'select'
              ? 'bg-vtt-active text-vtt-gold border-vtt-border hover:border-vtt-gold'
              : 'text-zinc-500 hover:text-zinc-200 border-transparent hover:border-vtt-border'
          }`}
          title="Puntero"
        >
          <i className="fa-solid fa-arrow-pointer"></i>
        </button>
        <button 
          onClick={() => { playSound(600); onToolChange('measure'); }}
          className={`w-8 h-8 flex items-center justify-center border transition-colors ${
            selectedTool === 'measure'
              ? 'bg-vtt-active text-vtt-gold border-vtt-border hover:border-vtt-gold'
              : 'text-zinc-500 hover:text-zinc-200 border-transparent hover:border-vtt-border'
          }`}
          title="Medir Distancia"
        >
          <i className="fa-solid fa-ruler"></i>
        </button>
        <button 
          onClick={() => { playSound(600); onToolChange('draw'); }}
          className={`w-8 h-8 flex items-center justify-center border transition-colors ${
            selectedTool === 'draw'
              ? 'bg-vtt-active text-vtt-gold border-vtt-border hover:border-vtt-gold'
              : 'text-zinc-500 hover:text-zinc-200 border-transparent hover:border-vtt-border'
          }`}
          title="Dibujar"
        >
          <i className="fa-solid fa-pencil"></i>
        </button>
        <button 
          onClick={() => { playSound(600); onToolChange('fog'); }}
          className={`w-8 h-8 flex items-center justify-center border transition-colors ${
            selectedTool === 'fog'
              ? 'bg-vtt-active text-vtt-gold border-vtt-border hover:border-vtt-gold'
              : 'text-zinc-500 hover:text-zinc-200 border-transparent hover:border-vtt-border'
          }`}
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
};

export default SidebarTools;
