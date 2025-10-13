import { useTranslation } from 'react-i18next';

export default function MonumentsByCulture({
  playerMonuments,
  onBuildMonument,
  onUnbuildMonument,
  canBuild,
  pendingWorkers,
  allPlayers,
  currentPlayerIndex,
  monuments,
  cultures
}) {
  const { t } = useTranslation();

  // Grouper les monuments par culture
  const monumentsByCulture = {};

  for (let i = 0; i < monuments.length; i++) {
    const monument = monuments[i];
    const origin = monument.origin;

    if (!monumentsByCulture[origin]) {
      monumentsByCulture[origin] = [];
    }

    monumentsByCulture[origin].push(monument);
  }

  // Fonction pour vérifier qui a complété en premier/second une culture
  function getCultureCompletionStatus(cultureName) {
    const playersWithCulture = [];

    for (let i = 0; i < allPlayers.length; i++) {
      const player = allPlayers[i];
      const completedMonuments = player.monuments.filter(m => {
        const monument = monuments.find(mon => mon.id === m.id);
        return monument && monument.origin === cultureName && m.completed;
      });

      if (completedMonuments.length >= 2) {
        playersWithCulture.push({ playerIndex: i, count: completedMonuments.length });
      }
    }

    // Trier par nombre de monuments complétés (descendant)
    playersWithCulture.sort((a, b) => b.count - a.count);

    return playersWithCulture;
  }

  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Monuments</h3>
      <div className="space-y-3">
        {cultures.map(function (culture) {
          const cultureMonuments = monumentsByCulture[culture.name] || [];
          const completionStatus = getCultureCompletionStatus(culture.name);

          // Déterminer si le joueur actuel est premier ou second
          let playerCultureStatus = null;
          for (let i = 0; i < completionStatus.length; i++) {
            if (completionStatus[i].playerIndex === currentPlayerIndex) {
              playerCultureStatus = i === 0 ? 'first' : (i === 1 ? 'second' : 'other');
              break;
            }
          }

          return (
            <div key={culture.name} className="border-2 rounded-lg p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-sm">
              {/* En-tête de la culture */}
              <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide">{t(`cultures.${culture.name}`)}</h4>
                  <div className="flex items-center gap-1">
                    {/* Checkbox premier joueur */}
                    <div className="flex items-center gap-1">
                      <div className={'w-7 h-7 border-2 rounded flex items-center justify-center ' + (
                        playerCultureStatus === 'first' ? 'bg-green-600 border-green-700' : 'bg-white border-gray-400'
                      )}>
                        {playerCultureStatus === 'first' ? (
                          <span className="text-white text-xs font-bold">{culture.bonusFirst}</span>
                        ) : (
                          <span className="text-gray-600 text-xs font-bold">{culture.bonusFirst}</span>
                        )}
                      </div>
                    </div>

                    {/* Checkbox second joueur */}
                    <div className="flex items-center gap-1">
                      <div className={'w-6 h-6 border-2 rounded flex items-center justify-center ' + (
                        playerCultureStatus === 'second' ? 'bg-purple-600 border-purple-700' : 'bg-white border-gray-400'
                      )}>
                        {playerCultureStatus === 'second' ? (
                          <span className="text-white text-xs font-bold">{culture.bonusSecond}</span>
                        ) : (
                          <span className="text-gray-600 text-xs font-bold">{culture.bonusSecond}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monuments de cette culture */}
              <div className="grid grid-cols-3 gap-2">
                {cultureMonuments.map(function (monument, index) {
                  const playerMonument = playerMonuments.find(m => m.id === monument.id);
                  if (!playerMonument) return null;

                  const isLastAndAlone = index === cultureMonuments.length - 1 && cultureMonuments.length % 3 === 1;
                  const canAddWorker = canBuild && !playerMonument.completed && pendingWorkers >= 1;
                  const canRemoveWorker = canBuild && !playerMonument.completed && playerMonument.progress > 0;

                  // Vérifier si quelqu'un d'autre a terminé ce monument en premier
                  let someoneElseCompletedFirst = false;
                  if (allPlayers) {
                    for (let i = 0; i < allPlayers.length; i++) {
                      if (i !== currentPlayerIndex) {
                        for (let j = 0; j < allPlayers[i].monuments.length; j++) {
                          const otherMonument = allPlayers[i].monuments[j];
                          if (otherMonument.id === playerMonument.id && otherMonument.completed && otherMonument.firstToComplete) {
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
                        onUnbuildMonument(playerMonument.id);
                      }
                    } else {
                      // Clic gauche pour ajouter un ouvrier
                      if (canAddWorker && onBuildMonument) {
                        onBuildMonument(playerMonument.id);
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
                      key={playerMonument.id}
                      className={'border-2 rounded p-1.5 ' +
                        (isLastAndAlone ? 'col-start-3 ' : '') +
                        (playerMonument.completed ? 'bg-purple-100 border-purple-600' : 'bg-white border-gray-300') +
                        ((canAddWorker || canRemoveWorker) ? ' hover:bg-purple-100 hover:border-purple-500 cursor-pointer' : '')}
                      onClick={(canAddWorker || canRemoveWorker) ? handleClick : undefined}
                      onContextMenu={canRemoveWorker ? handleContextMenu : undefined}
                    >
                      <div className='flex justify-between gap-1'>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold mb-1 truncate" title={monument.name}>
                            {monument.name} ({monument.workers})
                          </div>
                          <div className="flex gap-0.5 flex-wrap">
                            {Array(monument.workers).fill(0).map(function (_, j) {
                              return (
                                <div
                                  key={j}
                                  className={'w-4 h-4 border border-gray-400 rounded ' + (
                                    j < playerMonument.progress ? 'bg-purple-600' : 'bg-white'
                                  )}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-start gap-0.5 text-xs font-semibold">
                          {/* Points maximum (première case à cocher) */}
                          <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                            playerMonument.completed && playerMonument.firstToComplete ? 'bg-green-600 border-green-700' :
                              someoneElseCompletedFirst ? 'bg-gray-300 border-gray-400' :
                                'bg-white border-gray-400'
                          )}>
                            {playerMonument.completed && playerMonument.firstToComplete ? (
                              <span className="text-white text-[10px] font-bold">{monument.points[0]}</span>
                            ) : someoneElseCompletedFirst ? (
                              <span className="text-gray-600 text-[10px] font-bold">✗</span>
                            ) : (
                              <span className="text-gray-600 text-[10px] font-bold">{monument.points[0]}</span>
                            )}
                          </div>

                          {/* Points secondaires */}
                          <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                            playerMonument.completed && !playerMonument.firstToComplete ? 'bg-purple-600 border-purple-700' :
                              'bg-white border-gray-400'
                          )}>
                            {playerMonument.completed && !playerMonument.firstToComplete ? (
                              <span className="text-white text-[10px] font-bold">{monument.points[1]}</span>
                            ) : (
                              <span className="text-gray-600 text-[10px] font-bold">{monument.points[1]}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
