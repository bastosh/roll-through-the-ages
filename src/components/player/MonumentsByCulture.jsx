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

      // Compter les monuments en tenant compte des groupes (ex: Stonehenge 1 ET 2 doivent être complétés pour compter comme 1)
      let monumentCount = 0;
      const processedGroups = new Set();

      for (let j = 0; j < completedMonuments.length; j++) {
        const monument = monuments.find(mon => mon.id === completedMonuments[j].id);
        if (monument) {
          // Si le monument fait partie d'un groupe
          if (monument.monumentGroup) {
            // On ne traite chaque groupe qu'une seule fois
            if (!processedGroups.has(monument.monumentGroup)) {
              processedGroups.add(monument.monumentGroup);

              // Trouver tous les monuments de ce groupe dans la culture
              const monumentsInGroup = monuments.filter(m =>
                m.monumentGroup === monument.monumentGroup && m.origin === cultureName
              );

              // Vérifier que TOUS les monuments du groupe sont complétés par le joueur
              let allGroupCompleted = true;
              for (let k = 0; k < monumentsInGroup.length; k++) {
                const found = player.monuments.find(pm =>
                  pm.id === monumentsInGroup[k].id && pm.completed
                );
                if (!found) {
                  allGroupCompleted = false;
                  break;
                }
              }

              // Compter le groupe seulement si TOUS ses monuments sont complétés
              if (allGroupCompleted) {
                monumentCount++;
              }
            }
          } else {
            // Monument normal, on compte
            monumentCount++;
          }
        }
      }

      if (monumentCount >= 2) {
        playersWithCulture.push({ playerIndex: i, count: monumentCount });
      }
    }

    // Trier par nombre de monuments complétés (descendant)
    playersWithCulture.sort((a, b) => b.count - a.count);

    return playersWithCulture;
  }

  return (
    <div className="flex-shrink-0">
      <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-dark-text">Monuments</h3>
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

          // Vérifier si un autre joueur a déjà obtenu la première ou deuxième place
          let someoneElseCompletedCultureFirst = false;
          let someoneElseCompletedCultureSecond = false;

          if (completionStatus.length > 0 && completionStatus[0].playerIndex !== currentPlayerIndex) {
            someoneElseCompletedCultureFirst = true;
          }
          if (completionStatus.length > 1 && completionStatus[1].playerIndex !== currentPlayerIndex) {
            someoneElseCompletedCultureSecond = true;
          }

          return (
            <div key={culture.name} className="border-2 rounded-lg p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700 shadow-sm transition-colors">
              {/* En-tête de la culture */}
              <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wide">{t(`cultures.${culture.name}`)}</h4>
                  <div className="flex items-center gap-1">
                    {/* Checkbox premier joueur */}
                    <div className="flex items-center gap-1">
                      <div className={'w-7 h-7 border-2 rounded flex items-center justify-center transition-colors ' + (
                        playerCultureStatus === 'first' ? 'bg-green-600 dark:bg-green-700 border-green-700 dark:border-green-800' :
                          someoneElseCompletedCultureFirst ? 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500' :
                            'bg-white dark:bg-dark-surface border-gray-400 dark:border-dark-border'
                      )}>
                        {playerCultureStatus === 'first' ? (
                          <span className="text-white text-xs font-bold">{culture.bonusFirst}</span>
                        ) : someoneElseCompletedCultureFirst ? (
                          <span className="text-gray-600 dark:text-gray-300 text-xs font-bold">✗</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 text-xs font-bold">{culture.bonusFirst}</span>
                        )}
                      </div>
                    </div>

                    {/* Checkbox second joueur */}
                    <div className="flex items-center gap-1">
                      <div className={'w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ' + (
                        playerCultureStatus === 'second' ? 'bg-purple-600 dark:bg-purple-700 border-purple-700 dark:border-purple-800' :
                          someoneElseCompletedCultureSecond ? 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500' :
                            'bg-white dark:bg-dark-surface border-gray-400 dark:border-dark-border'
                      )}>
                        {playerCultureStatus === 'second' ? (
                          <span className="text-white text-xs font-bold">{culture.bonusSecond}</span>
                        ) : someoneElseCompletedCultureSecond ? (
                          <span className="text-gray-600 dark:text-gray-300 text-xs font-bold">✗</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 text-xs font-bold">{culture.bonusSecond}</span>
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
                  // Allow removing workers even if completed (during this turn only)
                  const canRemoveWorker = canBuild && playerMonument.progress > 0;

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
                      className={'border-2 rounded p-1.5 transition-colors ' +
                        (isLastAndAlone ? 'col-start-3 ' : '') +
                        (playerMonument.completed ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-600 dark:border-purple-700' : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-dark-border') +
                        ((canAddWorker || canRemoveWorker) ? ' hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-500 dark:hover:border-purple-600 cursor-pointer' : '')}
                      onClick={(canAddWorker || canRemoveWorker) ? handleClick : undefined}
                      onContextMenu={canRemoveWorker ? handleContextMenu : undefined}
                    >
                      <div className='flex justify-between gap-1'>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="text-[11px] font-bold truncate dark:text-dark-text flex-1 min-w-0" title={monument.name}>
                              {monument.name} ({monument.workers})
                            </div>
                            {/* Effect badge for monuments with special effects */}
                            {monument.effect && (
                              <div className="flex-shrink-0" title={t(`monumentEffects.${monument.id}`)}>
                                {monument.effect === 'sphinx' ? (
                                  playerMonument.completed && allPlayers[currentPlayerIndex].sphinxPowerAvailable ? (
                                    <span className="text-xs">⚡</span>
                                  ) : playerMonument.completed ? (
                                    <span className="text-xs opacity-40">⚡</span>
                                  ) : (
                                    <span className="text-xs opacity-20">⚡</span>
                                  )
                                ) : (
                                  <span className={'text-xs ' + (playerMonument.completed ? '' : 'opacity-30')}>✨</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-0.5 flex-wrap mb-1">
                            {Array(monument.workers).fill(0).map(function (_, j) {
                              return (
                                <div
                                  key={j}
                                  className={'w-4 h-4 border border-gray-400 dark:border-dark-border rounded transition-colors ' + (
                                    j < playerMonument.progress ? 'bg-purple-600 dark:bg-purple-700' : 'bg-white dark:bg-dark-surface'
                                  )}
                                />
                              );
                            })}
                          </div>
                          {/* Effect description for monuments with special effects */}
                          {monument.effect && (
                            <div className="text-[9px] text-amber-800 dark:text-amber-300 italic leading-tight">
                              {t(`monumentEffects.${monument.id}`)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-start gap-0.5 text-xs font-semibold">
                          {/* Points maximum (première case à cocher) */}
                          <div className={'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ' + (
                            playerMonument.completed && playerMonument.firstToComplete ? 'bg-green-600 dark:bg-green-700 border-green-700 dark:border-green-800' :
                              someoneElseCompletedFirst ? 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500' :
                                'bg-white dark:bg-dark-surface border-gray-400 dark:border-dark-border'
                          )}>
                            {playerMonument.completed && playerMonument.firstToComplete ? (
                              <span className="text-white text-[10px] font-bold">{monument.points[0]}</span>
                            ) : someoneElseCompletedFirst ? (
                              <span className="text-gray-600 dark:text-gray-300 text-[10px] font-bold">✗</span>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400 text-[10px] font-bold">{monument.points[0]}</span>
                            )}
                          </div>

                          {/* Points secondaires */}
                          <div className={'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ' + (
                            playerMonument.completed && !playerMonument.firstToComplete ? 'bg-purple-600 dark:bg-purple-700 border-purple-700 dark:border-purple-800' :
                              'bg-white dark:bg-dark-surface border-gray-400 dark:border-dark-border'
                          )}>
                            {playerMonument.completed && !playerMonument.firstToComplete ? (
                              <span className="text-white text-[10px] font-bold">{monument.points[1]}</span>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400 text-[10px] font-bold">{monument.points[1]}</span>
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
