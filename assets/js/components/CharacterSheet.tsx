import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, Heart, Dice5, Search, Plus, Trash2, Flame, Backpack, 
  Scroll, Sparkles, ChevronDown, CheckCircle2, Circle, BookOpen, Star
} from 'lucide-react';

type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

const RACES: Record<string, { bonus: string; subs: string[] }> = {
  "Humano": { bonus: "+1 a Todo", subs: ["Estándar", "Variante"] },
  "Elfo": { bonus: "+2 DEX", subs: ["Alto Elfo", "Elfo de los Bosques", "Drow"] },
  "Enano": { bonus: "+2 CON", subs: ["Colinas", "Montañas", "Duergar"] },
  "Mediano": { bonus: "+2 DEX", subs: ["Piesligeros", "Fornido"] },
  "Dracónido": { bonus: "+2 FUE, +1 CAR", subs: ["Cromático", "Metálico"] },
  "Gnomo": { bonus: "+2 INT", subs: ["Bosques", "Rocas"] },
  "Medioelfo": { bonus: "+2 CAR, +1 a dos", subs: ["Estandar"] },
  "Semiorco": { bonus: "+2 FUE, +1 CON", subs: ["Semiorco"] },
  "Tiflin": { bonus: "+2 CAR, +1 INT", subs: ["Infernal", "Abisal"] }
};

const CLASSES: Record<string, { hd: string; pri: string; subLvl: number; subs: string[] }> = {
  "Guerrero": { hd: "1d10", pri: "FUE/DES", subLvl: 3, subs: ["Campeón", "Maestro de Batalla", "Caballero Éldrico"] },
  "Mago": { hd: "1d6", pri: "INT", subLvl: 2, subs: ["Evocación", "Abjuración", "Necromancia"] },
  "Clérigo": { hd: "1d8", pri: "SAB", subLvl: 1, subs: ["Vida", "Tempestad", "Guerra"] },
  "Pícaro": { hd: "1d8", pri: "DES", subLvl: 3, subs: ["Asesino", "Bribón", "Embaucador Arcano"] },
  "Bárbaro": { hd: "1d12", pri: "FUE", subLvl: 3, subs: ["Totémico", "Frenesí", "Zealot"] },
  "Bardo": { hd: "1d8", pri: "CAR", subLvl: 3, subs: ["Saber", "Valor", "Espadas"] },
  "Druida": { hd: "1d8", pri: "SAB", subLvl: 2, subs: ["Luna", "Tierra", "Esporas"] },
  "Monje": { hd: "1d8", pri: "DES/SAB", subLvl: 3, subs: ["Mano Abierta", "Sombras", "Elementos"] },
  "Paladín": { hd: "1d10", pri: "FUE/CAR", subLvl: 3, subs: ["Devoción", "Venganza", "Conquista"] },
  "Explorador": { hd: "1d10", pri: "DES/SAB", subLvl: 3, subs: ["Cazador", "Bestias", "Acechador"] },
  "Hechicero": { hd: "1d6", pri: "CAR", subLvl: 1, subs: ["Línea Dracónica", "Magia Salvaje", "Tormenta"] },
  "Brujo": { hd: "1d8", pri: "CAR", subLvl: 1, subs: ["Archihada", "El Celestial", "El Filo"] }
};

const SKILLS: { name: string; ability: Ability }[] = [
  { name: 'Acrobacias', ability: 'DEX' }, { name: 'Atletismo', ability: 'STR' },
  { name: 'Arcano', ability: 'INT' }, { name: 'Engaño', ability: 'CHA' },
  { name: 'Historia', ability: 'INT' }, { name: 'Perspicacia', ability: 'WIS' },
  { name: 'Intimidación', ability: 'CHA' }, { name: 'Investigación', ability: 'INT' },
  { name: 'Medicina', ability: 'WIS' }, { name: 'Naturaleza', ability: 'INT' },
  { name: 'Percepción', ability: 'WIS' }, { name: 'Interpretación', ability: 'CHA' },
  { name: 'Persuasión', ability: 'CHA' }, { name: 'Religión', ability: 'INT' },
  { name: 'Juego de Manos', ability: 'DEX' }, { name: 'Sigilo', ability: 'DEX' },
  { name: 'Supervivencia', ability: 'WIS' }
];

