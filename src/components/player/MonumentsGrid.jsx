export default function MonumentsGrid({ playerMonuments, onBuildMonument, canBuild, pendingWorkers, allPlayers, currentPlayerIndex, monuments }) {
  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Monuments</h3>
      <div className="grid grid-cols-2 gap-2">
        {playerMonuments.map(function (m) {
          const monument = monuments.find(mon => mon.id === m.id);
          const isClickable = canBuild && !m.completed && (pendingWorkers >= 1 || m.progress > 0);

          // Vérifier si quelqu'un d'autre a terminé ce monument en premier
          let someoneElseCompletedFirst = false;
          if (allPlayers) {
            for (let i = 0; i < allPlayers.length; i++) {
              if (i !== currentPlayerIndex) {
                for (let j = 0; j < allPlayers[i].monuments.length; j++) {
                  const otherMonument = allPlayers[i].monuments[j];
                  if (otherMonument.id === m.id && otherMonument.completed && otherMonument.firstToComplete) {
                    someoneElseCompletedFirst = true;
                    break;
                  }
                }
              }
              if (someoneElseCompletedFirst) break;
            }
          }

          return (
            <div
              key={m.id}
              className={'border-2 rounded-lg p-2 ' + (
                m.completed ? 'bg-purple-100 border-purple-600' : 'bg-gray-50 border-gray-300'
              ) + (isClickable ? ' hover:bg-purple-100 hover:border-purple-500 cursor-pointer' : '')}
              onClick={isClickable ? () => onBuildMonument(m.id) : undefined}
            >
              <div className='flex justify-between'>
                <div>
                  <div className="text-xs font-bold mb-1">{monument.name}</div>
                  <div className="flex gap-0.5 flex-wrap mb-1">
                    {Array(monument.workers).fill(0).map(function (_, j) {
                      return (
                        <div
                          key={j}
                          className={'w-3.5 h-3.5 border border-gray-400 rounded ' + (
                            j < m.progress ? 'bg-purple-600' : 'bg-white'
                          )}
                        />
                      );
                    })}
                  </div>
                  {monument.effect && (
                    <div className="text-xs text-gray-600 italic mb-1">
                      {monument.effect}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 text-xs font-semibold">
                  {/* Points maximum (première case à cocher) */}
                  <div className="flex items-center gap-0.5">
                    <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                      m.completed && m.firstToComplete ? 'bg-green-600 border-green-700' :
                        someoneElseCompletedFirst ? 'bg-gray-300 border-gray-400' :
                          'bg-white border-gray-400'
                    )}>
                      {m.completed && m.firstToComplete ? (
                        <span className="text-white text-xs font-bold">{monument.points[0]}</span>
                      ) : someoneElseCompletedFirst ? (
                        <span className="text-gray-600 text-xs font-bold">✗</span>
                      ) : (
                        <span className="text-gray-600 text-xs font-bold">{monument.points[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Points secondaires */}
                  <div className="flex items-center gap-0.5">
                    <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                      m.completed && !m.firstToComplete ? 'bg-purple-600 border-purple-700' :
                        'bg-white border-gray-400'
                    )}>
                      {m.completed && !m.firstToComplete ? (
                        <span className="text-white text-xs font-bold">{monument.points[1]}</span>
                      ) : (
                        <span className="text-gray-600 text-xs font-bold">{monument.points[1]}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
