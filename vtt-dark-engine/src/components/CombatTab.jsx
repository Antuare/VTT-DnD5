import React from 'react';

function CombatTab() {
  return (
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
  );
}

export default CombatTab;
