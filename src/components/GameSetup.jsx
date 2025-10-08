import { useState } from 'react';

export default function GameSetup({ onStart }) {
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(['Joueur 1']);

  function updatePlayerCount(count) {
    setPlayerCount(count);
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push(playerNames[i] || 'Joueur ' + (i + 1));
    }
    setPlayerNames(names);
  }

  function updatePlayerName(index, name) {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-amber-800">
          Roll Through the Ages
        </h1>
        <p className="text-center text-amber-600 mb-8">L'Âge du Bronze</p>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Nombre de joueurs
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(function(num) {
                return (
                  <button
                    key={num}
                    onClick={() => updatePlayerCount(num)}
                    className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                      playerCount === num
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                  >
                    {num} {num === 1 ? 'joueur' : 'joueurs'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              {playerCount === 1 ? 'Nom du joueur' : 'Noms des joueurs'}
            </label>
            {playerNames.map(function(name, i) {
              return (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(i, e.target.value)}
                  className="w-full mb-2 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  placeholder={'Joueur ' + (i + 1)}
                />
              );
            })}
          </div>

          <button
            onClick={() => onStart(playerNames.slice(0, playerCount))}
            className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-amber-700 transition cursor-pointer"
          >
            Commencer la partie
          </button>
        </div>
      </div>
    </div>
  );
}
