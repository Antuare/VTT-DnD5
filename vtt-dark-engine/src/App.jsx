import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import TopBar from './components/TopBar';
import DiceBar from './components/DiceBar';
import CharacterSheet from './components/CharacterSheet';
import SpellsTab from './components/SpellsTab';
import CombatTab from './components/CombatTab';
import ChatPanel from './components/ChatPanel';

function App() {
  // Pestaña activa del panel derecho
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet', 'spells', 'combat'
  // Lista para simular el registro de chat o tiradas
  const [chatLogs, setChatLogs] = useState([]);
  // Estado para el panel colapsable
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Simular un envío de texto al chat (conectará con tu Phoenix Channel)
  const handleSendMessage = (content) => {
    if (content === null) {
      // Signal to clear logs
      setChatLogs([]);
      return;
    }

    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    setChatLogs(prev => [...prev, {
      id: Date.now(),
      type: 'message',
      user: 'Jugador',
      content: content,
      time: timestamp
    }]);
  };

  // Simular una tirada rápida
  const rollDice = (dice) => {
    const rolledValue = Math.floor(Math.random() * parseInt(dice.replace('d', ''))) + 1;
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    setChatLogs(prev => [...prev, {
      id: Date.now(),
      type: 'roll',
      user: 'Sistema',
      content: `Tirada de ${dice.toUpperCase()}`,
      result: rolledValue,
      detail: `[${rolledValue}]`,
      time: timestamp
    }]);
  };

  return (
    <div className="flex h-screen w-screen bg-vtt-black text-zinc-300 font-sans select-none overflow-hidden text-xs">
      
      {/* BARRA DE HERRAMIENTAS IZQUIERDA */}
      <Toolbar />

      {/* SECCIÓN CENTRAL: VISOR Y CONTROLES */}
      <div className="flex-grow flex flex-col h-full bg-[#070708] relative z-10 overflow-hidden">
        
        {/* CABECERA / PANEL DE INICIATIVA */}
        <TopBar 
          isRightPanelOpen={isRightPanelOpen} 
          onTogglePanel={() => setIsRightPanelOpen(!isRightPanelOpen)} 
        />

        {/* CONTENEDOR VACÍO PARA EL CANVAS (Aquí se monta PixiJS) */}
        <div className="flex-grow relative w-full h-full flex items-center justify-center">
          {/* Rejilla de fondo estética simulada solo para renderizado visual */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>

          <div className="text-center z-10 border border-vtt-border bg-vtt-panel p-6 max-w-sm w-full font-mono hud-corner">
            <i className="fa-solid fa-shapes text-3xl text-vtt-gold mb-3 block animate-pulse"></i>
            <h3 className="font-epic text-xs text-zinc-200 tracking-widest uppercase mb-1">Visor de PixiJS</h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
              Este contenedor recibirá el canvas dinámico renderizado por tu script de TypeScript.
            </p>
          </div>
        </div>

        {/* ACCESO RÁPIDO DE DADOS (HOTBAR INFERIOR) */}
        <DiceBar onRoll={rollDice} />
      </div>

      {/* PANEL LATERAL DERECHO (HOJA DE PERSONAJE + CHAT) */}
      {isRightPanelOpen && (
        <div className="w-80 h-full bg-vtt-panel border-l border-vtt-border flex flex-col z-20 transition-all duration-200">
          
          {/* PESTAÑAS DE HOJA DE PJ */}
          <div className="grid grid-cols-3 border-b border-vtt-border text-center font-mono">
            <button 
              onClick={() => setActiveTab('sheet')}
              className={`py-2.5 text-[10px] uppercase font-bold border-b-2 transition-all ${
                activeTab === 'sheet' 
                ? 'text-vtt-gold border-vtt-gold bg-vtt-black/40' 
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              Ficha
            </button>
            <button 
              onClick={() => setActiveTab('spells')}
              className={`py-2.5 text-[10px] uppercase font-bold border-b-2 transition-all ${
                activeTab === 'spells' 
                ? 'text-vtt-gold border-vtt-gold bg-vtt-black/40' 
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              Poderes
            </button>
            <button 
              onClick={() => setActiveTab('combat')}
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
            
            {activeTab === 'sheet' && <CharacterSheet />}
            {activeTab === 'spells' && <SpellsTab />}
            {activeTab === 'combat' && <CombatTab />}
          </div>

          {/* HISTORIAL DE CHAT / DADOS */}
          <ChatPanel chatLogs={chatLogs} onSendMessage={handleSendMessage} />

        </div>
      )}

    </div>
  );
}

export default App;
