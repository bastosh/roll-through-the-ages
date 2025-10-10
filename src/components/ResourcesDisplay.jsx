import { GOODS_TYPES, GOODS_NAMES, GOODS_COLORS, GOODS_VALUES } from '../constants/gameData';
import { getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';

export default function ResourcesDisplay({
  goodsPositions,
  food,
  previewFood,
  previewGoodsCount,
  interactionMode = null,
  tempGoodsPositions = null,
  selectedGoodsForPurchase = null,
  onDiscardGood = null,
  onToggleGoodForPurchase = null
}) {
  const displayGoodsPositions = tempGoodsPositions || goodsPositions;
  const totalGoods = getTotalGoodsCount(displayGoodsPositions);
  const goodsValue = getGoodsValue(displayGoodsPositions);

  // Calculer le nombre maximum de cases pour aligner toutes les lignes
  const maxSlots = Math.max(...GOODS_TYPES.map(type => GOODS_VALUES[type].length - 1));
  const maxFood = 15;

  // Calculate preview goods positions (simulate adding goods)
  let previewGoodsPositions = { ...displayGoodsPositions };
  if (previewGoodsCount > 0) {
    let resourceIndex = 0;
    for (let i = 0; i < previewGoodsCount; i++) {
      let attempts = 0;
      while (attempts < GOODS_TYPES.length) {
        const type = GOODS_TYPES[resourceIndex];
        const maxPos = GOODS_VALUES[type].length - 1;

        if (previewGoodsPositions[type] < maxPos) {
          previewGoodsPositions[type]++;
          resourceIndex = (resourceIndex + 1) % GOODS_TYPES.length;
          break;
        }

        resourceIndex = (resourceIndex + 1) % GOODS_TYPES.length;
        attempts++;
      }
    }
  }

  const futureFood = Math.min(food + (previewFood || 0), 15);

  return (
    <div className="flex-shrink-0 mt-2">
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 gap-1'>
          <div className="text-xs sm:text-sm text-gray-700 font-semibold">
            Biens ({totalGoods}/6)
          </div>
          {/* Valeur totale des biens */}
          <div className="text-xs sm:text-sm text-gray-700 font-semibold">
            Valeur: {goodsValue}
          </div>
        </div>

      <div className="bg-gray-50 rounded-lg p-1 sm:p-2 overflow-x-auto">
        <div className="space-y-1">
          {[...GOODS_TYPES].reverse().map(function (type) {
            const position = displayGoodsPositions[type];
            const previewPosition = previewGoodsPositions[type];
            const value = GOODS_VALUES[type][position];
            const maxForType = GOODS_VALUES[type].length - 1;

            const canDiscard = interactionMode === 'discard' && position > 0;
            const canToggleForBuy = interactionMode === 'buy' && position > 0;
            const selectedQuantity = selectedGoodsForPurchase ? selectedGoodsForPurchase[type] : 0;
            const selectedValue = selectedQuantity > 0 ? GOODS_VALUES[type][selectedQuantity] : 0;

            function handleClick() {
              if (canDiscard && onDiscardGood) {
                onDiscardGood(type);
              } else if (canToggleForBuy && onToggleGoodForPurchase) {
                onToggleGoodForPurchase(type);
              }
            }

            const rowClass = (canDiscard || canToggleForBuy) ? 'cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1' : '';
            const highlightClass = selectedQuantity > 0 ? 'bg-green-50 border border-green-400 rounded px-1 -mx-1' : '';

            return (
              <div
                key={type}
                className={'flex items-start gap-1.5 ' + (highlightClass || rowClass)}
                onClick={handleClick}
              >
                <div className="text-xs w-16 text-gray-600 pt-0.5">{GOODS_NAMES[type]}</div>
                <div className="flex-1 flex gap-1">
                  {/* Afficher toutes les cases existantes pour ce type */}
                  {GOODS_VALUES[type].map(function (val, idx) {
                    if (idx === 0) return null;
                    const isCurrent = idx <= position;
                    const isPreview = idx > position && idx <= previewPosition;
                    const isSelected = selectedQuantity > 0 && idx <= selectedQuantity;

                    let bgClass = 'bg-white';
                    let borderClass = 'border-gray-400';

                    if (isCurrent) {
                      bgClass = GOODS_COLORS[type];
                      if (isSelected) {
                        borderClass = 'border-green-500';
                      }
                    } else if (isPreview) {
                      // Lighter version of the color for preview
                      if (type === 'wood') bgClass = 'bg-brown-300';
                      else if (type === 'stone') bgClass = 'bg-gray-200';
                      else if (type === 'pottery') bgClass = 'bg-red-200';
                      else if (type === 'cloth') bgClass = 'bg-blue-100';
                      else if (type === 'spearheads') bgClass = 'bg-orange-200';
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={'w-6 h-7 border-2 rounded ' + bgClass + ' ' + borderClass}
                          title={val.toString()}
                        />
                        <div className="text-xs text-gray-500 mt-0.5">{val}</div>
                      </div>
                    );
                  })}
                  {/* Ajouter des cases vides pour aligner avec les autres lignes */}
                  {Array(maxSlots - maxForType).fill(0).map(function (_, idx) {
                    return (
                      <div key={'empty-' + idx} className="flex flex-col items-center">
                        <div className="w-7 h-6 border-2 border-transparent rounded bg-transparent" />
                        <div className="text-xs text-transparent mt-0.5">-</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs font-bold w-8 text-right pt-0.5">
                  {selectedQuantity > 0 ? (
                    <span className="text-green-600">{selectedValue}</span>
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ligne de la nourriture */}
        <div className="flex items-start gap-1.5 pt-2 border-t border-gray-300 mt-1">
          <div className="text-xs w-16 text-gray-600 pt-0.5">Nourriture</div>
          <div className="flex-1 flex gap-1">
            {Array(maxFood).fill(0).map(function (_, idx) {
              const value = idx + 1;
              const isCurrent = value <= food;
              const isPreview = value > food && value <= futureFood;

              let bgClass = 'bg-white';
              if (isCurrent) {
                bgClass = 'bg-yellow-400';
              } else if (isPreview) {
                bgClass = 'bg-yellow-200'; // Lighter amber for preview
              }

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={'w-7 h-6 border-2 border-gray-400 rounded ' + bgClass} />
                  <div className="text-xs text-gray-500 mt-0.5">{value}</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs font-bold w-8 text-right pt-0.5">{food}</div>
        </div>
      </div>
    </div>
  );
}
