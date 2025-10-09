import { GOODS_TYPES, GOODS_NAMES, GOODS_VALUES } from '../../constants/gameData';
import { getGoodsValue, getTotalGoodsCount } from '../../utils/gameUtils';
import GoodsTrack from '../shared/GoodsTrack';

export default function BuyPhase({
  player,
  pendingCoins,
  onReset,
  onSkip,
  hasPurchased,
  selectedDevelopment,
  selectedGoods,
  selectedCoins,
  onToggleGood,
  onConfirmPurchase,
  onCancelSelection,
  calculateSelectedValue,
  lastPurchasedDevelopment,
  granariesRate,
  foodToTradeForCoins,
  onTradeFood,
  onResetTrade
}) {
  const totalGoods = getTotalGoodsCount(player.goodsPositions);
  const goodsValue = getGoodsValue(player.goodsPositions);
  const totalValue = goodsValue + pendingCoins;
  const hasGranaries = player.developments.indexOf('granaries') !== -1;
  const totalFoodAvailable = player.food + foodToTradeForCoins;

  if (selectedDevelopment) {
    const selectedValue = calculateSelectedValue();
    const canPurchase = selectedValue >= selectedDevelopment.cost;

    return (
      <div>
        <h3 className="text-xl font-bold mb-4 text-amber-800">Acheter: {selectedDevelopment.name}</h3>

        <div className="bg-blue-50 rounded-lg p-4 mb-4 border-2 border-blue-400">
          <div className="text-center mb-2">
            <div className="text-sm text-gray-600">Coût</div>
            <div className="text-2xl font-bold text-blue-700">{selectedDevelopment.cost} 💰</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Valeur sélectionnée</div>
            <div className={`text-2xl font-bold ${canPurchase ? 'text-green-600' : 'text-red-600'}`}>
              {selectedValue} 💰
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            Cliquez sur les ressources à utiliser
          </div>

          {pendingCoins > 0 && (
            <div className="flex items-center justify-between p-3 mb-2 rounded border-2 bg-amber-100 border-amber-500">
              <span className="font-semibold">💰 Pièces (auto)</span>
              <span className="text-lg font-bold">{pendingCoins}</span>
            </div>
          )}

          <div className="space-y-2">
            {[...GOODS_TYPES].reverse().map(function(type) {
              const position = player.goodsPositions[type];
              const selectedPosition = selectedGoods[type];

              if (position === 0) return null;

              const isUsed = selectedPosition > 0;

              return (
                <div
                  key={type}
                  className={'flex items-center gap-2 p-2 rounded cursor-pointer transition ' + (
                    isUsed ? 'bg-green-100 border-2 border-green-500' : 'bg-white border-2 border-gray-300 hover:border-blue-400'
                  )}
                  onClick={() => onToggleGood(type)}
                >
                  <div className="text-xs w-20 text-gray-600 font-semibold">{GOODS_NAMES[type]}</div>
                  <GoodsTrack
                    type={type}
                    position={position}
                    isSelected={isUsed}
                    showEmptySlots={true}
                  />
                  <div className="text-xs font-bold w-8 text-right">
                    {selectedPosition > 0 ? GOODS_VALUES[type][selectedPosition] : 0}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onCancelSelection}
            className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmPurchase}
            disabled={!canPurchase}
            className={`w-full py-3 rounded-lg font-bold ${
              canPurchase
                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            Confirmer l'achat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Titre en haut */}
      <h3 className="text-xl font-bold mb-4 text-amber-800">Acheter un développement</h3>

      {/* Contenu principal centré */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto">
        {hasGranaries && (
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-4">
            <div className="text-center mb-3">
              <div className="text-sm font-bold text-green-700 mb-2">🌾 Greniers</div>
              <div className="text-xs text-gray-600 mb-2">
                Échangez de la nourriture contre {granariesRate} pièces/unité
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-sm">
                  Nourriture: <span className="font-bold">{totalFoodAvailable}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={totalFoodAvailable}
                  value={foodToTradeForCoins}
                  onChange={(e) => onTradeFood(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border-2 border-green-400 rounded text-center font-bold"
                />
                <div className="text-sm">
                  → <span className="font-bold text-amber-600">{foodToTradeForCoins * granariesRate} 💰</span>
                </div>
              </div>
              {foodToTradeForCoins > 0 && (
                <button
                  onClick={onResetTrade}
                  className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 cursor-pointer"
                >
                  Annuler l'échange
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-center mb-3">
            <div className="text-sm text-gray-600 mb-1">Valeur disponible</div>
            <div className="text-3xl font-bold text-amber-700">{totalValue} 💰</div>
            {pendingCoins > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Ressources: {goodsValue} + Pièces: {pendingCoins}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-3">
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
          </div>
        </div>

        {hasPurchased && lastPurchasedDevelopment ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-700 mb-2">✓ Achat effectué</div>
              <div className="text-md font-semibold text-gray-800">{lastPurchasedDevelopment.name}</div>
              <div className="text-sm text-gray-600 mt-1">{lastPurchasedDevelopment.effect}</div>
              <div className="text-xs text-gray-500 mt-2">
                Coût: {lastPurchasedDevelopment.cost} 💰 | Points: {lastPurchasedDevelopment.points} 🏆
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-600">
            Cliquez sur un développement dans le panneau de gauche pour l'acheter
          </p>
        )}
      </div>

      {/* Bouton valider en bas à droite */}
      <div className="mt-auto">
        <div className="grid grid-cols-2 gap-4">
          {hasPurchased && (
            <button
              onClick={onReset}
              className="h-16 rounded-lg font-bold text-xl text-white transition flex items-center justify-center bg-gray-500 hover:bg-orange-600 cursor-pointer"
            >
              Annuler
            </button>
          )}
          {!hasPurchased && <div></div>}
          {hasPurchased ? (
            <button
              onClick={onSkip}
              className="h-16 rounded-lg font-bold text-xl text-white transition flex items-center justify-center bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              Valider
            </button>
          ) : (
            <button
              onClick={onSkip}
              className="h-16 rounded-lg font-bold text-xl text-white transition flex items-center justify-center bg-gray-600 hover:bg-gray-700 cursor-pointer"
            >
              Passer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
