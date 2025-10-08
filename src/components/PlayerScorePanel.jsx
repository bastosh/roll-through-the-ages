import { GOODS_TYPES, GOODS_NAMES, GOODS_COLORS, GOODS_VALUES, MONUMENTS, DEVELOPMENTS } from '../constants/gameData';
import { getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';

function CityDisplay({ cities, onBuildCity, canBuild, pendingWorkers }) {
  const allCities = [
    { built: true, progress: 0, requiredWorkers: 0, number: 1 },
    { built: true, progress: 0, requiredWorkers: 0, number: 2 },
    { built: true, progress: 0, requiredWorkers: 0, number: 3 },
    ...cities.map((city, i) => ({ ...city, number: i + 4, index: i }))
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Cités</h3>
      <div className="flex gap-2">
        {allCities.map(function(city, i) {
          const height = city.requiredWorkers === 0 ? 'h-20' :
                        city.requiredWorkers === 3 ? 'h-20' :
                        city.requiredWorkers === 4 ? 'h-20' :
                        city.requiredWorkers === 5 ? 'h-26' : 'h-26';

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
              <div className={'border-4 rounded-lg flex flex-col items-center justify-start p-2 ' + height + ' ' + (
                city.built ? 'bg-green-100 border-green-600' : 'bg-gray-100 border-gray-400'
              ) + (isClickable ? ' hover:bg-blue-100 hover:border-blue-500' : '')}>
                <div className="text-xs font-bold mb-1">Cité {city.number}</div>
                {city.requiredWorkers > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {Array(city.requiredWorkers).fill(0).map(function(_, j) {
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

function DevelopmentsList({ playerDevelopments, onBuyDevelopment, canBuy, playerGoodsValue, pendingCoins, selectedDevelopmentId }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Développements</h3>
      <div className="space-y-1">
        {DEVELOPMENTS.map(function(dev) {
          const isOwned = playerDevelopments.indexOf(dev.id) !== -1;
          const totalValue = playerGoodsValue + (pendingCoins || 0);
          const canAfford = totalValue >= dev.cost;
          const isClickable = canBuy && !isOwned && canAfford;
          const isSelected = selectedDevelopmentId === dev.id;

          let bgClass = isOwned ? 'bg-green-50' : isSelected ? 'bg-blue-200 border-2 border-blue-600' : 'bg-gray-50';
          let className = 'flex items-center gap-2 p-2 rounded text-sm ' + bgClass;
          if (isClickable) {
            className += ' hover:bg-blue-100 cursor-pointer';
          } else if (!isOwned && !canAfford) {
            className += ' opacity-60';
          }

          const element = (
            <div key={dev.id} className={className} onClick={isClickable ? () => onBuyDevelopment(dev.id) : undefined}>
              <div className="w-12 text-right font-semibold text-gray-700">{dev.cost}💰</div>
              <div className="w-6 flex justify-center">
                <div className={'w-5 h-5 border-2 rounded flex items-center justify-center ' + (
                  isOwned ? 'bg-green-600 border-green-700' : 'bg-white border-gray-400'
                )}>
                  {isOwned && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <div className="flex-1 font-medium">{dev.name}</div>
              <div className="w-12 text-center font-semibold text-amber-700">{dev.points}🏆</div>
              <div className="w-40 text-xs text-gray-600 italic">
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

function MonumentsGrid({ playerMonuments, onBuildMonument, canBuild, pendingWorkers, allPlayers, currentPlayerIndex }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Monuments</h3>
      <div className="grid grid-cols-2 gap-3">
        {playerMonuments.map(function(m) {
          const monument = MONUMENTS.find(mon => mon.id === m.id);
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
              className={'border-2 rounded-lg p-3 ' + (
                m.completed ? 'bg-purple-100 border-purple-600' : 'bg-gray-50 border-gray-300'
              ) + (isClickable ? ' hover:bg-purple-100 hover:border-purple-500 cursor-pointer' : '')}
              onClick={isClickable ? () => onBuildMonument(m.id) : undefined}
            >
              <div className="text-sm font-bold mb-2">{monument.name}</div>
              <div className="flex gap-1 flex-wrap mb-2">
                {Array(monument.workers).fill(0).map(function(_, j) {
                  return (
                    <div
                      key={j}
                      className={'w-3 h-3 border border-gray-400 rounded ' + (
                        j < m.progress ? 'bg-purple-600' : 'bg-white'
                      )}
                    />
                  );
                })}
              </div>
              {monument.effect && (
                <div className="text-xs text-gray-600 italic mb-2 text-center">
                  {monument.effect}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                {/* Points maximum (première case à cocher) */}
                <div className="flex items-center gap-1">
                  <div className={'w-6 h-6 border-2 rounded flex items-center justify-center ' + (
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
                <div className="flex items-center gap-1">
                  <div className={'w-6 h-6 border-2 rounded flex items-center justify-center ' + (
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
          );
        })}
      </div>
    </div>
  );
}

function DisastersDisplay({ disasters }) {
  if (disasters === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Catastrophes</h3>
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-3">
        <div className="flex gap-1 flex-wrap mb-2">
          {Array(disasters).fill(0).map(function(_, i) {
            return (
              <div
                key={i}
                className="w-6 h-6 bg-red-600 border-2 border-red-700 rounded flex items-center justify-center text-white text-xs"
              >
                ☠
              </div>
            );
          })}
        </div>
        <div className="text-center text-red-700 font-bold">-{disasters} points</div>
      </div>
    </div>
  );
}

function FoodDisplay({ food }) {
  const maxFood = 15;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">🌾 Nourriture</h3>
      <div className="bg-amber-50 rounded-lg p-3">
        <div className="flex gap-1 flex-wrap">
          {Array(maxFood).fill(0).map(function(_, idx) {
            const value = idx + 1;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={'w-6 h-8 border-2 border-gray-400 rounded ' + (
                    value <= food ? 'bg-amber-600' : 'bg-white'
                  )}
                />
                <div className="text-xs text-gray-600 mt-0.5">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-2 font-bold text-amber-700">
          Nourriture actuelle: {food}/15
        </div>
      </div>
    </div>
  );
}

function ResourcesDisplay({ goodsPositions }) {
  const totalGoods = getTotalGoodsCount(goodsPositions);
  const goodsValue = getGoodsValue(goodsPositions);

  // Calculer le nombre maximum de cases pour aligner toutes les lignes
  const maxSlots = Math.max(...GOODS_TYPES.map(type => GOODS_VALUES[type].length - 1));

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Biens</h3>

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Biens ({totalGoods}/6)
        </div>
        <div className="space-y-2">
          {[...GOODS_TYPES].reverse().map(function(type) {
            const position = goodsPositions[type];
            const value = GOODS_VALUES[type][position];
            const maxForType = GOODS_VALUES[type].length - 1;

            return (
              <div key={type} className="flex items-center gap-2">
                <div className="text-xs w-20 text-gray-600">{GOODS_NAMES[type]}</div>
                <div className="flex-1 flex gap-1">
                  {/* Afficher toutes les cases existantes pour ce type */}
                  {GOODS_VALUES[type].map(function(val, idx) {
                    if (idx === 0) return null;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={'w-6 h-8 border-2 border-gray-400 rounded ' + (
                            idx <= position ? GOODS_COLORS[type] : 'bg-white'
                          )}
                          title={val.toString()}
                        />
                        <div className="text-xs text-gray-500 mt-0.5">{val}</div>
                      </div>
                    );
                  })}
                  {/* Ajouter des cases vides pour aligner avec les autres lignes */}
                  {Array(maxSlots - maxForType).fill(0).map(function(_, idx) {
                    return (
                      <div key={'empty-' + idx} className="flex flex-col items-center">
                        <div className="w-6 h-8 border-2 border-transparent rounded bg-transparent" />
                        <div className="text-xs text-transparent mt-0.5">-</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm font-bold w-10 text-right">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2 font-semibold">Valeur totale: {goodsValue} pièces</div>
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
  currentPlayerIndex
}) {
  const goodsValue = getGoodsValue(player.goodsPositions);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-800">{player.name}</h2>
        <div className="text-lg font-semibold text-gray-600 mt-1">
          Score: {player.score} pts
        </div>
      </div>

      <FoodDisplay food={player.food} />
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
      />
      <DevelopmentsList
        playerDevelopments={player.developments}
        onBuyDevelopment={onBuyDevelopment}
        canBuy={canBuy}
        playerGoodsValue={goodsValue}
        pendingCoins={pendingCoins}
        selectedDevelopmentId={selectedDevelopmentId}
      />
      <ResourcesDisplay goodsPositions={player.goodsPositions} />
      <DisastersDisplay disasters={player.disasters} />
    </div>
  );
}
