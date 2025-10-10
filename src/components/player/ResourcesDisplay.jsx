import { GOODS_TYPES, GOODS_NAMES, GOODS_COLORS, GOODS_VALUES } from '../../constants/gameData';
import { getGoodsValue, getTotalGoodsCount } from '../../utils/gameUtils';

export default function ResourcesDisplay({ goodsPositions, food, previewFood, previewGoodsCount }) {
  const totalGoods = getTotalGoodsCount(goodsPositions);
  const goodsValue = getGoodsValue(goodsPositions);

  // Calculer le nombre maximum de cases pour aligner toutes les lignes
  const maxSlots = Math.max(...GOODS_TYPES.map(type => GOODS_VALUES[type].length - 1));
  const maxFood = 15;

  // Calculate preview goods positions (simulate adding goods)
  let previewGoodsPositions = { ...goodsPositions };
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
    <div className="flex-shrink-0">
      <div className="bg-gray-50 rounded-lg p-2">
        <div className='flex items-center justify-between'>
          <div className="text-sm  text-gray-700 font-semibold mb-3">
            Biens ({totalGoods}/6)
          </div>
          {/* Valeur totale des biens */}
          <div className="text-sm text-gray-700 font-semibold">
            Valeur totale: {goodsValue}
          </div>
        </div>

        <div className="space-y-1">
          {[...GOODS_TYPES].reverse().map(function (type) {
            const position = goodsPositions[type];
            const previewPosition = previewGoodsPositions[type];
            const value = GOODS_VALUES[type][position];
            const maxForType = GOODS_VALUES[type].length - 1;

            return (
              <div key={type} className="flex items-start gap-1.5">
                <div className="text-xs w-16 text-gray-600 pt-0.5">{GOODS_NAMES[type]}</div>
                <div className="flex-1 flex gap-1">
                  {/* Afficher toutes les cases existantes pour ce type */}
                  {GOODS_VALUES[type].map(function (val, idx) {
                    if (idx === 0) return null;
                    const isCurrent = idx <= position;
                    const isPreview = idx > position && idx <= previewPosition;

                    let bgClass = 'bg-white';
                    if (isCurrent) {
                      bgClass = GOODS_COLORS[type];
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
                          className={'w-6 h-7 border-2 border-gray-400 rounded ' + bgClass}
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
                        <div className="w-6 h-7 border-2 border-transparent rounded bg-transparent" />
                        <div className="text-xs text-transparent mt-0.5">-</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs font-bold w-8 text-right pt-0.5">{value}</div>
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
                  <div className={'w-6 h-7 border-2 border-gray-400 rounded ' + bgClass} />
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
