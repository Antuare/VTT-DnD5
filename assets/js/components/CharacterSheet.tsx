import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, Heart, Dice5, Search, Plus, Trash2, Flame, Backpack, 
  Scroll, Sparkles, ChevronDown, CheckCircle2, Circle, BookOpen, Star,
  Sword, Wand, Gem, Moon, Sun, Bed, Hourglass, Award, Feather, Skull
} from 'lucide-react';

type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

// ==================== DATOS DE ARMADURAS ====================
const ARMORS: Record<string, { name: string; type: 'light' | 'medium' | 'heavy'; baseAC: number; maxDex?: number; strReq?: number; stealthDisadv: boolean }> = {
  none: { name: 'Sin armadura', type: 'light', baseAC: 10, maxDex: undefined, stealthDisadv: false },
  padded: { name: 'Acolchada', type: 'light', baseAC: 11, maxDex: undefined, stealthDisadv: true },
  leather: { name: 'Cuero', type: 'light', baseAC: 11, maxDex: undefined, stealthDisadv: false },
  studded: { name: 'Cuero tachonado', type: 'light', baseAC: 12, maxDex: undefined, stealthDisadv: false },
  hide: { name: 'Piel', type: 'medium', baseAC: 12, maxDex: 2, stealthDisadv: false },
  chainshirt: { name: 'Camisa de mallas', type: 'medium', baseAC: 13, maxDex: 2, stealthDisadv: false },
  scalemail: { name: 'Escamas', type: 'medium', baseAC: 14, maxDex: 2, stealthDisadv: true },
  breastplate: { name: 'Coraza', type: 'medium', baseAC: 14, maxDex: 2, stealthDisadv: false },
  halfplate: { name: 'Media placa', type: 'medium', baseAC: 15, maxDex: 2, stealthDisadv: true },
  ringmail: { name: 'Cota de anillos', type: 'heavy', baseAC: 14, stealthDisadv: true },
  chainmail: { name: 'Cota de mallas', type: 'heavy', baseAC: 16, strReq: 13, stealthDisadv: true },
  splint: { name: 'Laminada', type: 'heavy', baseAC: 17, strReq: 15, stealthDisadv: true },
  plate: { name: 'Placas', type: 'heavy', baseAC: 18, strReq: 15, stealthDisadv: true }
};

const SHIELDS: Record<string, { name: string; acBonus: number }> = {
  none: { name: 'Sin escudo', acBonus: 0 },
  shield: { name: 'Escudo', acBonus: 2 }
};

// ==================== DATOS DE HECHIZOS POR CLASE ====================
const SPELLS_BY_CLASS: Record<string, string[]> = {
  Mago: ['Bola de Fuego', 'Rayo', 'Escudo Arcano', 'Detectar Magia', 'Identificar', 'Telekinesis', 'Contrahechizo', 'Visión Arcana', 'Puerta Dimensional', 'Polimorfar', 'Paralizar', 'Nube Hedionda', 'Relámpago', 'Imagen Mayor', 'Globo Ocular', 'Muro de Fuego', 'Cono de Frío', 'Piel de Piedra', 'Volar', 'Respirar Agua'],
  Clérigo: ['Curar Heridas', 'Bendición', 'Arma Espiritual', 'Golpe Guiado', 'Detectar Bien y Mal', 'Santuario', 'Palabra Curativa', 'Niebla Mortal', 'Zona de Verdad', 'Oración Sanadora', 'Revivir', 'Palabra de Retorno', 'Guardián de Fe', 'Llama Sagrada', 'Infligir Heridas', 'Armazón de Escarcha', 'Rayo Guía', 'Protección del Bien y del Mal'],
  Brujo: ['Eldritch Blast', 'Hex', 'Armadura de Agathys', 'Comprensión Lenguajes', 'Detectar Magia', 'Disparo Viscoso', 'Quemar Manos', 'Onda Atronadora', 'Paso Brumoso', 'Contacto Escalofriante', 'Espejo Embrujado', 'Terror', 'Rayo Enfebrecido', 'Oscuridad', 'Marca del Cazador', 'Imponer Castigo', 'Armadura de Sombras', 'Mirada Hipnótica'],
  Bardo: ['Amistad con Animales', 'Aturdir', 'Curar Heridas', 'Detectar Magia', 'Disparar Escondite', 'Encantamiento', 'Heroísmo', 'Imagen Silenciosa', 'Largo Descanso', 'Palabra Curativa', 'Risa Incontrolable', 'Sonido Fantasmal', 'Susurro Discordante', 'Toque Helado', 'Ver lo Invisible', 'Vocalizar', 'Zancada Acrobática'],
  Druida: ['Bramido Trueno', 'Crear Hoguera', 'Curar Heridas', 'Detectar Magia', 'Hablar con Animales', 'Jaula de Viento', 'Llamar Relámpago', 'Nube Hedionda', 'Pasar sin Dejar Rastro', 'Producir Llama', 'Raíces Prehensiles', 'Sanar Heridas', 'Salto', 'Zancada Lunar'],
  Hechicero: ['Bola de Fuego', 'Rayo', 'Escudo', 'Detectar Magia', 'Disparo de Energía', 'Manos Ardientes', 'Niebla Obscurecedora', 'Onda Atronadora', 'Paso Brumoso', 'Quemar Manos', 'Rayo de Escarcha', 'Toque Helado', 'Vuelo', 'Telaraña', 'Invisibilidad', 'Esfera Resplandeciente'],
  Paladín: ['Bendición', 'Curar Heridas', 'Detectar Bien y Mal', 'Favor Divino', 'Golpe Divino', 'Imponer Manos', 'Arma Mágica', 'Protección del Bien y del Mal', 'Castigo Infernal', 'Zona de Verdad', 'Aura de Protección', 'Encontrar Corcel', 'Golpe de Poder', 'Restauración Menor'],
  Explorador: ['Atrapar Presa', 'Curar Heridas', 'Detectar Magia', 'Hablar con Animales', 'Marcador de Cazador', 'Pasar sin Dejar Rastro', 'Saltar', 'Zancada Lunar', 'Flecha Ácida', 'Corona de Locura', 'Disparar Escondite', 'Niebla Obscurecedora', 'Cuerda de Trips'],
  Pícaro: [], // Los pícaros no lanzan conjuros por defecto (excepto Embaucador Arcano)
  Guerrero: [], // Los guerreros no lanzan conjuros por defecto (excepto Caballero Éldrico)
  Bárbaro: [], // Los bárbaros no lanzan conjuros
  Monje: [] // Los monjes no lanzan conjuros
};

