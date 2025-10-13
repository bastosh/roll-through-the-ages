import { useTranslation } from 'react-i18next';

export default function DevelopmentsListAncient({
  playerDevelopments,
  onBuyDevelopment,
  canBuy,
  playerGoodsValue,
  pendingCoins,
  selectedDevelopmentId,
  developments,
  playerMonuments,
  playerProductions,
  hasMetropolis,
  playerCount
}) {
  const { t } = useTranslation();

  // Fonction pour calculer le coût réel avec réduction
  function calculateActualCost(dev) {
    let baseCost = dev.cost;

    // Coût variable pour la médecine
    if (dev.id === 'medicine' && typeof baseCost === 'string' && baseCost.includes('per player')) {
      baseCost = 10 * playerCount;
    }

    // Vérifier si le joueur a droit à une réduction
    let discount = 0;
    if (dev.discount && dev.discount !== 'none') {
      if (dev.discount === 'monumement') {
        // Réduction si un monument est complété
        const hasCompletedMonument = playerMonuments.some(m => m.completed);
        if (hasCompletedMonument) {
          discount = 5;
        }
      } else if (dev.discount === 'market' || dev.discount === 'mine' || dev.discount === 'village') {
        // Réduction si le bâtiment de production correspondant est construit
        const prodIndex = playerProductions.findIndex(p => p.name === dev.discount && p.built);
        if (prodIndex !== -1) {
          discount = 5;
        }
      }
    }

    return Math.max(0, baseCost - discount);
  }

  // Fonction pour vérifier si le prérequis est satisfait
  function checkPrerequisite(dev) {
    if (!dev.prerequisite) return true;

    if (dev.prerequisite === 'metropolis') {
      return hasMetropolis;
    }

    return true;
  }

  // Séparer les développements avec et sans prérequis métropole
  const regularDevelopments = [];
  const metropolisDevelopments = [];

  for (let i = 0; i < developments.length; i++) {
    const dev = developments[i];
    const actualCost = calculateActualCost(dev);
    if (dev.prerequisite === 'metropolis') {
      metropolisDevelopments.push({ ...dev, actualCost });
    } else {
      regularDevelopments.push({ ...dev, actualCost });
    }
  }

  // Trier par coût
  regularDevelopments.sort((a, b) => a.actualCost - b.actualCost);
  metropolisDevelopments.sort((a, b) => a.actualCost - b.actualCost);

  const allDevelopments = [...regularDevelopments, ...metropolisDevelopments];

  return (
    <div className="flex-shrink-0">
      <h3 className="text-base font-bold mb-3 text-gray-800 dark:text-dark-text">{t('common.developments')}</h3>
      <div className="space-y-1">
        {allDevelopments.map(function (dev, index) {
          // Afficher un séparateur avant les développements avec prérequis métropole
          const showSeparator = index === regularDevelopments.length && metropolisDevelopments.length > 0;

          if (showSeparator) {
            return (
              <div key="metropolis-separator">
                <div className="border-t-2 border-amber-400 dark:border-amber-600 my-3 pt-2">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 text-center mb-2 bg-amber-50 dark:bg-amber-900/30 py-1 rounded">
                    ⚠️ Nécessite la Métropole
                  </div>
                </div>
                {renderDevelopment(dev)}
              </div>
            );
          }

          return renderDevelopment(dev);
        })}
      </div>
    </div>
  );

  function renderDevelopment(dev) {
          const isOwned = playerDevelopments.indexOf(dev.id) !== -1;
          const actualCost = calculateActualCost(dev);
          const hasDiscount = actualCost < (typeof dev.cost === 'number' ? dev.cost : 10 * playerCount);
          const meetsPrerequisite = checkPrerequisite(dev);
          const totalValue = playerGoodsValue + (pendingCoins || 0);
          const canAfford = totalValue >= actualCost && meetsPrerequisite;
          const isClickable = canBuy && !isOwned && canAfford;
          const isSelected = selectedDevelopmentId === dev.id;

          let bgClass = isOwned ? 'bg-green-50 dark:bg-green-900/30' : isSelected ? 'bg-blue-200 dark:bg-blue-900/40 border-2 border-blue-600 dark:border-blue-700' : 'bg-gray-50 dark:bg-dark-elevated';
          let className = 'flex items-center gap-2 py-2.5 px-2 rounded text-sm transition-colors ' + bgClass;
          if (isClickable) {
            className += ' hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer';
          } else if (!isOwned && (!canAfford || !meetsPrerequisite)) {
            className += ' opacity-60';
          }

          // Afficher le coût avec la réduction si applicable
          let costDisplay = actualCost + '💰';
          if (hasDiscount && !isOwned) {
            const originalCost = typeof dev.cost === 'number' ? dev.cost : 10 * playerCount;
            costDisplay = (
              <span>
                <span className="line-through text-gray-400 dark:text-gray-500">{originalCost}</span>
                {' '}
                <span className="text-green-600 dark:text-green-400 font-bold">{actualCost}</span>
                💰
              </span>
            );
          }

          const element = (
            <div key={dev.id} className={className} onClick={isClickable ? () => onBuyDevelopment(dev.id) : undefined}>
              <div className="w-16 text-right font-semibold text-gray-700 dark:text-dark-text text-sm">{costDisplay}</div>
              <div className="w-6 flex justify-center">
                <div className={'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ' + (
                  isOwned ? 'bg-green-600 dark:bg-green-700 border-green-700 dark:border-green-800' : 'bg-white dark:bg-dark-surface border-gray-400 dark:border-dark-border'
                )}>
                  {isOwned && <span className="text-white text-sm">✓</span>}
                </div>
              </div>
              <div className="w-28 font-medium text-sm dark:text-dark-text">
                {dev.name}
              </div>
              <div className="w-12 text-center font-semibold text-amber-700 dark:text-amber-500 text-sm">{dev.points}🏆</div>
              {dev.effect && (
                <div className="flex-1 text-sm text-gray-600 dark:text-dark-text-muted italic">
                  {dev.effect}
                </div>
              )}
            </div>
          );

          return element;
  }
}
