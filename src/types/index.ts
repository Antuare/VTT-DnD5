// Tipos para el VTT de D&D 5e

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  race: string;
  background: string;
  alignment: string;
  stats: AbilityScores;
  hitPoints: {
    current: number;
    maximum: number;
    temp?: number;
  };
  armorClass: number;
  speed: number;
  initiative: number;
  proficiencies: string[];
  skills: SkillProficiencies;
  spells?: SpellSlot[];
  inventory: InventoryItem[];
  avatar?: string;
  tokens: Token[];
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SkillProficiencies {
  acrobatics: number;
  animalHandling: number;
  arcana: number;
  athletics: number;
  deception: number;
  history: number;
  insight: number;
  intimidation: number;
  investigation: number;
  medicine: number;
  nature: number;
  perception: number;
  performance: number;
  persuasion: number;
  religion: number;
  sleightOfHand: number;
  stealth: number;
  survival: number;
}

export interface SpellSlot {
  level: number;
  used: number;
  total: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'misc';
  quantity: number;
  weight: number;
  description?: string;
  properties?: string[];
}

export interface Token {
  id: string;
  characterId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  hidden: boolean;
  selected: boolean;
  type: 'player' | 'enemy' | 'ally' | 'npc';
}

export interface Map {
  id: string;
  name: string;
  imageUrl: string;
  gridSize: number;
  width: number;
  height: number;
  tokens: Token[];
  lighting?: LightingConfig;
  fogOfWar?: boolean;
}

export interface LightingConfig {
  enabled: boolean;
  globalBrightness: number;
  tokens: TokenLighting[];
}

export interface TokenLighting {
  tokenId: string;
  dimRadius: number;
  brightRadius: number;
  angle?: number;
}

export interface InitiativeEntry {
  characterId: string;
  name: string;
  initiative: number;
  dex: number;
  turn: number;
  conditions: Condition[];
  isActive: boolean;
}

export interface Condition {
  name: string;
  duration?: string;
  effects: string[];
}

export interface DiceRoll {
  formula: string;
  result: number;
  individual Rolls: number[];
  modifiers: number;
  rollType: 'attack' | 'damage' | 'ability' | 'save' | 'skill' | 'initiative';
  characterId?: string;
  targetId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'chat' | 'roll' | 'system' | 'emote';
  rolls?: DiceRoll[];
  whisperTo?: string[];
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isGM: boolean;
  characters: string[]; // Character IDs
}

export interface GameState {
  map: Map | null;
  initiative: InitiativeEntry[];
  currentTurn: number;
  round: number;
  isCombat: boolean;
  chatHistory: ChatMessage[];
  users: User[];
  settings: GameSettings;
}

export interface GameSettings {
  gridVisible: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showTokenNames: 'always' | 'hover' | 'never';
  enableFogOfWar: boolean;
  enableDynamicLighting: boolean;
  allowPlayersToDraw: boolean;
}
