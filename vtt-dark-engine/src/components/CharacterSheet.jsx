import React from 'react';

const STATS = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

function CharacterSheet() {
  return (
    <div className="space-y-4">
      {/* Avatar y Datos Básicos */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 border border-vtt-border bg-vtt-surface flex items-center justify-center text-zinc-600 text-lg">
          <i className="fa-solid fa-user-shield"></i>
        </div>
        <div>
          <h2 className="font-epic text-xs tracking-wider text-vtt-gold uppercase">Personaje No Seleccionado</h2>
          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-tighter">Haz clic sobre un token para cargar ficha</p>
        </div>
      </div>

      {/* Bloque de Atributos Vacíos */}
      <div className="grid grid-cols-3 gap-1.5 font-mono">
        {STATS.map(stat => (
          <div key={stat} className="bg-vtt-black border border-vtt-border p-1.5 text-center">
            <span className="block text-[8px] text-zinc-500 uppercase">{stat}</span>
            <span className="text-[11px] font-bold text-zinc-400">--</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterSheet;
