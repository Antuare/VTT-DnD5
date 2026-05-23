import React from 'react';

interface DiceOverlayProps {
  result: string;
}

const DiceOverlay: React.FC<DiceOverlayProps> = ({ result }) => {
  // Parsear el resultado para mostrar de forma atractiva (estilo minimalista VTT Dark Engine)
  const parseResult = (resultStr: string) => {
    try {
      // Formato simple: extraer el total si existe
      const match = resultStr.match(/(\d+)/);
      const total = match ? match[1] : '?';
      return {
        expression: resultStr,
        total: total
      };
    } catch (e) {
      return {
        expression: resultStr,
        total: '?'
      };
    }
  };

  const parsed = parseResult(result);

  return (
    <div className="dice-overlay fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-vtt-panel border-2 border-vtt-gold rounded-xl p-6 shadow-2xl transform animate-bounce-in hud-corner">
        <div className="text-center space-y-3">
          <div className="text-lg font-bold text-vtt-gold font-mono">
            {parsed.expression}
          </div>
          
          <div className="text-5xl font-black text-white font-epic">
            {parsed.total}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceOverlay;