const ABILITIES: Record<Ability, { label: string }> = {
  STR: { label: 'Fuerza' }, DEX: { label: 'Destreza' }, CON: { label: 'Constitución' },
  INT: { label: 'Inteligencia' }, WIS: { label: 'Sabiduría' }, CHA: { label: 'Carisma' }
};

const calcMod = (score: number) => Math.floor((score - 10) / 2);
const formatMod = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;

// Generador inteligente de rasgos para ahorrar más de 12 mil caracteres
const getArchetypeFeature = (cls: string, sub: string, lvl: number) => {
  const pfx = sub || cls;
  const list: Record<number, { name: string; desc: string }> = {
    3: { name: `Senda del ${pfx}`, desc: "Desbloqueas los dones fundamentales del arquetipo sagrado." },
    6: { name: `Temple de ${pfx}`, desc: "La esencia de tu disciplina robustece tu cuerpo y agilidad." },
    9: { name: `Maestría Letal`, desc: "Tus ataques insignia o conjuros canalizan más precisión." },
    12: { name: `Bastión Rúnico`, desc: "Ganas defensas pasivas reforzadas contra tus peores rivales." },
    15: { name: `Apogeo de ${pfx}`, desc: "Despiertas el rasgo legendario definitorio de tu senda heroica." },
    18: { name: `Presencia Mítica`, desc: "Aura de inmunidades y control absoluto sobre tus esferas de poder." },
    20: { name: `Avatar Trascendental`, desc: "Consumación máxima del héroe. Tu poder físico o mágico desafía la mortalidad." }
  };
  return list[lvl] || { name: "Rasgo Heroico", desc: "Un don otorgado por tu progresión mística." };
};

interface CharacterSheetProps {
  onRollDice?: (expression: string, modifier?: number) => void;
}