const SPELL_LEVELS: Record<string, number> = {
  'Truco': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};

const SPELL_SLOT_TABLE: Record<number, number[]> = {
  1: [0, 2, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 3, 0, 0, 0, 0, 0, 0, 0],
  3: [0, 4, 2, 0, 0, 0, 0, 0, 0],
  4: [0, 4, 3, 0, 0, 0, 0, 0, 0],
  5: [0, 4, 3, 2, 0, 0, 0, 0, 0],
  6: [0, 4, 3, 3, 0, 0, 0, 0, 0],
  7: [0, 4, 3, 3, 1, 0, 0, 0, 0],
  8: [0, 4, 3, 3, 2, 0, 0, 0, 0],
  9: [0, 4, 3, 3, 3, 1, 0, 0, 0],
  10: [0, 4, 3, 3, 3, 2, 0, 0, 0],
  11: [0, 4, 3, 3, 3, 2, 1, 0, 0],
  12: [0, 4, 3, 3, 3, 2, 1, 0, 0],
  13: [0, 4, 3, 3, 3, 2, 1, 1, 0],
  14: [0, 4, 3, 3, 3, 2, 1, 1, 0],
  15: [0, 4, 3, 3, 3, 2, 1, 1, 1],
  16: [0, 4, 3, 3, 3, 2, 1, 1, 1],
  17: [0, 4, 3, 3, 3, 2, 1, 1, 1],
  18: [0, 4, 3, 3, 3, 3, 1, 1, 1],
  19: [0, 4, 3, 3, 3, 3, 2, 1, 1],
  20: [0, 4, 3, 3, 3, 3, 2, 2, 1]
};

// ==================== DATOS DE DOTES (FEATS) ====================
const FEATS: Record<string, { name: string; desc: string; abilityScore?: Partial<Record<Ability, number>> }> = {
  sharpshooter: { name: 'Tirador de Primera', desc: 'Ignora cobertura parcial y total. Sin penalizador a larga distancia. Puedes elegir -5 al ataque para +10 al daño.' },
  warcaster: { name: 'Iniciado en la Magia', desc: 'Ventaja en tiradas de concentración. Puedes realizar ataques de oportunidad con conjuros. Puedes usar componentes somáticos con manos ocupadas.' },
  greatweaponmaster: { name: 'Maestro de Armas Pesadas', desc: 'Cuando sacas crítico o matas un enemigo, haz un ataque bonus. Puedes elegir -5 al ataque para +10 al daño con armas pesadas.' },
  polearmmaster: { name: 'Maestro de Asta', desc: 'Obtienes un ataque bonus con el extremo opuesto del arma. Las oportunidades de ataque se activan cuando entran en tu alcance.' },
  lucky: { name: 'Afortunado', desc: 'Tienes 3 puntos de suerte que puedes gastar para rerrolar d20 antes de ver el resultado.' },
  resilient: { name: 'Resiliente', desc: 'Elige una habilidad: ganas competencia en tiradas de salvación de esa característica y +1 a esa característica.' },
  skilled: { name: 'Experto', desc: 'Ganas competencia en 3 habilidades o herramientas a tu elección.' },
  alert: { name: 'Alerta', desc: '+5 a iniciativa. No puedes ser sorprendido mientras estás consciente. Otras criaturas no tienen ventaja contra ti por estar ocultas.' },
  actor: { name: 'Actor', desc: '+1 CAR. Ventaja en Engaño e Interpretación cuando intentas hacerte pasar por otro personaje. Puedes imitar sonidos y voces.' },
  charger: { name: 'Cargador', desc: 'Cuando usas tu acción para Dash y te mueves al menos 10 pies, puedes hacer un ataque cuerpo a cuerpo o empujar al objetivo.' },
  crossbowexpert: { name: 'Experto en Ballesta', desc: 'Ignoras la propiedad de carga. Sin desventaja por enemigos adyacentes. Disparas ballesta como ataque bonus después de atacar con arma de una mano.' },
  defensiveDuelist: { name: 'Duelista Defensivo', desc: 'Cuando te golpean con un ataque cuerpo a cuerpo, puedes usar reacción para añadir tu bonificador de competencia a tu CA.' },
  dungeonDelver: { name: 'Explorador de Mazmorras', desc: 'Ventaja en Percepción e Investigación para encontrar puertas secretas. Puedes detectar trampas rápidamente.' },
  durable: { name: 'Duradero', desc: '+1 CON. Cuando haces descanso corto, recuperas mínimo el doble de tus dados de golpe si gastas al menos uno.' },
  elementalAdept: { name: 'Adepto Elemental', desc: 'Elige un tipo de daño elemental. Ignoras resistencia a ese tipo. Cuando lanzas conjuro de ese tipo, tratas 1s como 2s.' },
  grappler: { name: 'Luchador', desc: 'Ventaja para agarrar. Puedes intentar agarrar criaturas más grandes. Puedes inmovilizar criaturas agarradas.' },
  healer: { name: 'Sanador', desc: 'Cuando usas kit de sanador, restauras máximo posible. Puedes usar acción para estabilizar criatura moribunda sin kit.' },
  heavilyArmored: { name: 'Acostumbrado a Armadura Pesada', desc: '+1 FUE. Ganas competencia con armaduras pesadas.' },
  inspiringLeader: { name: 'Líder Inspirador', desc: 'Puedes pasar 10 minutos inspirando hasta 6 criaturas. Cada una gana HP temporales igual a tu nivel + mod CHA.' },
  keenMind: { name: 'Mente Aguda', desc: '+1 INT. Siempre sabes dónde está el norte. Puedes recordar cualquier cosa leída o escuchada en el último mes.' },
};

