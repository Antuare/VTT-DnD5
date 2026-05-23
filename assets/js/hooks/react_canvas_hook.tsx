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
  texture?: string;
}

interface TableChannel {
  join(): { receive(status: string, callback: (payload: any) => void): void };
  on(event: string, callback: (payload: any) => void): void;
  push(event: string, payload: any): { receive(status: string, callback: () => void): void };
}

declare global {
  interface Window {
    liveSocket?: any;
  }
}

const ReactCanvasHook = {
  mounted() {
    const containerId = this.el.id || 'react-canvas-container';
    const canvasContainer = document.getElementById('canvas-container') || this.el;
    
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
    const [chatMessages, setChatMessages] = useState<Array<{ id: string; user: string; message: string; timestamp: Date }>>([]);
    const [diceResult, setDiceResult] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<string>('select');

    // Canal de Phoenix para sincronización
    let tableChannel: TableChannel | null = null;

    useEffect(() => {
      // Conectar al canal de la mesa
      if (window.liveSocket) {
        tableChannel = window.liveSocket.channel("table:main", {});
        tableChannel.join()
          .receive("ok", (resp: any) => {
            console.log("Unido al canal de la mesa", resp);
            // Cargar tokens existentes
            if (resp.tokens) {
              setTokens(resp.tokens);
            }
          })
          .receive("error", (resp: any) => {
            console.error("Error al unir al canal", resp);
          });

        // Escuchar actualizaciones de tokens
        tableChannel.on("token_moved", (payload: { token_id: string; x: number; y: number }) => {
          setTokens(prev => prev.map(t => 
            t.id === payload.token_id ? { ...t, x: payload.x, y: payload.y } : t
          ));
        });

        // Escuchar nuevos dados
        tableChannel.on("dice_rolled", (payload: { result: string }) => {
          setDiceResult(payload.result);
          setTimeout(() => setDiceResult(null), 3000);
        });
      }

      return () => {
        if (tableChannel) {
          tableChannel.leave();
        }
      };
    }, []);

    // Funciones para enviar eventos a Phoenix
    const moveToken = (tokenId: string, x: number, y: number) => {
      if (tableChannel) {
        tableChannel.push("move_token", { token_id: tokenId, x, y })
          .receive("ok", () => {
            // Actualizar localmente
            setTokens(prev => prev.map(t => 
              t.id === tokenId ? { ...t, x, y } : t
            ));
          });
      }
    };

    const rollDice = (diceExpression: string) => {
      if (tableChannel) {
        tableChannel.push("roll_dice", { expression: diceExpression });
      }
    };

    const sendChatMessage = (message: string) => {
      if (tableChannel) {
        tableChannel.push("chat_message", { message });
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
          />
        </div>

        {/* Panel de chat */}
        <div className="pointer-events-auto">
          <ChatPanel 
            messages={chatMessages} 
            onSendMessage={sendChatMessage}
          />
        </div>

        {/* Overlay de dados */}
        {diceResult && (
          <div className="pointer-events-none">
            <DiceOverlay result={diceResult} />
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
  },

  destroyed() {
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
