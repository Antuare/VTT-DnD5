import React from 'react';
import { DiceRoll } from 'rpg-dice-roller';

interface DiceOverlayProps {
  result: string;
}

const DiceOverlay: React.FC<DiceOverlayProps> = ({ result }) => {
  // Parsear el resultado para mostrar de forma atractiva
  const parseResult = (resultStr: string) => {
    try {
      const roll = new DiceRoll(resultStr);
      return {
        expression: roll.expression,
        total: roll.total,
        rolls: roll.rolls
      };
    } catch (e) {
      return {
        expression: resultStr,
        total: '?',
        rolls: []
      };
    }
  };

  const parsed = parseResult(result);

  return (
    <div className="dice-overlay fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-accent-color rounded-xl p-8 shadow-2xl transform animate-bounce-in">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-accent-color">
            {parsed.expression}
          </div>
          
          <div className="text-6xl font-black text-white">
            {parsed.total}
          </div>

          {parsed.rolls && parsed.rolls.length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {parsed.rolls.map((roll: any, idx: number) => (
                <div
                  key={idx}
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-lg font-bold"
                >
                  {roll.value || roll}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceOverlay;
