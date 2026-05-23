import React, { useState } from 'react';

function ChatPanel({ chatLogs, onSendMessage }) {
  const [inputValue, setInputValue] = useState('');

  const playSound = (frequency = 400) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    playSound(800, 0.08);
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleClear = () => {
    playSound();
    onSendMessage(null); // Signal to clear
  };

  return (
    <div className="flex-grow flex flex-col min-h-[40%] bg-vtt-black/40">
      {/* Encabezado de sección */}
      <div className="p-2 border-b border-vtt-border bg-vtt-panel flex items-center justify-between font-mono">
        <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Historial de Partida</span>
        <button 
          onClick={handleClear}
          className="text-[9px] text-zinc-600 hover:text-vtt-danger transition-colors uppercase font-bold"
        >
          Limpiar
        </button>
      </div>

      {/* Area de Scroll de logs */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2 flex flex-col">
        {chatLogs.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-center p-4">
            <p className="font-mono text-[9px] text-zinc-600 uppercase">El registro de tiradas y chat está vacío.</p>
          </div>
        ) : (
          chatLogs.map(log => (
            <div key={log.id} className="border-l-2 border-vtt-border pl-2 py-0.5">
              <div className="flex justify-between items-baseline text-[10px] font-mono">
                <span className="font-bold text-vtt-gold">{log.user}</span>
                <span className="text-[8px] text-zinc-600">{log.time}</span>
              </div>
              
              {log.type === 'message' ? (
                <p className="text-zinc-400 text-[11px] leading-snug mt-0.5">{log.content}</p>
              ) : (
                <div className="mt-1 flex items-center justify-between bg-vtt-surface/50 border border-vtt-border p-1.5 font-mono">
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase">{log.content}</span>
                    <span className="text-[9px] text-zinc-500">{log.detail}</span>
                  </div>
                  <div className="w-8 h-8 bg-vtt-surface border border-vtt-border flex items-center justify-center font-bold text-vtt-gold text-[13px] hud-corner">
                    {log.result}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulario de Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-vtt-border bg-vtt-panel flex items-center space-x-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe un mensaje o /roll..." 
          className="flex-grow bg-vtt-black border border-vtt-border px-3 py-1.5 text-[11px] font-mono text-zinc-200 focus:outline-none focus:border-vtt-gold transition-colors"
        />
        <button 
          type="submit"
          className="px-3 py-1.5 bg-vtt-surface border border-vtt-border hover:border-vtt-gold text-vtt-gold font-mono font-bold transition-all uppercase"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
