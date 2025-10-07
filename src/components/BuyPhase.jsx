import { DEVELOPMENTS } from '../constants/gameData';
import { getGoodsValue } from '../utils/gameUtils';

export default function BuyPhase({ player, pendingCoins, showBuyModal, setShowBuyModal, handleBuyDevelopment, handleSkipBuy }) {
  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50 overflow-y-auto">
      {!showBuyModal && (
        <button
          onClick={() => setShowBuyModal(true)}
          className="fixed top-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-700 shadow-lg z-50"
        >
          Afficher les développements
        </button>
      )}

      {showBuyModal && (
        <div className="bg-white rounded-xl p-8 max-w-4xl w-full my-8 relative">
          <button
            onClick={() => setShowBuyModal(false)}
            className="absolute top-4 right-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Masquer
          </button>

          <h2 className="text-2xl font-bold mb-4 text-center">Acheter un développement</h2>

          <p className="text-center mb-6">
            Valeur disponible: <span className="font-bold text-2xl">
              {getGoodsValue(player.goodsPositions) + pendingCoins}
            </span> pièces
            {pendingCoins > 0 && (
              <span className="text-sm text-gray-600 block mt-1">
                (Ressources: {getGoodsValue(player.goodsPositions)} + Pièces: {pendingCoins})
              </span>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {DEVELOPMENTS.map(function(dev) {
              const totalValue = getGoodsValue(player.goodsPositions) + pendingCoins;
              const canAfford = totalValue >= dev.cost;
              const alreadyOwned = player.developments.indexOf(dev.id) !== -1;

              let buttonClass = 'p-4 rounded-lg text-left ';
              if (alreadyOwned) {
                buttonClass += 'bg-green-200 text-green-800 cursor-not-allowed';
              } else if (canAfford) {
                buttonClass += 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-400';
              } else {
                buttonClass += 'bg-gray-200 text-gray-500 cursor-not-allowed';
              }

              return (
                <button
                  key={dev.id}
                  onClick={() => handleBuyDevelopment(dev.id)}
                  disabled={!canAfford || alreadyOwned}
                  className={buttonClass}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold">{dev.name}</div>
                    <div className="text-sm bg-white px-2 py-1 rounded">
                      {dev.cost}💰 / {dev.points}🏆
                    </div>
                  </div>
                  {alreadyOwned && <div className="text-xs mt-2">✓ Déjà acheté</div>}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSkipBuy}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700"
          >
            Ne rien acheter
          </button>
        </div>
      )}
    </div>
  );
}
