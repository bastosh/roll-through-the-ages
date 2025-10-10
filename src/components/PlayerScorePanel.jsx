import { GOODS_TYPES, GOODS_NAMES, GOODS_COLORS, GOODS_VALUES } from '../constants/gameData';
import { getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';

function CityDisplay({ cities, onBuildCity, canBuild, pendingWorkers }) {
  const allCities = [
    { built: true, progress: 3, requiredWorkers: 3, number: 1 },
    { built: true, progress: 3, requiredWorkers: 3, number: 2 },
    { built: true, progress: 3, requiredWorkers: 3, number: 3 },
    ...cities.map((city, i) => ({ ...city, number: i + 4, index: i }))
  ];

  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Cités</h3>
      <div className="flex gap-1.5">
        {allCities.map(function (city, i) {
          const height = city.requiredWorkers === 0 ? 'h-16' :
            city.requiredWorkers === 3 ? 'h-16' :
              city.requiredWorkers === 4 ? 'h-16' :
                city.requiredWorkers === 5 ? 'h-20' : 'h-20';

          const isClickable = canBuild && !city.built && (pendingWorkers >= 1 || city.progress > 0);
          let containerClass = 'flex-1';
          if (isClickable) {
            containerClass += ' cursor-pointer';
          }

          return (
            <div
              key={i}
              className={containerClass}
              onClick={isClickable ? () => onBuildCity(city.index) : undefined}
            >
              <div className={'border-3 rounded-lg flex flex-col items-center justify-start p-1.5 ' + height + ' ' + (
                city.built ? 'bg-green-100 border-green-600' : 'bg-gray-100 border-gray-400'
              ) + (isClickable ? ' hover:bg-blue-100 hover:border-blue-500' : '')}>
                {city.requiredWorkers > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {Array(city.requiredWorkers).fill(0).map(function (_, j) {
                      const isLastOdd = city.requiredWorkers % 2 === 1 && j === city.requiredWorkers - 1;
                      return (
                        <div
                          key={j}
                          className={'w-4 h-4 border-2 border-gray-500 rounded ' + (
                            j < city.progress ? 'bg-blue-600' : 'bg-white'
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

function DevelopmentsList({ playerDevelopments, onBuyDevelopment, canBuy, playerGoodsValue, pendingCoins, selectedDevelopmentId, developments }) {
  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Développements</h3>
      <div className="space-y-0.5">
        {developments.map(function (dev) {
          const isOwned = playerDevelopments.indexOf(dev.id) !== -1;
          const totalValue = playerGoodsValue + (pendingCoins || 0);
          const canAfford = totalValue >= dev.cost;
          const isClickable = canBuy && !isOwned && canAfford;
          const isSelected = selectedDevelopmentId === dev.id;

          let bgClass = isOwned ? 'bg-green-50' : isSelected ? 'bg-blue-200 border-2 border-blue-600' : 'bg-gray-50';
          let className = 'flex items-center gap-1.5 p-1.5 rounded text-xs ' + bgClass;
          if (isClickable) {
            className += ' hover:bg-blue-100 cursor-pointer';
          } else if (!isOwned && !canAfford) {
            className += ' opacity-60';
          }

          const element = (
            <div key={dev.id} className={className} onClick={isClickable ? () => onBuyDevelopment(dev.id) : undefined}>
              <div className="w-10 text-right font-semibold text-gray-700 text-xs">{dev.cost}💰</div>
              <div className="w-5 flex justify-center">
                <div className={'w-4 h-4 border-2 rounded flex items-center justify-center ' + (
                  isOwned ? 'bg-green-600 border-green-700' : 'bg-white border-gray-400'
                )}>
                  {isOwned && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <div className="flex-1 font-medium">{dev.name}</div>
              <div className="w-10 text-center font-semibold text-amber-700 text-xs">{dev.points}🏆</div>
              <div className="w-32 text-xs text-gray-600 italic">
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

function MonumentsGrid({ playerMonuments, onBuildMonument, canBuild, pendingWorkers, allPlayers, currentPlayerIndex, monuments }) {
  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Monuments</h3>
      <div className="grid grid-cols-2 gap-2">
        {playerMonuments.map(function (m) {
          const monument = monuments.find(mon => mon.id === m.id);
          const isClickable = canBuild && !m.completed && (pendingWorkers >= 1 || m.progress > 0);

          // Vérifier si quelqu'un d'autre a terminé ce monument en premier
          let someoneElseCompletedFirst = false;
          if (allPlayers) {
            for (let i = 0; i < allPlayers.length; i++) {
              if (i !== currentPlayerIndex) {
                for (let j = 0; j < allPlayers[i].monuments.length; j++) {
                  const otherMonument = allPlayers[i].monuments[j];
                  if (otherMonument.id === m.id && otherMonument.completed && otherMonument.firstToComplete) {
                    someoneElseCompletedFirst = true;
                    break;
                  }
                }
              }
              if (someoneElseCompletedFirst) break;
            }
          }

          return (
            <div
              key={m.id}
              className={'border-2 rounded-lg p-2 ' + (
                m.completed ? 'bg-purple-100 border-purple-600' : 'bg-gray-50 border-gray-300'
              ) + (isClickable ? ' hover:bg-purple-100 hover:border-purple-500 cursor-pointer' : '')}
              onClick={isClickable ? () => onBuildMonument(m.id) : undefined}
            >
              <div className='flex justify-between'>
                <div>
                  <div className="text-xs font-bold mb-1">{monument.name}</div>
                  <div className="flex gap-0.5 flex-wrap mb-1">
                    {Array(monument.workers).fill(0).map(function (_, j) {
                      return (
                        <div
                          key={j}
                          className={'w-3.5 h-3.5 border border-gray-400 rounded ' + (
                            j < m.progress ? 'bg-purple-600' : 'bg-white'
                          )}
                        />
                      );
                    })}
                  </div>
                  {monument.effect && (
                    <div className="text-xs text-gray-600 italic mb-1">
                      {monument.effect}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 text-xs font-semibold">
                  {/* Points maximum (première case à cocher) */}
                  <div className="flex items-center gap-0.5">
                    <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                      m.completed && m.firstToComplete ? 'bg-green-600 border-green-700' :
                        someoneElseCompletedFirst ? 'bg-gray-300 border-gray-400' :
                          'bg-white border-gray-400'
                    )}>
                      {m.completed && m.firstToComplete ? (
                        <span className="text-white text-xs font-bold">{monument.points[0]}</span>
                      ) : someoneElseCompletedFirst ? (
                        <span className="text-gray-600 text-xs font-bold">✗</span>
                      ) : (
                        <span className="text-gray-600 text-xs font-bold">{monument.points[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Points secondaires */}
                  <div className="flex items-center gap-0.5">
                    <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                      m.completed && !m.firstToComplete ? 'bg-purple-600 border-purple-700' :
                        'bg-white border-gray-400'
                    )}>
                      {m.completed && !m.firstToComplete ? (
                        <span className="text-white text-xs font-bold">{monument.points[1]}</span>
                      ) : (
                        <span className="text-gray-600 text-xs font-bold">{monument.points[1]}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DisastersDisplay({ disasters }) {
  if (disasters === 0) return null;

  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Catastrophes</h3>
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-2">
        <div className="flex gap-0.5 flex-wrap mb-1">
          {Array(disasters).fill(0).map(function (_, i) {
            return (
              <div
                key={i}
                className="w-5 h-5 bg-red-600 border-2 border-red-700 rounded flex items-center justify-center text-white text-xs"
              >
                ☠
              </div>
            );
          })}
        </div>
        <div className="text-center text-red-700 font-bold text-sm">-{disasters} points</div>
      </div>
    </div>
  );
}

function ResourcesDisplay({ goodsPositions, food, previewFood, previewGoodsCount }) {
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
    <div className="flex-shrink-0 mt-2">
        <div className='flex items-center justify-between mb-1'>
          <div className="text-sm text-gray-700 font-semibold">
            Biens ({totalGoods}/6)
          </div>
          {/* Valeur totale des biens */}
          <div className="text-sm text-gray-700 font-semibold">
            Valeur totale: {goodsValue}
          </div>
        </div>

      <div className="bg-gray-50 rounded-lg p-2">
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

export default function PlayerScorePanel({
  player,
  onBuyDevelopment,
  canBuy,
  pendingCoins,
  onBuildCity,
  onBuildMonument,
  canBuild,
  pendingWorkers,
  selectedDevelopmentId,
  allPlayers,
  currentPlayerIndex,
  monuments,
  developments,
  previewFood,
  previewGoodsCount
}) {
  const goodsValue = getGoodsValue(player.goodsPositions);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col overflow-hidden">
      {/* Contenu principal en grille */}
      <div className="grid grid-cols-2 gap-12 flex-1 min-h-0">
        {/* Colonne de gauche */}
        <div className="flex flex-col overflow-y-auto">
          <CityDisplay
            cities={player.cities}
            onBuildCity={onBuildCity}
            canBuild={canBuild}
            pendingWorkers={pendingWorkers}
          />
          <MonumentsGrid
            playerMonuments={player.monuments}
            onBuildMonument={onBuildMonument}
            canBuild={canBuild}
            pendingWorkers={pendingWorkers}
            allPlayers={allPlayers}
            currentPlayerIndex={currentPlayerIndex}
            monuments={monuments}
          />
          <ResourcesDisplay
            goodsPositions={player.goodsPositions}
            food={player.food}
            previewFood={previewFood}
            previewGoodsCount={previewGoodsCount}
          />
        </div>

        {/* Colonne de droite */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <DevelopmentsList
            playerDevelopments={player.developments}
            onBuyDevelopment={onBuyDevelopment}
            canBuy={canBuy}
            playerGoodsValue={goodsValue}
            pendingCoins={pendingCoins}
            selectedDevelopmentId={selectedDevelopmentId}
            developments={developments}
          />
          <DisastersDisplay disasters={player.disasters} />
        </div>
      </div>
    </div>
  );
}
