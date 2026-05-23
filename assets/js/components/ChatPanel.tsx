import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  user: string;
  message: string;
  is_system: boolean;
  timestamp: string | Date;
  type?: 'message' | 'roll';
  result?: number;
  detail?: string;
  content?: string;
}

interface CharacterStats {
  FUE: number | null;
  DES: number | null;
  CON: number | null;
  INT: number | null;
  SAB: number | null;
  CAR: number | null;
}

interface BackgroundData {
  name: string;
  skills: string[];
  languages: string[];
  equipment: string[];
  feature: string;
  description: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onRollDice: (dice: string) => void;
  isConnected?: boolean;
  characterName?: string;
  characterStats?: CharacterStats;
}

type ActiveTab = 'sheet' | 'spells' | 'combat';

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  onRollDice,
  isConnected = true,
  characterName,
  characterStats
}) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('sheet');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Efecto de sonido sintetizado básico para clicks e interacciones de la UI
  const playSound = (frequency = 1000, duration = 0.05) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && isConnected) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTimestamp = (timestamp: string | Date): string => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    playSound(1000);
    setActiveTab(tab);
  };

  const stats = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const;

  return (
    <div className="w-80 h-full bg-vtt-panel border-l border-vtt-border flex flex-col z-20 transition-all duration-200">
      
      {/* PESTAÑAS DE HOJA DE PJ */}
      <div className="grid grid-cols-3 border-b border-vtt-border text-center font-mono">
        <button 
          onClick={() => handleTabChange('sheet')}
          className={`py-2.5 text-[10px] uppercase font-bold border-b-2 transition-all ${
            activeTab === 'sheet' 
              ? 'text-vtt-gold border-vtt-gold bg-vtt-black/40' 
              : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Ficha
        </button>
        <button 
          onClick={() => handleTabChange('spells')}
          className={`py-2.5 text-[10px] uppercase font-bold border-b-2 transition-all ${
            activeTab === 'spells' 
              ? 'text-vtt-gold border-vtt-gold bg-vtt-black/40' 
              : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Poderes
        </button>
        <button 
          onClick={() => handleTabChange('combat')}
          className={`py-2.5 text-[10px] uppercase font-bold border-b-2 transition-all ${
            activeTab === 'combat' 
              ? 'text-vtt-gold border-vtt-gold bg-vtt-black/40' 
              : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          Combate
        </button>
      </div>

      {/* CONTENIDOS DINÁMICOS DE LA FICHA */}
      <div className="p-4 border-b border-vtt-border bg-vtt-black/30 flex-grow max-h-[45%] overflow-y-auto">
        
        {activeTab === 'sheet' && (
          <div className="space-y-4">
            {/* Avatar y Datos Básicos */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 border border-vtt-border bg-vtt-surface flex items-center justify-center text-zinc-600 text-lg">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <div>
                <h2 className="font-epic text-xs tracking-wider text-vtt-gold uppercase">
                  {characterName || 'Personaje No Seleccionado'}
                </h2>
                {!characterName && (
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-tighter">
                    Haz clic sobre un token para cargar ficha
                  </p>
                )}
              </div>
            </div>

            {/* Bloque de Atributos */}
            <div className="grid grid-cols-3 gap-1.5 font-mono">
              {stats.map(stat => (
                <div key={stat} className="bg-vtt-black border border-vtt-border p-1.5 text-center">
                  <span className="block text-[8px] text-zinc-500 uppercase">{stat}</span>
                  <span className="text-[11px] font-bold text-zinc-400">
                    {characterStats?.[stat] ?? '--'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spells' && (
          <div className="text-center py-8 font-mono text-[10px] text-zinc-600 uppercase">
            <i className="fa-solid fa-wand-sparkles text-xl mb-2 text-zinc-700 block"></i>
            Sin hechizos cargados
          </div>
        )}

        {activeTab === 'combat' && (
          <div className="space-y-3 font-mono">
            {/* Valores Rápidos */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-vtt-black border border-vtt-border p-2">
                <span className="block text-[8px] text-zinc-500 uppercase">CA Máxima</span>
                <span className="text-sm font-bold text-zinc-400">--</span>
              </div>
              <div className="bg-vtt-black border border-vtt-border p-2">
                <span className="block text-[8px] text-zinc-500 uppercase">Iniciativa</span>
                <span className="text-sm font-bold text-zinc-400">--</span>
              </div>
            </div>

            {/* Acciones de ataque vacías */}
            <div className="border border-dashed border-vtt-border p-3 text-center text-zinc-600 text-[10px] uppercase">
              No hay armas preparadas
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL DE CHAT / DADOS */}
      <div className="flex-grow flex flex-col min-h-[40%] bg-vtt-black/40">
        {/* Encabezado de sección */}
        <div className="p-2 border-b border-vtt-border bg-vtt-panel flex items-center justify-between font-mono">
          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Historial de Partida</span>
          <button 
            onClick={() => { playSound(400); }} 
            className="text-[9px] text-zinc-600 hover:text-vtt-danger transition-colors uppercase font-bold"
          >
            Limpiar
          </button>
        </div>

        {/* Area de Scroll de logs */}
        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-3 space-y-2 flex flex-col"
        >
          {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-center p-4">
              <p className="font-mono text-[9px] text-zinc-600 uppercase">
                El registro de tiradas y chat está vacío.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="border-l-2 border-vtt-border pl-2 py-0.5">
                <div className="flex justify-between items-baseline text-[10px] font-mono">
                  <span className="font-bold text-vtt-gold">{msg.user}</span>
                  <span className="text-[8px] text-zinc-600">{formatTimestamp(msg.timestamp)}</span>
                </div>
                
                {msg.type === 'roll' || msg.result !== undefined ? (
                  <div className="mt-1 flex items-center justify-between bg-vtt-surface/50 border border-vtt-border p-1.5 font-mono">
                    <div>
                      <span className="block text-[8px] text-zinc-500 uppercase">
                        {msg.content || msg.message}
                      </span>
                      <span className="text-[9px] text-zinc-500">{msg.detail}</span>
                    </div>
                    <div className="w-8 h-8 bg-vtt-surface border border-vtt-border flex items-center justify-center font-bold text-vtt-gold text-[13px] hud-corner">
                      {msg.result}
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400 text-[11px] leading-snug mt-0.5">{msg.message}</p>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de Input */}
        <form onSubmit={handleSubmit} className="p-2 border-t border-vtt-border bg-vtt-panel flex items-center space-x-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isConnected ? "Escribe un mensaje o /roll..." : "Desconectado..."}
            disabled={!isConnected}
            className="flex-grow bg-vtt-black border border-vtt-border px-3 py-1.5 text-[11px] font-mono text-zinc-200 focus:outline-none focus:border-vtt-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button 
            type="submit"
            disabled={!isConnected || !inputValue.trim()}
            className="px-3 py-1.5 bg-vtt-surface border border-vtt-border hover:border-vtt-gold text-vtt-gold font-mono font-bold transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChatPanel;
