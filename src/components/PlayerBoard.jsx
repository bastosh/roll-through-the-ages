import { GOODS_TYPES, GOODS_NAMES, GOODS_COLORS, GOODS_VALUES, MONUMENTS, DEVELOPMENTS } from '../constants/gameData';
import { getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';

export default function PlayerBoard({ player, isActive }) {
  const totalGoods = getTotalGoodsCount(player.goodsPositions);
  const goodsValue = getGoodsValue(player.goodsPositions);

  let completedCities = 3;
  for (let i = 0; i < player.cities.length; i++) {
    if (player.cities[i].built) completedCities++;
  }

  let completedMonuments = 0;
  for (let i = 0; i < player.monuments.length; i++) {
    if (player.monuments[i].completed) completedMonuments++;
  }

  return (
    <div className={'bg-white rounded-lg p-4 shadow-lg border-4 ' + (
      isActive ? 'border-amber-500' : 'border-gray-300'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{player.name}</h3>
        {player.isStartPlayer && <span className="text-2xl">⭐</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-amber-50 rounded p-3">
          <div className="text-sm text-gray-600 mb-1">Nourriture</div>
          <div className="text-2xl font-bold text-amber-700">🌾 {player.food}</div>
        </div>

        <div className="bg-blue-50 rounded p-3">
          <div className="text-sm text-gray-600 mb-1">Cités</div>
          <div className="text-2xl font-bold text-blue-700">🏛️ {completedCities}</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-3 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Ressources ({totalGoods}/6)
        </div>
        <div className="space-y-2">
          {[...GOODS_TYPES].reverse().map(function(type) {
            const position = player.goodsPositions[type];
            const value = GOODS_VALUES[type][position];

            return (
              <div key={type} className="flex items-center gap-2">
                <div className="text-xs w-20 text-gray-600">{GOODS_NAMES[type]}</div>
                <div className="flex-1 flex gap-1">
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
                </div>
                <div className="text-sm font-bold w-10 text-right">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2 font-semibold">Valeur totale: {goodsValue} pièces</div>
      </div>

      <div className="bg-purple-50 rounded p-3 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Monuments ({completedMonuments}/{MONUMENTS.length})
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {player.monuments.map(function(m) {
            const monument = MONUMENTS.find(function(mon) {
              return mon.id === m.id;
            });
            return (
              <div key={m.id} className={m.completed ? 'text-green-700' : 'text-gray-500'}>
                {monument.name}: {m.progress}/{monument.workers}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-green-50 rounded p-3 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Développements ({player.developments.length}/5)
        </div>
        <div className="text-xs space-y-1">
          {player.developments.map(function(devId) {
            const dev = DEVELOPMENTS.find(function(d) {
              return d.id === devId;
            });
            return (
              <div key={devId} className="text-green-700">
                • {dev.name}
              </div>
            );
          })}
        </div>
      </div>

      {player.disasters > 0 && (
        <div className="bg-red-50 rounded p-3 mb-4">
          <div className="text-sm font-semibold text-red-700">
            ⚠️ Désastres: -{player.disasters} points
          </div>
        </div>
      )}

      <div className="text-lg font-bold text-center text-gray-800">
        Score estimé: {player.score} pts
      </div>
    </div>
  );
}
