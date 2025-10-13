import { useTranslation } from 'react-i18next';

/**
 * Affiche les bateaux construits par un joueur (max 5).
 * @param {number} builtBoats - Nombre de bateaux construits (0-5)
 * @param {number} pendingBoats - Nombre de bateaux en cours de construction (0-5)
 * @param {boolean} canBuild - Si le joueur peut construire (phase de build)
 * @param {number} maxBoats - Nombre maximum de bateaux constructibles avec les ressources actuelles
 * @param {boolean} hasShipping - Si le joueur a le développement Navigation
 * @param {Function} onBuildBoat - Callback pour construire un bateau
 * @param {Function} onUnbuildBoat - Callback pour annuler la construction d'un bateau
 */
const BoatDisplay = ({
  builtBoats = 0,
  pendingBoats = 0,
  canBuild = false,
  maxBoats = 0,
  hasShipping = false,
  onBuildBoat = null,
  onUnbuildBoat = null
}) => {
  const { t } = useTranslation();
  const totalBoats = builtBoats + pendingBoats;
  const boats = Array.from({ length: 5 }, (_, i) => {
    if (i < builtBoats) return 'built';
    if (i < totalBoats) return 'pending';
    return 'empty';
  });

  const handleBoatClick = (e) => {
    if (!canBuild || !hasShipping) return;

    // Clic droit pour annuler la construction d'un bateau
    if (e.button === 2 || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (pendingBoats > 0 && onUnbuildBoat) {
        onUnbuildBoat();
      }
    } else {
      // Clic gauche pour construire un bateau
      if (maxBoats > 0 && onBuildBoat) {
        onBuildBoat();
      }
    }
  };

  const handleContextMenu = (e) => {
    if (canBuild && hasShipping && pendingBoats > 0) {
      e.preventDefault();
      handleBoatClick(e);
    }
  };

  const canInteract = canBuild && hasShipping && maxBoats > 0;
  const canUnbuild = canBuild && hasShipping && pendingBoats > 0;

  return (
    <div className="flex flex-col items-end ml-6 min-w-[180px]">
      <div className="text-base font-bold mb-1 text-gray-800 dark:text-dark-text">{t('game.boats')}</div>
      <div
        className={`flex flex-row gap-1 mb-1 bg-gray-50 dark:bg-dark-elevated border-2 rounded-lg px-4 py-3 transition-colors ${
          canInteract
            ? 'border-amber-400 dark:border-amber-dark-600 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/30'
            : 'border-gray-300 dark:border-dark-border'
        }`}
        onClick={handleBoatClick}
        onContextMenu={handleContextMenu}
      >
        {boats.map((status, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 border rounded transition-colors ${
              status === 'built'
                ? 'bg-blue-500 dark:bg-blue-600 border-blue-700 dark:border-blue-800'
                : status === 'pending'
                ? 'bg-amber-300 dark:bg-amber-600 border-amber-500 dark:border-amber-700'
                : 'bg-white dark:bg-dark-surface border-gray-400 dark:border-dark-border'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-right text-gray-700 dark:text-dark-text-muted">
        {!hasShipping ? (
          <>
            <span className="text-red-600 dark:text-red-400 font-semibold">{t('game.requiresShipping')}</span><br />
            <span>{t('game.boatCost')}</span>
          </>
        ) : (
          <>
            <span>{t('game.boatCost')}</span>
            {(canInteract || canUnbuild) && (
              <>
                <br />
                {canInteract && (
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {t('game.clickToBuild', { count: maxBoats, plural: maxBoats > 1 ? 's' : '' })}
                  </span>
                )}
                {canInteract && canUnbuild && <br />}
                {canUnbuild && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {t('game.rightClickToCancel', { count: pendingBoats })}
                  </span>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BoatDisplay;