// ==================== DATOS DE TRASFONDOS ====================
const BACKGROUNDS: Record<string, { name: string; skills: string[]; languages: string[]; equipment: string[]; feature: string; description: string }> = {
  acolyte: { 
    name: 'Acólito', 
    skills: ['Perspicacia', 'Religión'], 
    languages: ['Dos a elección'], 
    equipment: ['Símbolo sagrado', 'Libro de oraciones', 'Incienso', 'Vestiduras sacerdotales', 'Bolsa con 15 mo'],
    feature: 'Refugio de Fe - Puedes pedir ayuda en templos de tu fe',
    description: 'Has pasado años sirviendo en un templo, aprendiendo los ritos sagrados.'
  },
  criminal: { 
    name: 'Criminal', 
    skills: ['Engaño', 'Sigilo'], 
    languages: ['Uno a elección'], 
    equipment: ['Palanca', 'Kit de disfraz', 'Herramientas de ladrón', 'Bolsa con 15 mo'],
    feature: 'Contacto Criminal - Tienes un contacto fiable en la red criminal',
    description: 'Eres un delincuente experimentado con historial de actividades ilegales.'
  },
  folkhero: { 
    name: 'Héroe del Pueblo', 
    skills: ['Trato con Animales', 'Supervivencia'], 
    languages: [], 
    equipment: ['Herramientas de artesano', 'Pala', 'Hierro de brasas', 'Bolsa con 10 mo'],
    feature: 'Defensor del Pueblo - La gente común te protege y oculta',
    description: 'Eres conocido por realizar actos heroicos que beneficiaron a la comunidad.'
  },
  sage: { 
    name: 'Sabio', 
    skills: ['Arcano', 'Historia'], 
    languages: ['Dos a elección'], 
    equipment: ['Tintero', 'Pluma', 'Cuchillo pequeño', 'Carta de familiar muerto', 'Bolsa con 10 mo'],
    feature: 'Investigador - Si no sabes algo, puedes saber dónde encontrar información',
    description: 'Has pasado años estudiando textos antiguos y acumulando conocimiento.'
  },
  soldier: { 
    name: 'Soldado', 
    skills: ['Atletismo', 'Intimidación'], 
    languages: [], 
    equipment: ['Insignia de rango', 'Trofeo enemigo', 'Baraja de cartas', 'Bolsa con 10 mo'],
    feature: 'Rango Militar - Tienes autoridad sobre soldados de menor rango',
    description: 'Has servido en un ejército, aprendiendo combate y disciplina militar.'
  },
  entertainer: { 
    name: 'Animador', 
    skills: ['Acrobacias', 'Interpretación'], 
    languages: [], 
    equipment: ['Instrumento musical', 'Regalo de admirador', 'Disfraces', 'Bolsa con 15 mo'],
    feature: 'Por Popular Demanda - Puedes actuar para obtener alojamiento y comida',
    description: 'Eres un performer talentoso que alegra audiencias con arte.'
  },
  noble: { 
    name: 'Noble', 
    skills: ['Persuasión', 'Historia'], 
    languages: ['Uno a elección'], 
    equipment: ['Vestimentas finas', 'Anillo de sello', 'Escudo de armas', 'Bolsa con 25 mo'],
    feature: 'Posición Privilegiada - La gente te respeta por tu estatus social',
    description: 'Perteneces a una familia noble con tierras, títulos y responsabilidades.'
  },
  urchin: { 
    name: 'Huérfano Callejero', 
    skills: ['Juego de Manos', 'Sigilo'], 
    languages: [], 
    equipment: ['Navaja', 'Moneda truñada', 'Dados', 'Cuerda', 'Bolsa con 10 mo'],
    feature: 'Mascota Urbana - Conoces las ciudades y sus secretos callejeros',
    description: 'Creciste en las calles, sobreviviendo por ingenio y astucia.'
  }
};

