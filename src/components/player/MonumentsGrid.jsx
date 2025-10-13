export default function MonumentsGrid({ playerMonuments, onBuildMonument, onUnbuildMonument, canBuild, pendingWorkers, allPlayers, currentPlayerIndex, monuments }) {
  return (
    <div className="flex-shrink-0">
      <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-dark-text">Monuments</h3>
      <div className="grid grid-cols-2 gap-2">
        {playerMonuments.map(function (m) {
          const monument = monuments.find(mon => mon.id === m.id);
          const canAddWorker = canBuild && !m.completed && pendingWorkers >= 1;
          const canRemoveWorker = canBuild && !m.completed && m.progress > 0;

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

          const handleClick = (e) => {
            // Clic droit pour retirer un ouvrier
            if (e.button === 2 || e.ctrlKey || e.metaKey) {
              e.preventDefault();
              if (canRemoveWorker && onUnbuildMonument) {
                onUnbuildMonument(m.id);
              }
            } else {
              // Clic gauche pour ajouter un ouvrier
              if (canAddWorker && onBuildMonument) {
                onBuildMonument(m.id);
              }
            }
          };

          const handleContextMenu = (e) => {
            if (canRemoveWorker) {
              e.preventDefault();
              handleClick(e);
            }
          };

          return (
            <div
              key={m.id}
              className={'border-2 rounded-lg p-2 transition-colors ' + (
                m.completed ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-600 dark:border-purple-700' : 'bg-gray-50 dark:bg-dark-elevated border-gray-300 dark:border-dark-border'
              ) + ((canAddWorker || canRemoveWorker) ? ' hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-500 dark:hover:border-purple-600 cursor-pointer' : '')}
              onClick={(canAddWorker || canRemoveWorker) ? handleClick : undefined}
              onContextMenu={canRemoveWorker ? handleContextMenu : undefined}
            >
              <div className='flex justify-between'>
                <div>
                  <div className="text-xs font-bold mb-1 dark:text-dark-text">{monument.name} ({monument.workers})</div>
                  <div className="flex gap-1 flex-wrap">
                    {Array(monument.workers).fill(0).map(function (_, j) {
                      return (
                        <div
                          key={j}
                          className={'w-4 h-4 border border-gray-400 dark:border-dark-border rounded transition-colors ' + (
                            j < m.progress ? 'bg-purple-600 dark:bg-purple-700' : 'bg-white dark:bg-dark-surface'
                          )}
                        />
                      );
                    })}
                  </div>
                  {monument.effect && (
                    <div className="text-xs text-gray-600 dark:text-dark-text-muted italic mt-1">
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