export default function CharacterSheet({ onRollDice }: CharacterSheetProps) {
  const [char, setChar] = useState({
    name: "Aethelgard Lothbrok",
    race: "Enano",
    subrace: "Montañas",
    charClass: "Guerrero",
    subclass: "Maestro de Batalla",
    level: 3,
    stats: { STR: 16, DEX: 12, CON: 15, INT: 10, WIS: 12, CHA: 8 } as Record<Ability, number>,
    prof: { skills: ['Atletismo', 'Percepción'], saves: ['STR', 'CON'] as Ability[] },
    hp: { max: 32, curr: 32 },
    weapons: [
      { id: '1', name: "Mandoble Gótico", bonus: "+5", dmg: "2d6 + 3" },
      { id: '2', name: "Ballesta Pesada", bonus: "+3", dmg: "1d10 + 1" }
    ],
    spells: [{ id: '1', name: "Cura de Emergencia", lvl: "1", range: "Toque" }],
    inventory: ["Armadura de Placas Oxidada", "Reliquia Familiar", "Odre de Vino Amargo"],
    features: { 3: "Senda del Maestro de Batalla" } as Record<number, string>
  });

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<'hitos' | 'combate' | 'mistic' | 'mochila'>('combate');
  const [dice, setDice] = useState<{ isRolling: boolean; result: number | null; title: string; roll: number; mod: number; total: number } | null>(null);
  const [selHito, setSelHito] = useState<number | null>(null);

  // Formularios
  const [itemText, setItemText] = useState("");
  const [wpnText, setWpnText] = useState({ name: '', bonus: '', dmg: '' });
  const [splText, setSplText] = useState({ name: '', lvl: '1' });

  const profBonus = useMemo(() => Math.ceil(char.level / 4) + 1, [char.level]);

  // Sincronizar subraza y subclase automáticamente al cambiar raza o clase
  useEffect(() => {
    const listSub = RACES[char.race]?.subs;
    const listClass = CLASSES[char.charClass]?.subs;
    setChar(prev => ({
      ...prev,
      subrace: listSub ? listSub[0] : "",
      subclass: prev.level >= CLASSES[prev.charClass].subLvl && listClass ? listClass[0] : ""
    }));
  }, [char.race, char.charClass]);

  useEffect(() => {
    const listClass = CLASSES[char.charClass]?.subs;
    if (char.level < CLASSES[char.charClass].subLvl) {
      setChar(prev => ({ ...prev, subclass: "" }));
    } else if (!char.subclass && listClass) {
      setChar(prev => ({ ...prev, subclass: listClass[0] }));
    }
  }, [char.level]);

  const rollD20 = (title: string, modifier: number) => {
    setDice({ isRolling: true, result: null, title, roll: 0, mod: modifier, total: 0 });
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + modifier;
      setDice({
        isRolling: false,
        result: roll,
        title,
        roll,
        mod: modifier,
        total
      });
      // Notificar al padre si existe el callback
      if (onRollDice) {
        onRollDice(`d20${modifier >= 0 ? `+${modifier}` : modifier}`, modifier);
      }
    }, 450);
  };

  const toggleProf = (val: string, category: 'skills' | 'saves') => {
    setChar(prev => {
      const target = prev.prof[category] as string[];
      const exists = target.includes(val);
      return {
        ...prev,
        prof: {
          ...prev.prof,
          [category]: exists ? target.filter(x => x !== val) : [...target, val]
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#070606] text-stone-300 font-serif pb-12 relative overflow-x-hidden selection:bg-amber-900 selection:text-amber-200">
      {/* Neblina ambiental gótica */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/10 via-[#070606] to-[#040303] pointer-events-none z-0" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-950 via-amber-600 to-red-950" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 relative z-10 space-y-5">
        
        {/* CABECERA GÓTICA COMPACTA */}
        <div className="bg-[#120f0e] border-double border-4 border-amber-600/30 rounded-xl p-4 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#070606] px-4 border-x border-amber-600/30 text-amber-500 text-[10px] tracking-widest uppercase font-sans font-black flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 animate-pulse text-amber-500" /> FORJA DE HEROES
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Nombre y Nivel */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-[#070606] border border-amber-500/20 flex flex-col items-center justify-center shadow-lg">
                <span className="text-[9px] font-sans text-stone-500 uppercase font-bold">LVL</span>
                <input 
                  type="number" 
                  value={char.level}
                  onChange={e => setChar({ ...char, level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                  className="w-10 bg-transparent text-center font-serif text-xl font-black text-amber-400 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={char.name}
                  onChange={e => setChar({ ...char, name: e.target.value })}
                  className="bg-transparent text-xl sm:text-2xl font-bold text-amber-400 focus:outline-none border-b border-transparent focus:border-amber-500/10 w-full"
                />
                <div className="text-[11px] font-sans text-stone-400 flex flex-wrap gap-x-2 mt-0.5">
                  <span>{char.race} ({char.subrace})</span>
                  <span className="text-stone-700">•</span>
                  <span>{char.charClass} {char.subclass ? `- ${char.subclass}` : ""}</span>
                </div>
              </div>
            </div>

            {/* Selectores Rápidos Modernos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#070606]/60 p-2.5 rounded-lg border border-stone-850">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-amber-500 font-sans uppercase font-bold">Raza</span>
                <div className="relative">
                  <select 
                    value={char.race} 
                    onChange={e => setChar({ ...char, race: e.target.value })}
                    className="bg-[#0b0908] border border-stone-800 rounded px-2 py-1 text-[11px] text-stone-300 focus:outline-none w-full appearance-none cursor-pointer"
                  >
                    {Object.keys(RACES).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-500 absolute right-1.5 top-2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-amber-500 font-sans uppercase font-bold">Subraza</span>
                <div className="relative">
                  <select 
                    value={char.subrace} 
                    onChange={e => setChar({ ...char, subrace: e.target.value })}
                    className="bg-[#0b0908] border border-stone-800 rounded px-2 py-1 text-[11px] text-stone-300 focus:outline-none w-full appearance-none cursor-pointer"
                  >
                    {RACES[char.race]?.subs.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-500 absolute right-1.5 top-2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                <span className="text-[9px] text-amber-500 font-sans uppercase font-bold">Clase Principal</span>
                <div className="relative">
                  <select 
                    value={char.charClass} 
                    onChange={e => setChar({ ...char, charClass: e.target.value })}
                    className="bg-[#0b0908] border border-stone-800 rounded px-2 py-1 text-[11px] text-stone-300 focus:outline-none w-full appearance-none cursor-pointer"
                  >
                    {Object.keys(CLASSES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-500 absolute right-1.5 top-2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DISTRIBUCIÓN PRINCIPAL (3 columnas responsivas) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* COLUMNA 1: ATRIBUTOS (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-3 shadow-xl space-y-3">
              <div className="flex justify-between items-center bg-[#070606] border border-amber-500/10 rounded-lg p-2.5">
                <span className="text-[10px] text-stone-400 font-sans uppercase font-bold">Proficiency Bonus</span>
                <span className="text-lg font-serif font-black text-amber-400">{formatMod(profBonus)}</span>
              </div>

              <div className="space-y-2">
                {Object.keys(char.stats).map(statKey => {
                  const stat = statKey as Ability;
                  const score = char.stats[stat];
                  const mod = calcMod(score);
                  const isSave = char.prof.saves.includes(stat);
                  const saveTotal = mod + (isSave ? profBonus : 0);

                  return (
                    <div key={stat} className="relative bg-[#070606] border border-stone-850 p-2 rounded-lg flex items-center justify-between hover:border-amber-600/20 transition-all">
                      <div>
                        <span className="text-[10px] font-bold text-amber-500 font-sans block tracking-wide">{ABILITIES[stat].label}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[8px] text-stone-500 font-sans">VAL:</span>
                          <input 
                            type="number" 
                            value={score}
                            onChange={e => setChar(prev => ({
                              ...prev,
                              stats: { ...prev.stats, [stat]: Math.max(1, Math.min(30, parseInt(e.target.value) || 10)) }
                            }))}
                            className="w-8 bg-[#120f0e] border border-stone-800 text-amber-400 font-bold rounded text-center text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => rollD20(`Prueba de ${ABILITIES[stat].label}`, mod)}
                          className="px-2 py-1 bg-[#120f0e] border border-stone-800 hover:border-amber-500/30 text-stone-300 hover:text-amber-400 rounded text-[11px] font-bold font-sans active:scale-95 transition-all"
                        >
                          {formatMod(mod)}
                        </button>
                        <button 
                          onClick={() => rollD20(`Salvación de ${ABILITIES[stat].label}`, saveTotal)}
                          className={`p-1.5 border rounded active:scale-95 transition-all ${isSave ? 'border-amber-500 text-amber-400 bg-amber-950/20' : 'border-stone-800 text-stone-500 hover:text-stone-300'}`}
                          title="Tirada de Salvación"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => toggleProf(stat, 'saves')}
                        className="absolute -top-1 -right-1 p-0.5"
                      >
                        {isSave ? <CheckCircle2 className="w-3 h-3 text-amber-500 bg-[#070606] rounded-full" /> : <Circle className="w-3 h-3 text-stone-700 bg-[#070606] rounded-full" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMNA 2: COMBATE, SALUD Y PESTAÑAS (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            
            {/* SALUD Y COMBATE RÁPIDO */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-2.5 text-center shadow-lg">
                <span className="text-[8px] text-stone-500 uppercase tracking-widest font-sans block mb-0.5">Armor Class</span>
                <span className="text-2xl font-black text-stone-200">{10 + calcMod(char.stats.DEX)}</span>
              </div>
              <button 
                onClick={() => rollD20("Iniciativa", calcMod(char.stats.DEX))}
                className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-2.5 text-center hover:border-amber-500/30 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <span className="text-[8px] text-stone-500 uppercase tracking-widest font-sans block mb-0.5">Iniciativa</span>
                <span className="text-2xl font-black text-amber-400">{formatMod(calcMod(char.stats.DEX))}</span>
              </button>
              <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-2.5 text-center shadow-lg">
                <span className="text-[8px] text-stone-500 uppercase tracking-widest font-sans block mb-0.5">Velocidad</span>
                <span className="text-2xl font-black text-stone-200">30 ft</span>
              </div>
            </div>

            {/* BARRA DE VIDA DINÁMICA */}
            <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-3.5 shadow-xl relative overflow-hidden">
              <Heart className="w-16 h-16 text-red-950/10 absolute -bottom-2 -right-2 pointer-events-none" />
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-500">Puntos de Vida</span>
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <span>MAX:</span>
                  <input 
                    type="number" 
                    value={char.hp.max}
                    onChange={e => setChar(prev => ({ ...prev, hp: { ...prev.hp, max: Math.max(1, parseInt(e.target.value) || 10) } }))}
                    className="w-10 bg-[#070606] border border-stone-800 text-amber-400 text-center rounded text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 py-2">
                <button 
                  onClick={() => setChar(prev => ({ ...prev, hp: { ...prev.hp, curr: Math.max(0, prev.hp.curr - 1) } }))}
                  className="w-8 h-8 bg-red-950/30 hover:bg-red-900/30 text-red-400 border border-red-900/20 rounded text-md transition-all active:scale-95"
                >
                  -1
                </button>
                <input 
                  type="number" 
                  value={char.hp.curr}
                  onChange={e => setChar(prev => ({ ...prev, hp: { ...prev.hp, curr: Math.max(0, Math.min(prev.hp.max, parseInt(e.target.value) || 0)) } }))}
                  className="text-4xl font-black bg-transparent text-red-500 text-center w-16 focus:outline-none"
                />
                <button 
                  onClick={() => setChar(prev => ({ ...prev, hp: { ...prev.hp, curr: Math.min(prev.hp.max, prev.hp.curr + 1) } }))}
                  className="w-8 h-8 bg-emerald-950/30 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-900/20 rounded text-md transition-all active:scale-95"
                >
                  +1
                </button>
              </div>

              <div className="w-full bg-[#070606] h-2 border border-stone-850 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-800 to-red-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(char.hp.curr / char.hp.max) * 100}%` }}
                />
              </div>
            </div>

            {/* PANEL DE PESTAÑAS COMPACTO */}
            <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-3.5 shadow-xl space-y-3">
              <div className="flex gap-1 border-b border-stone-850 pb-2 overflow-x-auto scrollbar-none">
                {(['combate', 'mistic', 'mochila', 'hitos'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${tab === t ? 'bg-amber-950/30 border border-amber-500/20 text-amber-400' : 'text-stone-500 hover:text-stone-300'}`}
                  >
                    {t === 'combate' ? 'Ataques' : t === 'mistic' ? 'Hechizos' : t === 'mochila' ? 'Inventario' : 'Hitos'}
                  </button>
                ))}
              </div>

              <div className="min-h-[160px]">
                {/* TRABAJO: COMBATE / ARMAS */}
                {tab === 'combate' && (
                  <div className="space-y-2">
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                      {char.weapons.map(w => (
                        <div key={w.id} className="bg-[#070606] p-2 rounded border border-stone-850 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-stone-200">{w.name}</span>
                            <p className="text-[9px] text-stone-500">Bono: <strong className="text-amber-500">{w.bonus}</strong> • Daño: <strong className="text-red-500">{w.dmg}</strong></p>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => rollD20(`Ataque con ${w.name}`, parseInt(w.bonus) || 0)}
                              className="p-1 bg-amber-950/20 text-amber-400 rounded border border-amber-500/20 hover:bg-amber-950/40"
                            >
                              <Dice5 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setChar(prev => ({ ...prev, weapons: prev.weapons.filter(x => x.id !== w.id) }))}
                              className="p-1 text-stone-600 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1 pt-1.5 border-t border-stone-850">
                      <input 
                        type="text" 
                        placeholder="Nombre" 
                        value={wpnText.name} 
                        onChange={e => setWpnText({ ...wpnText, name: e.target.value })}
                        className="bg-[#070606] border border-stone-800 rounded p-1 text-xs focus:outline-none flex-1"
                      />
                      <input 
                        type="text" 
                        placeholder="+5" 
                        value={wpnText.bonus} 
                        onChange={e => setWpnText({ ...wpnText, bonus: e.target.value })}
                        className="bg-[#070606] border border-stone-800 rounded p-1 text-xs focus:outline-none w-10 text-center"
                      />
                      <input 
                        type="text" 
                        placeholder="2d6" 
                        value={wpnText.dmg} 
                        onChange={e => setWpnText({ ...wpnText, dmg: e.target.value })}
                        className="bg-[#070606] border border-stone-800 rounded p-1 text-xs focus:outline-none w-14 text-center"
                      />
                      <button 
                        onClick={() => {
                          if (wpnText.name) {
                            setChar(prev => ({ ...prev, weapons: [...prev.weapons, { id: Date.now().toString(), ...wpnText }] }));
                            setWpnText({ name: '', bonus: '', dmg: '' });
                          }
                        }}
                        className="p-1.5 bg-amber-950/30 border border-amber-500/20 text-amber-400 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TRABAJO: HECHIZOS */}
                {tab === 'mistic' && (
                  <div className="space-y-2">
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                      {char.spells.map(s => (
                        <div key={s.id} className="bg-[#070606] p-2 rounded border border-stone-850 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-stone-200 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-500" /> {s.name}</span>
                            <p className="text-[9px] text-stone-500">Nivel {s.lvl} • Rango: {s.range}</p>
                          </div>
                          <button 
                            onClick={() => setChar(prev => ({ ...prev, spells: prev.spells.filter(x => x.id !== s.id) }))}
                            className="p-1 text-stone-600 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1 pt-1.5 border-t border-stone-850">
                      <input 
                        type="text" 
                        placeholder="Conjuro" 
                        value={splText.name} 
                        onChange={e => setSplText({ ...splText, name: e.target.value })}
                        className="bg-[#070606] border border-stone-800 rounded p-1 text-xs focus:outline-none flex-1"
                      />
                      <button 
                        onClick={() => {
                          if (splText.name) {
                            setChar(prev => ({ ...prev, spells: [...prev.spells, { id: Date.now().toString(), name: splText.name, lvl: splText.lvl, range: "60 ft" }] }));
                            setSplText({ name: '', lvl: '1' });
                          }
                        }}
                        className="p-1.5 bg-amber-950/30 border border-amber-500/20 text-amber-400 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TRABAJO: INVENTARIO */}
                {tab === 'mochila' && (
                  <div className="space-y-2">
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                      {char.inventory.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-[#070606] p-1.5 rounded border border-stone-850 text-xs">
                          <span className="flex items-center gap-1 text-stone-300"><Backpack className="w-3 h-3 text-amber-600" /> {item}</span>
                          <button onClick={() => setChar(prev => ({ ...prev, inventory: prev.inventory.filter((_, i) => i !== index) }))} className="text-stone-600 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1 pt-1.5 border-t border-stone-850">
                      <input 
                        type="text" 
                        placeholder="Poción, oro, gemas..." 
                        value={itemText} 
                        onChange={e => setItemText(e.target.value)}
                        className="bg-[#070606] border border-stone-800 rounded p-1 text-xs focus:outline-none flex-1"
                      />
                      <button 
                        onClick={() => {
                          if (itemText) {
                            setChar(prev => ({ ...prev, inventory: [...prev.inventory, itemText] }));
                            setItemText("");
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-950/30 border border-amber-500/20 text-amber-400 rounded text-xs font-sans"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                )}

                {/* TRABAJO: RESUMEN HITOS */}
                {tab === 'hitos' && (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    <span className="text-[10px] text-amber-500 font-sans uppercase font-bold">Poderes Adquiridos</span>
                    {Object.keys(char.features).length > 0 ? (
                      Object.entries(char.features).map(([lvl, name]) => (
                        <div key={lvl} className="border-l border-amber-500/40 pl-2.5 py-0.5 text-xs">
                          <strong className="text-amber-400">Nivel {lvl}:</strong> {name}
                          <p className="text-[9px] text-stone-500">{getArchetypeFeature(char.charClass, char.subclass, parseInt(lvl)).desc}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-500 italic">No has reclamado ningún hito aún. Hazlo en la barra derecha.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMNA 3: HABILIDADES E HITOS DE CLASE (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            
            {/* HITOS DE PROGRESIÓN (3, 6, 9, 12, 15, 18, 20) */}
            <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-3 shadow-xl space-y-2.5">
              <span className="text-[10px] text-amber-500 uppercase tracking-widest font-sans font-bold block">Progreso de Clase</span>
              <div className="flex gap-1 justify-between">
                {[3, 6, 9, 12, 15, 18, 20].map(lvl => {
                  const unlocked = char.level >= lvl;
                  const claimed = char.features[lvl];
                  return (
                    <button
                      key={lvl}
                      disabled={!unlocked}
                      onClick={() => setSelHito(lvl)}
                      className={`w-8 h-8 rounded border text-[10px] font-bold flex flex-col items-center justify-center cursor-pointer transition-all ${
                        unlocked 
                          ? claimed 
                            ? 'bg-amber-950/20 border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                            : 'bg-[#070606] border-amber-500/40 text-amber-500 animate-pulse'
                          : 'bg-[#030202] border-stone-900 text-stone-700 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-[7px]">Lv</span>
                      <span>{lvl}</span>
                    </button>
                  );
                })}
              </div>

              {/* Caja flotante contextual de selección de Arquetipo */}
              {selHito !== null && (
                <div className="bg-[#070606] p-2.5 rounded border border-amber-500/20 text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-stone-850 pb-1">
                    <span className="text-[9px] font-sans font-bold text-amber-500 uppercase">Hito Nivel {selHito}</span>
                    <button onClick={() => setSelHito(null)} className="text-stone-500 hover:text-stone-300">Cerrar</button>
                  </div>

                  {/* Selector de Subclase si corresponde */}
                  {selHito === CLASSES[char.charClass]?.subLvl && (
                    <div className="space-y-1 border-b border-stone-850 pb-2">
                      <span className="text-[8px] uppercase tracking-wider text-amber-400 block">Senda de Arquetipo</span>
                      <div className="grid grid-cols-2 gap-1">
                        {CLASSES[char.charClass]?.subs.map(s => (
                          <button
                            key={s}
                            onClick={() => setChar({ ...char, subclass: s })}
                            className={`p-1 text-left border rounded text-[9px] ${char.subclass === s ? 'border-amber-500 text-amber-400 bg-amber-950/20' : 'border-stone-850 text-stone-500'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detalle y reclamo del rasgo */}
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider text-stone-500 block">Rasgo a Adquirir</span>
                    <div className="p-1.5 bg-[#120f0e] border border-stone-850 rounded">
                      <span className="font-bold text-amber-400 text-[11px] block">{getArchetypeFeature(char.charClass, char.subclass, selHito).name}</span>
                      <p className="text-[9px] text-stone-400 leading-normal mt-0.5">{getArchetypeFeature(char.charClass, char.subclass, selHito).desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const featureName = getArchetypeFeature(char.charClass, char.subclass, selHito!).name;
                        setChar(prev => ({
                          ...prev,
                          features: { ...prev.features, [selHito!]: featureName }
                        }));
                        setSelHito(null);
                      }}
                      className="w-full mt-1.5 py-1 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-400 text-[10px] font-sans font-bold rounded"
                    >
                      Consagrar Hito
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CONSOLA DE HABILIDADES (SKILLS) */}
            <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-3 shadow-xl space-y-2.5">
              <div className="flex justify-between items-center border-b border-stone-850 pb-1.5">
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-sans font-bold">Habilidades</span>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Filtrar..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-[#070606] border border-stone-800 rounded pl-6 pr-1.5 py-0.5 text-[10px] text-stone-300 focus:outline-none w-24 font-sans"
                  />
                  <Search className="w-2.5 h-2.5 text-stone-600 absolute left-2 top-1.5" />
                </div>
              </div>

              <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                {SKILLS.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => {
                  const isProf = char.prof.skills.includes(s.name);
                  const base = calcMod(char.stats[s.ability]);
                  const total = base + (isProf ? profBonus : 0);

                  return (
                    <div key={s.name} className="flex items-center justify-between bg-[#070606]/50 p-1 px-2 rounded border border-stone-850 text-xs hover:border-amber-950 transition-all">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleProf(s.name, 'skills')} className="text-stone-600 hover:text-amber-500">
                          {isProf ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> : <Circle className="w-3.5 h-3.5" />}
                        </button>
                        <span>{s.name} <span className="text-[9px] text-stone-500">({s.ability})</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-500 font-serif">{formatMod(total)}</span>
                        <button 
                          onClick={() => rollD20(`Tirada de ${s.name}`, total)}
                          className="p-0.5 bg-[#120f0e] border border-stone-800 hover:border-amber-500/20 rounded"
                        >
                          <Dice5 className="w-3 h-3 text-stone-500 hover:text-amber-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* LANZADOR DE DADOS FLOTANTE ULTRA COMPACTO */}
        <div className="fixed bottom-4 right-4 z-50 w-52 bg-gradient-to-b from-[#120f0e] to-[#070606] border-2 border-amber-500/30 rounded-xl shadow-2xl overflow-hidden p-3 space-y-2">
          <div className="flex justify-between items-center border-b border-stone-850 pb-1">
            <span className="text-[9px] font-sans font-bold uppercase text-amber-500 flex items-center gap-1">
              <Dice5 className="w-3.5 h-3.5 animate-pulse" /> LANZADOR D20
            </span>
          </div>

          {dice ? (
            dice.isRolling ? (
              <div className="flex flex-col items-center py-2">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[8px] font-sans uppercase tracking-widest text-amber-500 mt-1 animate-pulse">Girando Destino...</span>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <span className="text-[9px] text-stone-400 block truncate">{dice.title}</span>
                <span className={`text-3xl font-serif font-black block ${dice.result === 20 ? 'text-amber-400' : dice.result === 1 ? 'text-red-500' : 'text-stone-100'}`}>
                  {dice.total}
                </span>
                <span className="text-[8px] text-stone-500 bg-[#070606] px-1 py-0.5 rounded border border-stone-800 font-sans inline-block">
                  d20({dice.result}) {dice.mod !== 0 && ` + Mod(${dice.mod})`}
                </span>
              </div>
            )
          ) : (
            <p className="text-[9px] text-stone-500 text-center py-1 font-sans">Usa los botones rúnicos para lanzar dados.</p>
          )}
        </div>

      </div>
    </div>
  );
}
