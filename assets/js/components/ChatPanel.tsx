import React, { useEffect, useRef } from 'react';

interface Message {
  id: string;
  user: string;
  message: string;
  is_system: boolean;
  timestamp: string | Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isConnected?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isConnected = true }) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="chat-panel absolute bottom-4 left-4 w-80 h-96 flex flex-col bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
      <div className="p-3 border-b border-gray-700 font-bold text-lg flex justify-between items-center">
        <span className="text-white">💬 Chat de Mesa</span>
        {!isConnected && (
          <span className="text-xs text-red-400">⚠️ Desconectado</span>
        )}
      </div>
      
      {/* Área de mensajes */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center mt-8">
            No hay mensajes aún.<br/>¡Sé el primero en saludar!
          </p>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`rounded p-2 ${
                msg.is_system 
                  ? 'bg-blue-900/50 border border-blue-700' 
                  : 'bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className={`font-semibold text-sm ${
                  msg.is_system ? 'text-blue-400' : 'text-accent-color'
                }`}>
                  {msg.is_system ? '🎲 Sistema' : msg.user}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-200 break-words">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isConnected ? "Escribe un mensaje..." : "Desconectado..."}
            disabled={!isConnected}
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-color disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputValue.trim()}
            className="btn-solid text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
