import { useTranslation } from 'react-i18next';

export default function DevelopmentsList({ playerDevelopments, onBuyDevelopment, canBuy, playerGoodsValue, pendingCoins, selectedDevelopmentId, developments }) {
  const { t } = useTranslation();
  return (
    <div className="flex-shrink-0">
      <h3 className="text-base font-bold mb-3 text-gray-800">{t('common.developments')}</h3>
      <div className="space-y-1">
        {developments.map(function (dev) {
          const isOwned = playerDevelopments.indexOf(dev.id) !== -1;
          const totalValue = playerGoodsValue + (pendingCoins || 0);
          const canAfford = totalValue >= dev.cost;
          const isClickable = canBuy && !isOwned && canAfford;
          const isSelected = selectedDevelopmentId === dev.id;

          let bgClass = isOwned ? 'bg-green-50' : isSelected ? 'bg-blue-200 border-2 border-blue-600' : 'bg-gray-50';
          let className = 'flex items-center gap-2 py-2.5 px-2 rounded text-sm ' + bgClass;
          if (isClickable) {
            className += ' hover:bg-blue-100 cursor-pointer';
          } else if (!isOwned && !canAfford) {
            className += ' opacity-60';
          }

          const element = (
            <div key={dev.id} className={className} onClick={isClickable ? () => onBuyDevelopment(dev.id) : undefined}>
              <div className="w-12 text-right font-semibold text-gray-700 text-sm">{dev.cost}💰</div>
              <div className="w-6 flex justify-center">
                <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                  isOwned ? 'bg-green-600 border-green-700' : 'bg-white border-gray-400'
                )}>
                  {isOwned && <span className="text-white text-sm">✓</span>}
                </div>
              </div>
              <div className="flex-1 font-medium text-sm">{dev.name}</div>
              <div className="w-12 text-center font-semibold text-amber-700 text-sm">{dev.points}🏆</div>
              <div className="w-lg text-sm text-gray-600 italic">
                {dev.effect}
              </div>
            </div>
          );

          return element;
        })}
      </div>
    </div>
  );
}
