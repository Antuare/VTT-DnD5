import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { initializePixiApp, destroyPixiApp } from '../canvas/engine';
import ChatPanel from '../components/ChatPanel';
import SidebarTools from '../components/SidebarTools';
import DiceOverlay from '../components/DiceOverlay';

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
    reactRootDiv.className = 'absolute inset-0 z-10 pointer-events-none';
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

    // Canal de Phoenix para sincronización
    let tableChannel: TableChannel | null = null;

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
          setDiceResult(`${payload.user}: ${payload.result}`);
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
      if (tableChannel && isConnected) {
        console.log('[ReactCanvasHook] Tirando dados:', diceExpression);
        tableChannel.push("roll_dice", { expression: diceExpression })
          .receive("error", (resp: any) => {
            console.error('[ReactCanvasHook] Error al tirar dados:', resp);
          });
      } else {
        console.warn('[ReactCanvasHook] No se puede tirar dados, canal no conectado');
      }
    };

    const sendChatMessage = (message: string) => {
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
        console.warn('[ReactCanvasHook] No se puede enviar mensaje, canal no conectado');
      }
    };

    // Renderizar componentes de React
    root.render(
      <div className="relative w-full h-full">
        {/* Sidebar de herramientas - pointer-events-auto para permitir clicks */}
        <div className="pointer-events-auto">
          <SidebarTools 
            selectedTool={selectedTool} 
            onToolChange={setSelectedTool}
            onRollDice={rollDice}
            isConnected={isConnected}
          />
        </div>

        {/* Panel de chat */}
        <div className="pointer-events-auto">
          <ChatPanel 
            messages={chatMessages} 
            onSendMessage={sendChatMessage}
            isConnected={isConnected}
          />
        </div>

        {/* Overlay de dados */}
        {diceResult && (
          <div className="pointer-events-none">
            <DiceOverlay result={diceResult} />
          </div>
        )}
        
        {/* Indicador de conexión */}
        {!isConnected && (
          <div className="absolute top-4 right-4 pointer-events-auto bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
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
