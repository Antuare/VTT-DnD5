import React from 'react';

interface SidebarToolsProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  onRollDice: (expression: string) => void;
}

const SidebarTools: React.FC<SidebarToolsProps> = ({ 
  selectedTool, 
  onToolChange, 
  onRollDice 
}) => {
  const tools = [
    { id: 'select', name: 'Seleccionar', icon: '👆' },
    { id: 'move', name: 'Mover', icon: '✋' },
    { id: 'draw', name: 'Dibujar', icon: '✏️' },
    { id: 'measure', name: 'Medir', icon: '📏' },
  ];

  const dicePresets = [
    { label: 'D20', expression: '1d20' },
    { label: 'D12', expression: '1d12' },
    { label: 'D10', expression: '1d10' },
    { label: 'D8', expression: '1d8' },
    { label: 'D6', expression: '1d6' },
    { label: 'D4', expression: '1d4' },
  ];

  return (
    <div className="sidebar-tools absolute left-0 top-0 h-full w-16 flex flex-col items-center py-4 space-y-4">
      {/* Herramientas */}
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
              selectedTool === tool.id
                ? 'bg-accent-color text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={tool.name}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Separador */}
      <div className="w-10 h-px bg-gray-600"></div>

      {/* Dados rápidos */}
      <div className="space-y-2">
        {dicePresets.map((die) => (
          <button
            key={die.label}
            onClick={() => onRollDice(die.expression)}
            className="w-12 h-12 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center justify-center text-sm font-bold transition-all"
            title={`Tirar ${die.label}`}
          >
            {die.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SidebarTools;
