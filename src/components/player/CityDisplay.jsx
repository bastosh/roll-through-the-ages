import { useTranslation } from 'react-i18next';

export default function CityDisplay({ cities, onBuildCity, onUnbuildCity, canBuild, pendingWorkers }) {
  const { t } = useTranslation();
  const allCities = [
    { built: true, progress: 3, requiredWorkers: 3, number: 1 },
    { built: true, progress: 3, requiredWorkers: 3, number: 2 },
    { built: true, progress: 3, requiredWorkers: 3, number: 3 },
    ...cities.map((city, i) => ({ ...city, number: i + 4, index: i }))
  ];

  return (
    <div className="flex-shrink-0">
      <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-dark-text">{t('common.cities')}</h3>
      <div className="flex gap-1.5">
        {allCities.map(function (city, i) {
          const height = city.requiredWorkers <= 4 ? 'h-16' : 'h-20';

          const canAddWorker = canBuild && !city.built && pendingWorkers >= 1;
          const canRemoveWorker = canBuild && !city.built && city.progress > 0;

          const handleClick = (e) => {
            // Clic droit pour retirer un ouvrier
            if (e.button === 2 || e.ctrlKey || e.metaKey) {
              e.preventDefault();
              if (canRemoveWorker && onUnbuildCity) {
                onUnbuildCity(city.index);
              }
            } else {
              // Clic gauche pour ajouter un ouvrier
              if (canAddWorker && onBuildCity) {
                onBuildCity(city.index);
              }
            }
          };

          const handleContextMenu = (e) => {
            if (canRemoveWorker) {
              e.preventDefault();
              handleClick(e);
            }
          };

          let containerClass = '';
          if (canAddWorker || canRemoveWorker) {
            containerClass = 'cursor-pointer';
          }

          return (
            <div
              key={i}
              className={containerClass}
              onClick={(canAddWorker || canRemoveWorker) ? handleClick : undefined}
              onContextMenu={canRemoveWorker ? handleContextMenu : undefined}
            >
              <div className={'border-2 rounded-lg flex flex-col items-center justify-start p-1.5 transition-colors ' + height + ' ' + (
                city.built ? 'bg-green-100 dark:bg-green-900/30 border-green-600 dark:border-green-700' : 'bg-gray-50 dark:bg-dark-elevated border-gray-300 dark:border-dark-border'
              ) + ((canAddWorker || canRemoveWorker) ? ' hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-500 dark:hover:border-blue-600' : '')}>
                {city.requiredWorkers > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {Array(city.requiredWorkers).fill(0).map(function (_, j) {
                      const isLastOdd = city.requiredWorkers % 2 === 1 && j === city.requiredWorkers - 1;
                      return (
                        <div
                          key={j}
                          className={'w-4 h-4 border border-gray-400 dark:border-dark-border rounded transition-colors ' + (
                            j < city.progress ? 'bg-blue-600 dark:bg-blue-700' : 'bg-white dark:bg-dark-surface'
                          ) + (isLastOdd ? ' col-span-2 mx-auto' : '')}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
