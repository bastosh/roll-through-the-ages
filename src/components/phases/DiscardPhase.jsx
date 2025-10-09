import { GOODS_TYPES, GOODS_NAMES, GOODS_VALUES } from '../../constants/gameData';
import { getGoodsValue, getTotalGoodsCount } from '../../utils/gameUtils';
import GoodsTrack from '../shared/GoodsTrack';

export default function DiscardPhase({ player, onContinue }) {
  const hasCaravans = player.developments.indexOf('caravans') !== -1;
  const totalGoods = getTotalGoodsCount(player.goodsPositions);
  const goodsValue = getGoodsValue(player.goodsPositions);
  const needsToDiscard = !hasCaravans && totalGoods > 6;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Fin du tour</h3>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Biens ({totalGoods}/6)
        </div>
        <div className="space-y-2">
          {[...GOODS_TYPES].reverse().map(function(type) {
            const position = player.goodsPositions[type];
            const value = GOODS_VALUES[type][position];

            return (
              <div key={type} className="flex items-center gap-2">
                <div className="text-xs w-20 text-gray-600">{GOODS_NAMES[type]}</div>
                <GoodsTrack type={type} position={position} />
                <div className="text-xs font-bold w-8 text-right">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2 font-semibold">Valeur totale: {goodsValue}</div>
      </div>

      {hasCaravans ? (
        <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-400">
          <p className="text-center text-green-700 font-semibold">
            ✓ Caravanes: vous pouvez garder toutes vos ressources !
          </p>
        </div>
      ) : (
        <div>
          {needsToDiscard ? (
            <div className="bg-red-50 rounded-lg p-4 mb-4 border-2 border-red-400">
              <p className="text-center text-red-700 font-semibold mb-2">
                ⚠️ Limite de 6 ressources dépassée
              </p>
              <p className="text-center text-red-600">
                Vous devez défausser {totalGoods - 6} ressource(s)
              </p>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-400">
              <p className="text-center text-green-700 font-semibold">
                ✓ Vous respectez la limite de 6 ressources
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 cursor-pointer"
      >
        Terminer le tour
      </button>
    </div>
  );
}
