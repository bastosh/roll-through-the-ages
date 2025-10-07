import { getTotalGoodsCount } from '../utils/gameUtils';

export default function DiscardPhase({ player, handleDiscard }) {
  const hasCaravans = player.developments.indexOf('caravans') !== -1;
  const totalGoods = getTotalGoodsCount(player.goodsPositions);
  const needsToDiscard = !hasCaravans && totalGoods > 6;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Fin du tour</h2>

        {hasCaravans ? (
          <p className="text-center mb-6 text-green-700 font-semibold">
            ✓ Caravanes: vous pouvez garder toutes vos ressources !
          </p>
        ) : (
          <div>
            <p className="text-center mb-4">
              Vous ne pouvez garder que 6 ressources maximum.
            </p>
            <p className="text-center mb-6 font-semibold">
              Ressources actuelles: {totalGoods}
            </p>
            {needsToDiscard && (
              <p className="text-red-600 text-center mb-4">
                ⚠️ Vous devez défausser {totalGoods - 6} ressource(s)
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleDiscard}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
        >
          Terminer le tour
        </button>
      </div>
    </div>
  );
}
