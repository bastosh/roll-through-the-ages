import { MONUMENTS } from '../constants/gameData';

export default function BuildPhase({ player, pendingWorkers, showBuildModal, setShowBuildModal, handleBuildCity, handleBuildMonument, handleSkipBuild }) {
  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50 overflow-y-auto">
      {!showBuildModal && (
        <button
          onClick={() => setShowBuildModal(true)}
          className="fixed top-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-700 shadow-lg z-50"
        >
          Afficher la construction
        </button>
      )}

      {showBuildModal && (
        <div className="bg-white rounded-xl p-8 max-w-4xl w-full my-8 relative">
          <button
            onClick={() => setShowBuildModal(false)}
            className="absolute top-4 right-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Masquer
          </button>

          <h2 className="text-2xl font-bold mb-4 text-center">Construire</h2>

          <p className="text-center mb-6">
            Ouvriers disponibles: <span className="font-bold text-2xl">{pendingWorkers}</span>
            <span className="text-sm text-gray-500 block mt-1">
              Cliquez pour ajouter un ouvrier, cliquez à nouveau pour retirer
            </span>
          </p>

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Cités</h3>
            <div className="grid grid-cols-2 gap-4">
              {player.cities.map(function(city, i) {
                let buttonClass = 'p-4 rounded-lg text-left ';
                if (city.built) {
                  buttonClass += 'bg-green-200 text-green-800';
                } else if (pendingWorkers >= 1 || city.progress > 0) {
                  buttonClass += 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-400 cursor-pointer';
                } else {
                  buttonClass += 'bg-gray-200 text-gray-500 cursor-not-allowed';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleBuildCity(i)}
                    disabled={city.built || (pendingWorkers < 1 && city.progress === 0)}
                    className={buttonClass}
                  >
                    <div className="font-bold mb-2">Cité {i + 4}</div>
                    <div className="flex gap-1 flex-wrap">
                      {Array(city.requiredWorkers).fill(0).map(function(_, j) {
                        return (
                          <div
                            key={j}
                            className={'w-5 h-5 border-2 border-gray-400 rounded ' + (
                              j < city.progress ? 'bg-blue-600' : 'bg-white'
                            )}
                          />
                        );
                      })}
                    </div>
                    <div className="text-sm mt-1">
                      {city.built ? '✓ Construite' : city.progress + '/' + city.requiredWorkers + ' ouvriers'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Monuments</h3>
            <div className="grid grid-cols-2 gap-4">
              {player.monuments.map(function(m) {
                let monument = null;
                for (let i = 0; i < MONUMENTS.length; i++) {
                  if (MONUMENTS[i].id === m.id) {
                    monument = MONUMENTS[i];
                    break;
                  }
                }

                let buttonClass = 'p-4 rounded-lg text-left ';
                if (m.completed) {
                  buttonClass += 'bg-green-200 text-green-800';
                } else if (pendingWorkers >= 1 || m.progress > 0) {
                  buttonClass += 'bg-purple-100 hover:bg-purple-200 border-2 border-purple-400 cursor-pointer';
                } else {
                  buttonClass += 'bg-gray-200 text-gray-500 cursor-not-allowed';
                }

                return (
                  <button
                    key={m.id}
                    onClick={() => handleBuildMonument(m.id)}
                    disabled={m.completed || (pendingWorkers < 1 && m.progress === 0)}
                    className={buttonClass}
                  >
                    <div className="font-bold mb-2">{monument.name}</div>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {Array(monument.workers).fill(0).map(function(_, j) {
                        return (
                          <div
                            key={j}
                            className={'w-4 h-4 border-2 border-gray-400 rounded ' + (
                              j < m.progress ? 'bg-purple-600' : 'bg-white'
                            )}
                          />
                        );
                      })}
                    </div>
                    <div className="text-sm">
                      {m.completed
                        ? '✓ Complété (' + (m.firstToComplete ? monument.points[0] : monument.points[1]) + ' pts)'
                        : m.progress + '/' + monument.workers + ' ouvriers'
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSkipBuild}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700"
          >
            Terminer la construction
          </button>
        </div>
      )}
    </div>
  );
}