const RACES: Record<string, { bonus: string; subs: string[]; speed: number; size: string }> = {
  "Humano": { bonus: "+1 a Todo", subs: ["Estándar", "Variante"], speed: 30, size: "Mediano" },
  "Elfo": { bonus: "+2 DEX", subs: ["Alto Elfo", "Elfo de los Bosques", "Drow"], speed: 30, size: "Mediano" },
  "Enano": { bonus: "+2 CON", subs: ["Colinas", "Montañas", "Duergar"], speed: 25, size: "Mediano" },
  "Mediano": { bonus: "+2 DEX", subs: ["Piesligeros", "Fornido"], speed: 25, size: "Pequeño" },
  "Dracónido": { bonus: "+2 FUE, +1 CAR", subs: ["Cromático", "Metálico"], speed: 30, size: "Mediano" },
  "Gnomo": { bonus: "+2 INT", subs: ["Bosques", "Rocas"], speed: 25, size: "Pequeño" },
  "Medioelfo": { bonus: "+2 CAR, +1 a dos", subs: ["Estandar"], speed: 30, size: "Mediano" },
  "Semiorco": { bonus: "+2 FUE, +1 CON", subs: ["Semiorco"], speed: 30, size: "Mediano" },
  "Tiflin": { bonus: "+2 CAR, +1 INT", subs: ["Infernal", "Abisal"], speed: 30, size: "Mediano" }
};

const CLASSES: Record<string, { hd: string; pri: string; subLvl: number; subs: string[]; primaryAbility: Ability; spellcasting?: boolean; hitDiceType: number }> = {
  "Guerrero": { hd: "1d10", pri: "FUE/DES", subLvl: 3, subs: ["Campeón", "Maestro de Batalla", "Caballero Éldrico"], primaryAbility: 'STR', hitDiceType: 10 },
  "Mago": { hd: "1d6", pri: "INT", subLvl: 2, subs: ["Evocación", "Abjuración", "Necromancia"], primaryAbility: 'INT', spellcasting: true, hitDiceType: 6 },
  "Clérigo": { hd: "1d8", pri: "SAB", subLvl: 1, subs: ["Vida", "Tempestad", "Guerra"], primaryAbility: 'WIS', spellcasting: true, hitDiceType: 8 },
  "Pícaro": { hd: "1d8", pri: "DES", subLvl: 3, subs: ["Asesino", "Bribón", "Embaucador Arcano"], primaryAbility: 'DEX', hitDiceType: 8 },
  "Bárbaro": { hd: "1d12", pri: "FUE", subLvl: 3, subs: ["Totémico", "Frenesí", "Zealot"], primaryAbility: 'STR', hitDiceType: 12 },
  "Bardo": { hd: "1d8", pri: "CAR", subLvl: 3, subs: ["Saber", "Valor", "Espadas"], primaryAbility: 'CHA', spellcasting: true, hitDiceType: 8 },
  "Druida": { hd: "1d8", pri: "SAB", subLvl: 2, subs: ["Luna", "Tierra", "Esporas"], primaryAbility: 'WIS', spellcasting: true, hitDiceType: 8 },
  "Monje": { hd: "1d8", pri: "DES/SAB", subLvl: 3, subs: ["Mano Abierta", "Sombras", "Elementos"], primaryAbility: 'DEX', hitDiceType: 8 },
  "Paladín": { hd: "1d10", pri: "FUE/CAR", subLvl: 3, subs: ["Devoción", "Venganza", "Conquista"], primaryAbility: 'STR', spellcasting: true, hitDiceType: 10 },
  "Explorador": { hd: "1d10", pri: "DES/SAB", subLvl: 3, subs: ["Cazador", "Bestias", "Acechador"], primaryAbility: 'DEX', spellcasting: true, hitDiceType: 10 },
  "Hechicero": { hd: "1d6", pri: "CAR", subLvl: 1, subs: ["Línea Dracónica", "Magia Salvaje", "Tormenta"], primaryAbility: 'CHA', spellcasting: true, hitDiceType: 6 },
  "Brujo": { hd: "1d8", pri: "CAR", subLvl: 1, subs: ["Archihada", "El Celestial", "El Filo"], primaryAbility: 'CHA', spellcasting: true, hitDiceType: 8 }
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
  { name: 'Supervivencia', ability: 'WIS' }, { name: 'Trato con Animales', ability: 'WIS' }
];

