import React from 'react';

interface Message {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage }) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="chat-panel absolute bottom-4 left-4 w-80 h-96 flex flex-col">
      <div className="p-3 border-b border-gray-700 font-bold text-lg">
        Chat de Mesa
      </div>
      
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No hay mensajes aún</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-gray-800 rounded p-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-accent-color text-sm">
                  {msg.user}
                </span>
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-200">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-color"
          />
          <button
            type="submit"
            className="btn-solid text-sm px-4 py-2"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
