import { useTranslation } from 'react-i18next';

export default function ProductionBuildingsList({
  playerProductions,
  onBuildProduction,
  onUnbuildProduction,
  canBuild,
  pendingWorkers,
  productions,
  citiesBuiltCount,
  developments = [],
  variantConfig = null
}) {
  const { t } = useTranslation();

  // Build a map of production buildings to developments they unlock/discount
  // For Ancient Empires Original: prerequisite system (unlock)
  // For Ancient Empires Beri: discount system (reduction)
  const buildingDevMap = {};
  const useDiscount = variantConfig && variantConfig.id === 'ancient_empires';

  if (developments && developments.length > 0) {
    for (let i = 0; i < developments.length; i++) {
      const dev = developments[i];
      const buildingKey = useDiscount ? dev.discount : dev.prerequisite;

      if (buildingKey && buildingKey !== 'none' && buildingKey !== 'metropolis') {
        if (!buildingDevMap[buildingKey]) {
          buildingDevMap[buildingKey] = [];
        }
        buildingDevMap[buildingKey].push(dev.id);
      }
    }
  }

  return (
    <div className="flex-shrink-0">
      <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-dark-text">{t('common.productionBuildings')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {productions.map(function (prod, index) {
          const playerProd = playerProductions[index];
          const isBuilt = playerProd && playerProd.built;

          // Utiliser requiredWorkers si défini (coût fixé au début de la construction),
          // sinon calculer selon le nombre de cités construites (coût dynamique)
          // ou utiliser directement si c'est un nombre (coût fixe)
          let workersCost;
          if (playerProd && playerProd.requiredWorkers !== undefined) {
            workersCost = playerProd.requiredWorkers;
          } else if (typeof prod.workers === 'number') {
            // Coût fixe (Ancient Empires Original)
            workersCost = prod.workers;
          } else {
            // Coût dynamique (Ancient Empires Beri)
            const cityKey = `${citiesBuiltCount} cities`;
            workersCost = prod.workers[cityKey] || prod.workers['3 cities'];
          }

          const canAddWorker = canBuild && !isBuilt && pendingWorkers >= 1;
          // Allow removing workers even if built (during this turn only)
          const canRemoveWorker = canBuild && playerProd && playerProd.progress > 0;

          const handleClick = (e) => {
            // Clic droit pour retirer un ouvrier
            if (e.button === 2 || e.ctrlKey || e.metaKey) {
              e.preventDefault();
              if (canRemoveWorker && onUnbuildProduction) {
                onUnbuildProduction(index);
              }
            } else {
              // Clic gauche pour ajouter un ouvrier
              if (canAddWorker && onBuildProduction) {
                onBuildProduction(index);
              }
            }
          };

          const handleContextMenu = (e) => {
            if (canRemoveWorker) {
              e.preventDefault();
              handleClick(e);
            }
          };

          let bgClass = isBuilt ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-600 dark:border-blue-700' : 'bg-gray-50 dark:bg-dark-elevated border-gray-300 dark:border-dark-border';
          let className = 'border-2 rounded-lg p-2 transition-colors ' + bgClass;
          if (canAddWorker || canRemoveWorker) {
            className += ' hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-500 dark:hover:border-blue-600 cursor-pointer';
          }

          return (
            <div
              key={index}
              className={className}
              onClick={(canAddWorker || canRemoveWorker) ? handleClick : undefined}
              onContextMenu={canRemoveWorker ? handleContextMenu : undefined}
            >
              <div className="text-sm font-bold mb-1 dark:text-dark-text">
                {t(`productionBuildings.${prod.name}`)} ({workersCost})
              </div>
              <div className="flex gap-0.5 flex-wrap mb-1">
                {Array(workersCost).fill(0).map(function (_, j) {
                  return (
                    <div
                      key={j}
                      className={'w-4 h-4 border border-gray-400 dark:border-dark-border rounded transition-colors ' + (
                        playerProd && j < playerProd.progress ? 'bg-blue-600 dark:bg-blue-700' : 'bg-white dark:bg-dark-surface'
                      )}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-green-700 dark:text-green-400 font-semibold">
                {t(`buildingBonuses.${prod.bonus}`)}
              </div>
              {buildingDevMap[prod.name] && buildingDevMap[prod.name].length > 0 && (
                <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                  <span className="not-italic">{useDiscount ? '💰' : '🔓'}</span> <span className="italic">{useDiscount ? t('game.discount') : t('game.unlocks')}: {buildingDevMap[prod.name].map(devId => {
                    const dev = developments.find(d => d.id === devId);
                    return dev ? dev.name : devId;
                  }).join(', ')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
