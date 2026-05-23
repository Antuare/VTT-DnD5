import { useState } from 'react';
import { Dice6, Sword, Shield, Scroll, Map as MapIcon, Users, Settings } from 'lucide-react';

function App() {
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = (sides: number) => {
    setIsRolling(true);
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      setDiceResult(result);
      setIsRolling(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment-100 via-parchment-200 to-parchment-300">
      {/* Header */}
      <header className="vtt-header">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-cinzel font-bold text-dnd-gold-400 tracking-wider">
            VTT-DnD5
          </h1>
          <nav className="hidden md:flex items-center gap-2 ml-8">
            <button className="btn-dnd-secondary px-4 py-2 text-sm flex items-center gap-2">
              <MapIcon size={16} />
              Mapa
            </button>
            <button className="btn-dnd-secondary px-4 py-2 text-sm flex items-center gap-2">
              <Users size={16} />
              Personajes
            </button>
            <button className="btn-dnd-magic px-4 py-2 text-sm flex items-center gap-2">
              <Scroll size={16} />
              Hechizos
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-dnd-gold-800/20 rounded-lg transition-colors">
            <Settings size={20} className="text-parchment-300" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dnd-red-600 to-dnd-red-800 border-2 border-dnd-gold-400 flex items-center justify-center">
            <Sword size={20} className="text-parchment-100" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {/* Dice Roller Section */}
        <section className="panel-fancy p-6 mb-6">
          <h2 className="text-xl font-cinzel text-dnd-gold-700 mb-4 flex items-center gap-2">
            <Dice6 size={24} />
            Tirada de Dados
          </h2>
          
          <div className="dice-container mb-4">
            {[4, 6, 8, 10, 12, 20].map((sides) => (
              <button
                key={sides}
                onClick={() => rollDice(sides)}
                disabled={isRolling}
                className={`die ${isRolling ? 'die-rolling' : ''}`}
              >
                d{sides}
              </button>
            ))}
          </div>

          {diceResult !== null && (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-dnd-gold-500 to-dnd-gold-700 border-4 border-dnd-gold-300 shadow-glow">
                <span className="font-cinzel font-bold text-4xl text-white">
                  {diceResult}
                </span>
              </div>
              <p className="mt-2 font-cormorant text-lg text-dnd-gold-800">
                ¡Resultado obtenido!
              </p>
            </div>
          )}
        </section>

        {/* Character Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Character Card */}
          <div className="card-character">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-dnd-blue-600 to-dnd-blue-800 border-4 border-dnd-gold-400 flex items-center justify-center">
                <Shield size={32} className="text-parchment-100" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg text-dnd-gold-800">Valorian Steelheart</h3>
                <p className="font-cormorant text-parchment-700">Paladín Nivel 5</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map((stat, i) => (
                <div key={stat} className="text-center">
                  <div className="stat-badge">{10 + i}</div>
                  <p className="text-xs font-cinzel text-parchment-600 mt-1">{stat}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm font-cormorant mb-1">
                  <span>Puntos de Vida</span>
                  <span>45/52</span>
                </div>
                <div className="progress-bar-fantasy">
                  <div className="fill" style={{ width: '86%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-cormorant mb-1">
                  <span>Espacios de Hechizo</span>
                  <span>4/5</span>
                </div>
                <div className="progress-bar-fantasy">
                  <div className="fill warning" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Initiative Tracker Mini */}
          <div className="card-character">
            <h3 className="font-cinzel text-lg text-dnd-gold-800 mb-4">Iniciativa</h3>
            <div className="space-y-2">
              {[
                { name: 'Valorian', init: 18, active: true },
                { name: 'Goblin Jefe', init: 15, active: false },
                { name: 'Elara', init: 12, active: false },
                { name: 'Goblin #1', init: 8, active: false },
              ].map((slot, i) => (
                <div
                  key={i}
                  className={`initiative-slot ${slot.active ? 'active' : ''}`}
                >
                  <div className="initiative-number">{slot.init}</div>
                  <span className="font-cormorant flex-1">{slot.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-character">
            <h3 className="font-cinzel text-lg text-dnd-gold-800 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-dnd text-sm py-2">Atacar</button>
              <button className="btn-dnd-secondary text-sm py-2">Defender</button>
              <button className="btn-dnd-magic text-sm py-2">Hechizo</button>
              <button className="btn-dnd-secondary text-sm py-2">Objeto</button>
              <button className="btn-dnd text-sm py-2 col-span-2">Ayuda</button>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="panel-fancy p-6">
          <h2 className="text-xl font-cinzel text-dnd-gold-700 mb-4">Mapa de Batalla</h2>
          <div className="map-container h-96 grid-pattern grid-2 rounded-lg border-2 border-dnd-gold-400 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapIcon size={64} className="mx-auto text-parchment-400 mb-4" />
                <p className="font-cormorant text-xl text-parchment-600">
                  Arrastra una imagen de mapa aquí
                </p>
                <p className="font-cormorant text-parchment-500 mt-2">
                  o haz clic para seleccionar un archivo
                </p>
              </div>
            </div>
            
            {/* Sample Tokens */}
            <div className="token selected" style={{ top: '30%', left: '40%' }}>
              <Shield size={24} className="text-parchment-100" />
            </div>
            <div className="token enemy" style={{ top: '50%', left: '60%' }}>
              <Sword size={24} className="text-parchment-100" />
            </div>
            <div className="token ally" style={{ top: '40%', left: '30%' }}>
              <Scroll size={24} className="text-parchment-100" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/90 border-t-2 border-dnd-gold-600 py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <span className="font-cormorant text-parchment-400">
            VTT-DnD5 v1.0.0 - "Basura de teufel hecha por IA"
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-parchment-300">
              <div className="w-2 h-2 rounded-full bg-dnd-green-500 animate-pulse"></div>
              Conectado
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
