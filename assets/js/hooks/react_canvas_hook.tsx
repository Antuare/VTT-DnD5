import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { initializePixiApp, destroyPixiApp } from '../canvas/engine';
import ChatPanel from '../components/ChatPanel';
import SidebarTools from '../components/SidebarTools';
import DiceOverlay from '../components/DiceOverlay';
import CharacterSheet from '../components/CharacterSheet';

interface TokenData {
  id: string;
  name: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  image_url?: string;
  is_system?: boolean;
}

interface ChatMessage {
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

interface TableChannel {
  join(): { receive(status: string, callback: (payload: any) => void): void };
  on(event: string, callback: (payload: any) => void): void;
  push(event: string, payload: any): { receive(status: string, callback: () => void): void };
  leave(): void;
}

declare global {
  interface Window {
    liveSocket?: any;
  }
}

const ReactCanvasHook = {
  mounted() {
    const canvasContainer = document.getElementById('canvas-container') || this.el;
    
    // Obtener datos de la mesa desde atributos HTML
    const tableId = canvasContainer.getAttribute('data-table-id');
    const tableSlug = canvasContainer.getAttribute('data-table-slug') || 'main';
    
    console.log('[ReactCanvasHook] Montando para mesa:', { tableId, tableSlug });
    
    // Crear contenedor para React
    const reactRootDiv = document.createElement('div');
    reactRootDiv.id = 'react-root';
    reactRootDiv.className = 'absolute inset-0 z-10';
    canvasContainer.appendChild(reactRootDiv);

    // Inicializar PixiJS
    const pixiApp = initializePixiApp(canvasContainer);

    // Crear root de React
    const root: Root = createRoot(reactRootDiv);

    // Estado del componente
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [diceResult, setDiceResult] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<string>('select');
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
    const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState<boolean>(false);

    // Canal de Phoenix para sincronización
    let tableChannel: TableChannel | null = null;

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

    useEffect(() => {
      // Conectar al canal de la mesa usando el slug
      if (window.liveSocket && tableSlug) {
        console.log('[ReactCanvasHook] Conectando al canal table:' + tableSlug);
        
        tableChannel = window.liveSocket.channel(`table:${tableSlug}`, {});
        tableChannel.join()
          .receive("ok", (resp: any) => {
            console.log("[ReactCanvasHook] Unido al canal de la mesa exitosamente", resp);
            setIsConnected(true);
            
            // Cargar tokens existentes desde DB
            if (resp.tokens && Array.isArray(resp.tokens)) {
              console.log(`[ReactCanvasHook] Cargando ${resp.tokens.length} tokens`);
              setTokens(resp.tokens);
            }
            
            // Cargar mensajes de chat existentes desde DB
            if (resp.chat_messages && Array.isArray(resp.chat_messages)) {
              console.log(`[ReactCanvasHook] Cargando ${resp.chat_messages.length} mensajes de chat`);
              const formattedMessages = resp.chat_messages.map((msg: any) => ({
                id: msg.id,
                user: msg.user,
                message: msg.message,
                is_system: msg.is_system || false,
                timestamp: new Date(msg.inserted_at || msg.timestamp || Date.now())
              }));
              setChatMessages(formattedMessages);
            }
          })
          .receive("error", (resp: any) => {
            console.error("[ReactCanvasHook] Error al unir al canal", resp);
            setIsConnected(false);
          });

        // Escuchar actualizaciones de tokens (movimiento)
        tableChannel.on("token_moved", (payload: { token_id: string; x: number; y: number }) => {
          console.log('[ReactCanvasHook] Token movido:', payload);
          setTokens(prev => prev.map(t => 
            t.id === payload.token_id ? { ...t, x: payload.x, y: payload.y } : t
          ));
        });

        // Escuchar nuevos resultados de dados
        tableChannel.on("dice_rolled", (payload: { expression: string; result: string; user: string; timestamp: string }) => {
          console.log('[ReactCanvasHook] Dados tirados:', payload);
          
          // Parsear el resultado para obtener el valor numérico
          const rollMatch = payload.result.match(/\[(\d+)\]/);
          const rolledValue = rollMatch ? parseInt(rollMatch[1]) : Math.floor(Math.random() * 20) + 1;
          
          setDiceResult(`${payload.user}: ${payload.result}`);
          
          // Agregar al historial de chat
          setChatMessages(prev => [...prev, {
            id: `roll-${Date.now()}`,
            user: 'Sistema',
            message: `Tirada de ${payload.expression.toUpperCase()}`,
            is_system: true,
            timestamp: new Date(),
            type: 'roll',
            result: rolledValue,
            detail: `[${rolledValue}]`,
            content: `Tirada de ${payload.expression.toUpperCase()}`
          }]);
          
          setTimeout(() => setDiceResult(null), 4000);
        });

        // Escuchar nuevos mensajes de chat
        tableChannel.on("chat_message", (payload: { id: string; user: string; message: string; is_system: boolean; timestamp: string }) => {
          console.log('[ReactCanvasHook] Nuevo mensaje de chat:', payload);
          setChatMessages(prev => [...prev, {
            id: payload.id,
            user: payload.user,
            message: payload.message,
            is_system: payload.is_system || false,
            timestamp: new Date(payload.timestamp)
          }]);
        });
      } else {
        console.warn('[ReactCanvasHook] liveSocket no disponible o no hay slug');
      }

      return () => {
        console.log('[ReactCanvasHook] Limpiando canal');
        if (tableChannel) {
          tableChannel.leave();
        }
      };
    }, [tableSlug]);

    // Funciones para enviar eventos a Phoenix
    const moveToken = (tokenId: string, x: number, y: number) => {
      if (tableChannel && isConnected) {
        console.log('[ReactCanvasHook] Moviendo token:', { tokenId, x, y });
        tableChannel.push("move_token", { token_id: tokenId, x, y })
          .receive("ok", () => {
            // Actualizar localmente (optimistic update)
            setTokens(prev => prev.map(t => 
              t.id === tokenId ? { ...t, x, y } : t
            ));
          })
          .receive("error", (resp: any) => {
            console.error('[ReactCanvasHook] Error al mover token:', resp);
          });
      } else {
        console.warn('[ReactCanvasHook] No se puede mover token, canal no conectado');
      }
    };

    const rollDice = (diceExpression: string) => {
      playSound(150, 0.2); // Sonido sordo imitando dado
      
      if (tableChannel && isConnected) {
        console.log('[ReactCanvasHook] Tirando dados:', diceExpression);
        tableChannel.push("roll_dice", { expression: diceExpression })
          .receive("error", (resp: any) => {
            console.error('[ReactCanvasHook] Error al tirar dados:', resp);
          });
      } else {
        // Modo offline: simular tirada local
        const diceSize = parseInt(diceExpression.replace('d', ''));
        const rolledValue = Math.floor(Math.random() * diceSize) + 1;
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        setChatMessages(prev => [...prev, {
          id: `roll-${Date.now()}`,
          user: 'Sistema',
          message: `Tirada de ${diceExpression.toUpperCase()}`,
          is_system: true,
          timestamp: new Date(),
          type: 'roll',
          result: rolledValue,
          detail: `[${rolledValue}]`,
          content: `Tirada de ${diceExpression.toUpperCase()}`
        }]);
      }
    };

    const sendChatMessage = (message: string) => {
      playSound(800, 0.08);
      
      if (tableChannel && isConnected) {
        console.log('[ReactCanvasHook] Enviando mensaje de chat:', message);
        tableChannel.push("chat_message", { message })
          .receive("ok", () => {
            // El mensaje se agregará vía el evento chat_message
          })
          .receive("error", (resp: any) => {
            console.error('[ReactCanvasHook] Error al enviar mensaje:', resp);
          });
      } else {
        // Modo offline: agregar mensaje local
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        setChatMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          user: 'Jugador',
          message: message,
          is_system: false,
          timestamp: new Date()
        }]);
      }
    };

    const toggleRightPanel = () => {
      playSound(900);
      setIsRightPanelOpen(!isRightPanelOpen);
    };

    const toggleCharacterSheet = () => {
      playSound(1200);
      setIsCharacterSheetOpen(!isCharacterSheetOpen);
    };

    const handleRollFromSheet = (expression: string, modifier?: number) => {
      // Reutilizar la función rollDice existente
      rollDice(expression);
    };

    // Renderizar componentes de React con el layout VTT Dark Engine completo
    root.render(
      <div className="flex h-screen w-screen bg-vtt-black text-zinc-300 font-sans select-none overflow-hidden text-xs">
        
        {/* BARRA DE HERRAMIENTAS IZQUIERDA */}
        <div className="pointer-events-auto">
          <SidebarTools 
            selectedTool={selectedTool} 
            onToolChange={setSelectedTool}
            onRollDice={rollDice}
            isConnected={isConnected}
          />
        </div>

        {/* SECCIÓN CENTRAL: VISOR Y CONTROLES */}
        <div className="flex-grow flex flex-col h-full bg-[#070708] relative z-10 overflow-hidden">
          
          {/* CABECERA / PANEL DE INICIATIVA */}
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
              onClick={toggleRightPanel}
              className="text-zinc-500 hover:text-zinc-200 border border-transparent hover:border-vtt-border px-2 py-0.5 transition-colors"
              title="Alternar panel lateral"
            >
              <i className={`fa-solid ${isRightPanelOpen ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
            </button>
          </div>

          {/* CONTENEDOR PARA EL CANVAS (Aquí se monta PixiJS) */}
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
          <div className="h-12 border-t border-vtt-border bg-vtt-panel flex items-center px-4 justify-between z-20">
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase font-bold mr-1">Tirar:</span>
              {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].map(die => (
                <button 
                  key={die}
                  onClick={() => rollDice(die)}
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
        </div>

        {/* PANEL LATERAL DERECHO (HOJA DE PERSONAJE + CHAT) */}
        {isRightPanelOpen && (
          <div className="pointer-events-auto">
            <ChatPanel 
              messages={chatMessages} 
              onSendMessage={sendChatMessage}
              onRollDice={rollDice}
              isConnected={isConnected}
            />
          </div>
        )}

        {/* BOTÓN FLOTANTE PARA ABRIR HOJA DE PERSONAJE */}
        <button
          onClick={toggleCharacterSheet}
          className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-gradient-to-b from-[#120f0e] to-[#070606] border-2 border-amber-500/30 rounded-xl shadow-2xl flex items-center justify-center hover:border-amber-500/60 transition-all active:scale-95"
          title="Abrir Hoja de Personaje"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        </button>

        {/* HOJA DE PERSONAJE (MODAL FLOTANTE) */}
        {isCharacterSheetOpen && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black/80 backdrop-blur-sm" onClick={toggleCharacterSheet}>
            <div className="min-h-screen py-8 px-4" onClick={e => e.stopPropagation()}>
              <CharacterSheet onRollDice={handleRollFromSheet} />
            </div>
          </div>
        )}

        {/* Overlay de dados */}
        {diceResult && (
          <div className="pointer-events-none">
            <DiceOverlay result={diceResult} />
          </div>
        )}
        
        {/* Indicador de conexión */}
        {!isConnected && (
          <div className="absolute top-14 right-4 pointer-events-auto bg-vtt-danger text-white px-4 py-2 rounded-lg shadow-lg font-mono text-xs">
            🔴 Conectando...
          </div>
        )}
      </div>
    );

    // Guardar referencia para cleanup
    (this as any).pixiApp = pixiApp;
    (this as any).reactRoot = root;
    (this as any).cleanupFns = [];
  },

  updated() {
    // Actualizar si es necesario
    console.log('[ReactCanvasHook] Actualizado');
  },

  destroyed() {
    console.log('[ReactCanvasHook] Destruyendo');
    
    // Limpiar PixiJS
    if ((this as any).pixiApp) {
      destroyPixiApp((this as any).pixiApp);
    }

    // Limpiar React
    if ((this as any).reactRoot) {
      (this as any).reactRoot.unmount();
    }
  }
};

export default ReactCanvasHook;