const ABILITIES: Record<Ability, { label: string; savingThrowProf?: boolean }> = {
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

// ASI levels
const ASI_LEVELS = [4, 8, 12, 16, 19];

interface CharacterSheetProps {
  onRollDice?: (expression: string, modifier?: number) => void;
}

export default function CharacterSheet({ onRollDice }: CharacterSheetProps) {
  const [char, setChar] = useState({
    name: "Aethelgard Lothbrok",
    race: "Enano",
    subrace: "Montañas",
    background: "Soldado",
    charClass: "Guerrero",
    subclass: "Maestro de Batalla",
    level: 3,
    stats: { STR: 16, DEX: 12, CON: 15, INT: 10, WIS: 12, CHA: 8 } as Record<Ability, number>,
    prof: { skills: ['Atletismo', 'Percepción'], saves: ['STR', 'CON'] as Ability[] },
    hp: { max: 32, curr: 32, temp: 0 },
    hitDice: { current: 3, max: 3, type: 'd10' },
    armor: { equipped: 'chainmail' as keyof typeof ARMORS, shield: 'shield' as keyof typeof SHIELDS },
    weapons: [
      { id: '1', name: "Mandoble Gótico", bonus: "+5", dmg: "2d6 + 3" },
      { id: '2', name: "Ballesta Pesada", bonus: "+3", dmg: "1d10 + 1" }
    ],
    spells: [
      { id: '1', name: "Bola de Fuego", level: 3, school: 'Evocación', components: 'V,S,M', duration: 'Instantánea', range: '150 ft', damage: '8d6 fuego' }
    ] as Array<{ id: string; name: string; level: number; school?: string; components?: string; duration?: string; range?: string; damage?: string }>,
    spellSlots: { used: [0, 2, 0, 0, 0, 0, 0, 0, 0] as number[], max: [0, 2, 0, 0, 0, 0, 0, 0, 0] as number[] },
    inventory: ["Armadura de Placas Oxidada", "Reliquia Familiar", "Odre de Vino Amargo"],
    features: { 3: "Senda del Maestro de Batalla" } as Record<number, string>,
    asiChoices: [] as Array<{ level: number; type: 'asi' | 'feat'; details: string }>,
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    restHistory: [] as Array<{ type: 'short' | 'long'; date: string; effects: string[] }>
  });

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<'combate' | 'hechizos' | 'inventario' | 'hitos' | 'descanso' | 'trasfondo'>('combate');
  const [dice, setDice] = useState<{ isRolling: boolean; result: number | null; title: string; roll: number; mod: number; total: number } | null>(null);
  const [selHito, setSelHito] = useState<number | null>(null);
  const [showASI, setShowASI] = useState<number | null>(null);
  const [selectedSpellFilter, setSelectedSpellFilter] = useState<string>("");

  // Formularios
  const [itemText, setItemText] = useState("");
  const [wpnText, setWpnText] = useState({ name: '', bonus: '', dmg: '' });
  const [splText, setSplText] = useState({ name: '', level: 1, school: '', range: '', damage: '' });

  const profBonus = useMemo(() => Math.ceil(char.level / 4) + 1, [char.level]);

  // Calcular CA real basada en armadura
  const calculatedAC = useMemo(() => {
    const armor = ARMORS[char.armor.equipped];
    const dexMod = calcMod(char.stats.DEX);
    
    let baseAC = armor.baseAC;
    
    if (armor.type === 'light') {
      baseAC = armor.baseAC + dexMod;
    } else if (armor.type === 'medium') {
      const maxDex = armor.maxDex ?? 2;
      baseAC = armor.baseAC + Math.min(dexMod, maxDex);
    }
    // Heavy armor ignora DEX completamente
    
    const shieldBonus = SHIELDS[char.armor.shield].acBonus;
    
    return baseAC + shieldBonus;
  }, [char.armor, char.stats.DEX]);

  // Calcular CD de Salvación de Conjuros
  const spellSaveDC = useMemo(() => {
    const classData = CLASSES[char.charClass];
    if (!classData?.spellcasting) return null;
    
    const spellcastingAbility: Ability = classData.primaryAbility;
    return 8 + profBonus + calcMod(char.stats[spellcastingAbility]);
  }, [char.charClass, char.stats, profBonus]);

  // Calcular Modificador de Ataque de Conjuros
  const spellAttackMod = useMemo(() => {
    const classData = CLASSES[char.charClass];
    if (!classData?.spellcasting) return null;
    
    const spellcastingAbility: Ability = classData.primaryAbility;
    return profBonus + calcMod(char.stats[spellcastingAbility]);
  }, [char.charClass, char.stats, profBonus]);

  // Obtener ranuras de conjuro máximas por nivel
  const maxSpellSlots = useMemo(() => {
    const classData = CLASSES[char.charClass];
    if (!classData?.spellcasting) return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    return SPELL_SLOT_TABLE[char.level] || [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }, [char.level, char.charClass]);

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

  // Actualizar dados de golpe máximos al cambiar nivel
  useEffect(() => {
    setChar(prev => ({
      ...prev,
      hitDice: { ...prev.hitDice, max: prev.level, type: `d${CLASSES[prev.charClass].hitDiceType}` }
    }));
  }, [char.level, char.charClass]);

  // Inicializar slots de conjuro al cambiar nivel o clase
  useEffect(() => {
    const newMax = maxSpellSlots;
    setChar(prev => ({
      ...prev,
      spellSlots: { used: [...newMax], max: [...newMax] }
    }));
  }, [char.level, char.charClass]);

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
      if (onRollDice) {
        onRollDice(`d20${modifier >= 0 ? `+${modifier}` : modifier}`, modifier);
      }
    }, 450);
  };

  const rollHitDie = () => {
    const dieType = parseInt(char.hitDice.type.replace('d', ''));
    const roll = Math.floor(Math.random() * dieType) + 1;
    const conMod = calcMod(char.stats.CON);
    const healed = Math.max(1, roll + conMod);
    
    setChar(prev => ({
      ...prev,
      hp: { ...prev.hp, curr: Math.min(prev.hp.max, prev.hp.curr + healed) },
      hitDice: { ...prev.hitDice, current: Math.max(0, prev.hitDice.current - 1) }
    }));
    
    return { roll, conMod, healed };
  };

  const takeShortRest = () => {
    const effects: string[] = [];
    const hitDiceSpent: number[] = [];
    
    // Permitir gastar dados de golpe
    if (char.hitDice.current > 0) {
      const result = rollHitDie();
      effects.push(`Gastó 1 ${char.hitDice.type}: ${result.roll} + ${result.conMod} = ${result.healed} PS recuperados`);
      hitDiceSpent.push(result.healed);
    }
    
    // Resetear habilidades de descanso corto (simulado)
    effects.push('Habilidades de descanso corto restauradas');
    
    setChar(prev => ({
      ...prev,
      restHistory: [...prev.restHistory, { type: 'short', date: new Date().toLocaleString(), effects }]
    }));
    
    alert(`Descanso Corto Completado\n\n${effects.join('\n')}`);
  };

  const takeLongRest = () => {
    const effects: string[] = [];
    
    // Curar toda la vida
    const healed = char.hp.max - char.hp.curr;
    effects.push(`Recuperó ${healed} puntos de vida (total: ${char.hp.max})`);
    
    // Recuperar la mitad de los dados de golpe
    const halfMaxHitDice = Math.ceil(char.hitDice.max / 2);
    const recoveredHitDice = Math.min(halfMaxHitDice, char.hitDice.max - char.hitDice.current);
    effects.push(`Recuperó ${recoveredHitDice} dados de golpe (${char.hitDice.type})`);
    
    // Restaurar todos los slots de conjuro
    if (char.spellSlots.max.some(s => s > 0)) {
      effects.push('Todos los espacios de conjuro restaurados');
    }
    
    // Resetear habilidades diarias
    effects.push('Habilidades diarias restauradas (Furia, Acción Súbita, etc.)');
    
    setChar(prev => ({
      ...prev,
      hp: { ...prev.hp, curr: prev.hp.max, temp: 0 },
      hitDice: { ...prev.hitDice, current: Math.min(prev.hitDice.max, prev.hitDice.current + Math.ceil(prev.hitDice.max / 2)) },
      spellSlots: { used: [...prev.spellSlots.max], max: [...prev.spellSlots.max] },
      restHistory: [...prev.restHistory, { type: 'long', date: new Date().toLocaleString(), effects }]
    }));
    
    alert(`Descanso Largo Completado\n\n${effects.join('\n')}`);
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

  const applyASI = (level: number, type: 'asi' | 'feat', details: string) => {
    if (type === 'asi') {
      const [stat1, stat2] = details.split(',').map(s => s.trim());
      if (stat2) {
        setChar(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            [stat1 as Ability]: Math.min(20, prev.stats[stat1 as Ability] + 1),
            [stat2 as Ability]: Math.min(20, prev.stats[stat2 as Ability] + 1)
          }
        }));
      } else {
        setChar(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            [stat1 as Ability]: Math.min(20, prev.stats[stat1 as Ability] + 2)
          }
        }));
      }
    }
    
    setChar(prev => ({
      ...prev,
      asiChoices: [...prev.asiChoices, { level, type, details }]
    }));
    setShowASI(null);
  };

  const addSpellFromDatabase = (spellName: string) => {
    const classSpells = SPELLS_BY_CLASS[char.charClass] || [];
    if (!classSpells.includes(spellName)) return;
    
    const newSpell = {
      id: Date.now().toString(),
      name: spellName,
      level: Math.floor(Math.random() * Math.min(char.level, 9)) + 1,
      school: ['Evocación', 'Abjuración', 'Nigromancia', 'Encantamiento'][Math.floor(Math.random() * 4)],
      components: 'V,S',
      duration: 'Instantánea',
      range: '60 ft',
      damage: 'Variable'
    };
    
    setChar(prev => ({
      ...prev,
      spells: [...prev.spells, newSpell]
    }));
  };

  const useSpellSlot = (slotLevel: number) => {
    if (char.spellSlots.used[slotLevel] < char.spellSlots.max[slotLevel]) {
      setChar(prev => ({
        ...prev,
        spellSlots: {
          ...prev.spellSlots,
          used: prev.spellSlots.used.map((used, idx) => idx === slotLevel ? used + 1 : used)
        }
      }));
    }
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
              <div className="bg-[#120f0e] border border-amber-900/20 rounded-xl p-2.5 text-center shadow-lg relative">
                <span className="text-[8px] text-stone-500 uppercase tracking-widest font-sans block mb-0.5">Armor Class</span>
                <span className="text-2xl font-black text-stone-200">{calculatedAC}</span>
                <div className="text-[7px] text-stone-600 mt-0.5">
                  {ARMORS[char.armor.equipped].name} {char.armor.shield !== 'none' && `+ ${SHIELDS[char.armor.shield].name}`}
                </div>
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
                <span className="text-2xl font-black text-stone-200">{RACES[char.race].speed} ft</span>
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
                {(['combate', 'hechizos', 'inventario', 'hitos', 'descanso', 'trasfondo'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${tab === t ? 'bg-amber-950/30 border border-amber-500/20 text-amber-400' : 'text-stone-500 hover:text-stone-300'}`}
                  >
                    {t === 'combate' ? 'Ataques' : t === 'hechizos' ? 'Hechizos' : t === 'inventario' ? 'Inventario' : t === 'descanso' ? 'Descanso' : t === 'trasfondo' ? 'Trasfondo' : 'Hitos'}
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

                {/* TRABAJO: HECHIZOS - MOTOR COMPLETO */}
                {tab === 'hechizos' && (
                  <div className="space-y-2">
                    {/* Stats de conjuro */}
                    {spellSaveDC && (
                      <div className="grid grid-cols-2 gap-1 text-[9px] bg-[#070606] p-2 rounded border border-stone-850">
                        <div><strong className="text-amber-500">CD Salvación:</strong> {spellSaveDC}</div>
                        <div><strong className="text-amber-500">Ataque Conjuro:</strong> +{spellAttackMod}</div>
                      </div>
                    )}
                    
                    {/* Ranuras de conjuro */}
                    {CLASSES[char.charClass]?.spellcasting && (
                      <div className="space-y-1">
                        <span className="text-[8px] text-stone-500 uppercase">Espacios de Conjuro</span>
                        <div className="grid grid-cols-9 gap-0.5">
                          {[1,2,3,4,5,6,7,8,9].map(lvl => (
                            <div key={lvl} className="text-center">
                              <div className="text-[7px] text-stone-600">{lvl}</div>
                              <div className="flex flex-col gap-0.5">
                                {Array.from({ length: Math.min(4, char.spellSlots.max[lvl] || 0) }).map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => useSpellSlot(lvl)}
                                    disabled={char.spellSlots.used[lvl] >= char.spellSlots.max[lvl]}
                                    className={`w-4 h-4 rounded border text-[6px] ${
                                      char.spellSlots.used[lvl] > idx 
                                        ? 'bg-amber-900/50 border-amber-700 text-amber-300' 
                                        : 'bg-[#070606] border-stone-700 text-stone-600 hover:border-amber-500/50'
                                    }`}
                                  >
                                    ●
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Lista de hechizos conocidos */}
                    <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
                      {char.spells.map(s => (
                        <div key={s.id} className="bg-[#070606] p-2 rounded border border-stone-850 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-stone-200 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-500" /> {s.name}</span>
                            <p className="text-[9px] text-stone-500">Nivel {s.level} • {s.school} • {s.range}</p>
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

                    {/* Selector de base de datos de hechizos */}
                    {CLASSES[char.charClass]?.spellcasting && (
                      <div className="border-t border-stone-850 pt-2">
                        <span className="text-[8px] text-stone-500 block mb-1">Añadir desde base de datos</span>
                        <select
                          onChange={(e) => { if (e.target.value) addSpellFromDatabase(e.target.value); e.target.value = ''; }}
                          className="w-full bg-[#070606] border border-stone-800 rounded p-1 text-xs text-stone-300 focus:outline-none"
                        >
                          <option value="">Seleccionar hechizo...</option>
                          {(SPELLS_BY_CLASS[char.charClass] || []).sort().map(spell => (
                            <option key={spell} value={spell}>{spell}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* TRABAJO: INVENTARIO - CON SELECTOR DE ARMADURA */}
                {tab === 'inventario' && (
                  <div className="space-y-2">
                    {/* Selector de Armadura */}
                    <div className="bg-[#070606] p-2 rounded border border-stone-850">
                      <span className="text-[9px] text-amber-500 uppercase font-bold block mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Armadura Equipada
                      </span>
                      <select
                        value={char.armor.equipped}
                        onChange={(e) => setChar({ ...char, armor: { ...char.armor, equipped: e.target.value as keyof typeof ARMORS } })}
                        className="w-full bg-[#120f0e] border border-stone-800 rounded p-1 text-xs text-stone-300 focus:outline-none mb-1"
                      >
                        {Object.entries(ARMORS).map(([key, armor]) => (
                          <option key={key} value={key}>
                            {armor.name} (CA Base: {armor.baseAC}, Tipo: {armor.type})
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={char.armor.shield}
                        onChange={(e) => setChar({ ...char, armor: { ...char.armor, shield: e.target.value as keyof typeof SHIELDS } })}
                        className="w-full bg-[#120f0e] border border-stone-800 rounded p-1 text-xs text-stone-300 focus:outline-none"
                      >
                        {Object.entries(SHIELDS).map(([key, shield]) => (
                          <option key={key} value={key}>
                            {shield.name} (+{shield.acBonus} CA)
                          </option>
                        ))}
                      </select>
                      
                      <div className="mt-1 text-[8px] text-stone-500">
                        CA Total: <strong className="text-amber-400">{calculatedAC}</strong> 
                        {ARMORS[char.armor.equipped].stealthDisadv && <span className="text-red-400 ml-1">⚠ Desventaja en Sigilo</span>}
                        {ARMORS[char.armor.equipped].strReq && char.stats.STR < ARMORS[char.armor.equipped].strReq! && (
                          <span className="text-red-400 ml-1">⚠ Requiere FUE {ARMORS[char.armor.equipped].strReq}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Lista de inventario */}
                    <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
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

                {/* TRABAJO: DESCANSOS */}
                {tab === 'descanso' && (
                  <div className="space-y-2">
                    {/* Dados de Golpe */}
                    <div className="bg-[#070606] p-2 rounded border border-stone-850">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-amber-500 uppercase font-bold">Dados de Golpe</span>
                        <span className="text-xs text-stone-400">{char.hitDice.current}/{char.hitDice.max} {char.hitDice.type}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {Array.from({ length: char.hitDice.max }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-5 h-5 rounded border flex items-center justify-center text-[8px] ${
                              idx < char.hitDice.current
                                ? 'bg-emerald-900/50 border-emerald-700 text-emerald-400'
                                : 'bg-[#120f0e] border-stone-700 text-stone-600'
                            }`}
                          >
                            ●
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Botones de Descanso */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={takeShortRest}
                        className="p-2 bg-amber-950/30 border border-amber-500/20 text-amber-400 rounded text-xs font-sans hover:bg-amber-900/40 transition-all flex flex-col items-center gap-1"
                      >
                        <Hourglass className="w-4 h-4" />
                        <span>Descanso Corto</span>
                        <span className="text-[7px] text-stone-500">Gasta 1 Dado de Golpe</span>
                      </button>
                      
                      <button
                        onClick={takeLongRest}
                        className="p-2 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded text-xs font-sans hover:bg-emerald-900/40 transition-all flex flex-col items-center gap-1"
                      >
                        <Bed className="w-4 h-4" />
                        <span>Descanso Largo</span>
                        <span className="text-[7px] text-stone-500">Recupera todo</span>
                      </button>
                    </div>
                    
                    {/* Historial de descansos */}
                    {char.restHistory.length > 0 && (
                      <div className="max-h-[60px] overflow-y-auto text-[8px] text-stone-500">
                        <span className="text-[7px] text-stone-600 uppercase block mb-0.5">Historial</span>
                        {char.restHistory.slice(-3).map((rest, idx) => (
                          <div key={idx} className="border-l border-stone-700 pl-1.5 py-0.5">
                            <strong className={rest.type === 'long' ? 'text-emerald-500' : 'text-amber-500'}>
                              {rest.type === 'long' ? 'Largo' : 'Corto'}
                            </strong> - {rest.date.split(',')[0]}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TRABAJO: TRASFONDO Y NARRATIVA */}
                {tab === 'trasfondo' && (
                  <div className="space-y-2">
                    {/* Selector de Trasfondo */}
                    <div className="bg-[#070606] p-2 rounded border border-stone-850">
                      <span className="text-[9px] text-amber-500 uppercase font-bold block mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Trasfondo
                      </span>
                      <select
                        value={char.background}
                        onChange={(e) => setChar({ ...char, background: e.target.value })}
                        className="w-full bg-[#120f0e] border border-stone-800 rounded p-1 text-xs text-stone-300 focus:outline-none mb-1"
                      >
                        {Object.entries(BACKGROUNDS).map(([key, bg]) => (
                          <option key={key} value={key}>{bg.name}</option>
                        ))}
                      </select>
                      
                      {BACKGROUNDS[char.background] && (
                        <div className="text-[8px] text-stone-500 space-y-0.5 mt-1">
                          <div><strong className="text-stone-400">Habilidades:</strong> {BACKGROUNDS[char.background].skills.join(', ')}</div>
                          {BACKGROUNDS[char.background].languages.length > 0 && (
                            <div><strong className="text-stone-400">Idiomas:</strong> {BACKGROUNDS[char.background].languages.join(', ')}</div>
                          )}
                          <div><strong className="text-stone-400">Equipo:</strong> {BACKGROUNDS[char.background].equipment.slice(0, 3).join(', ')}...</div>
                          <div className="text-amber-500/80 italic mt-1">{BACKGROUNDS[char.background].feature}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Campos Narrativos Góticos */}
                    <div className="space-y-1">
                      <textarea
                        placeholder="Rasgos de Personalidad..."
                        value={char.personalityTraits}
                        onChange={(e) => setChar({ ...char, personalityTraits: e.target.value })}
                        className="w-full bg-[#070606] border border-stone-800 rounded p-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500/30 resize-none h-12"
                      />
                      <textarea
                        placeholder="Ideales..."
                        value={char.ideals}
                        onChange={(e) => setChar({ ...char, ideals: e.target.value })}
                        className="w-full bg-[#070606] border border-stone-800 rounded p-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500/30 resize-none h-10"
                      />
                      <textarea
                        placeholder="Vínculos..."
                        value={char.bonds}
                        onChange={(e) => setChar({ ...char, bonds: e.target.value })}
                        className="w-full bg-[#070606] border border-stone-800 rounded p-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500/30 resize-none h-10"
                      />
                      <textarea
                        placeholder="Defectos..."
                        value={char.flaws}
                        onChange={(e) => setChar({ ...char, flaws: e.target.value })}
                        className="w-full bg-[#070606] border border-stone-800 rounded p-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500/30 resize-none h-10"
                      />
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
