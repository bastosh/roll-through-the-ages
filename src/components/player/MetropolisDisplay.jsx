import { useTranslation } from 'react-i18next';

export default function MetropolisDisplay({ metropolis, onBuildMetropolis, onUnbuildMetropolis, canBuild, pendingWorkers }) {
  const { t } = useTranslation();

  const canAddWorker = canBuild && !metropolis.built && pendingWorkers >= 1;
  const canRemoveWorker = canBuild && !metropolis.built && metropolis.progress > 0;

  const handleClick = (e) => {
    // Clic droit pour retirer un ouvrier
    if (e.button === 2 || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (canRemoveWorker && onUnbuildMetropolis) {
        onUnbuildMetropolis();
      }
    } else {
      // Clic gauche pour ajouter un ouvrier
      if (canAddWorker && onBuildMetropolis) {
        onBuildMetropolis();
      }
    }
  };

  const handleContextMenu = (e) => {
    if (canRemoveWorker) {
      e.preventDefault();
      handleClick(e);
    }
  };

  let containerClass = 'flex-shrink-0';
  if (canAddWorker || canRemoveWorker) {
    containerClass += ' cursor-pointer';
  }

  return (
    <div className={containerClass}>
      <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-dark-text">Métropole</h3>
      <div
        onClick={(canAddWorker || canRemoveWorker) ? handleClick : undefined}
        onContextMenu={canRemoveWorker ? handleContextMenu : undefined}
      >
        <div className={'border-2 rounded-lg flex flex-col items-center justify-start p-1.5 h-28 transition-colors ' + (
          metropolis.built ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-600 dark:border-yellow-700' : 'bg-gray-50 dark:bg-dark-elevated border-gray-300 dark:border-dark-border'
        ) + ((canAddWorker || canRemoveWorker) ? ' hover:bg-yellow-100 dark:hover:bg-yellow-900/40 hover:border-yellow-500 dark:hover:border-yellow-600' : '')}>
          <div className="grid grid-cols-2 gap-1">
            {Array(10).fill(0).map(function (_, j) {
              return (
                <div
                  key={j}
                  className={'w-4 h-4 border border-gray-400 dark:border-dark-border rounded transition-colors ' + (
                    j < metropolis.progress ? 'bg-yellow-600 dark:bg-yellow-700' : 'bg-white dark:bg-dark-surface'
                  )}
                />
              );
            })}
          </div>
          <div className="text-xs font-semibold mt-3 text-amber-700 dark:text-amber-500">4🏆</div>
        </div>
      </div>
    </div>
  );
}
