import { useState } from 'react';
import ChooseFoodOrWorkersPhase from './phases/ChooseFoodOrWorkersPhase';
import FeedPhase from './phases/FeedPhase';
import BuildPhase from './phases/BuildPhase';
import BuyPhase from './phases/BuyPhase';
import DiscardPhase from './phases/DiscardPhase';

export default function ActionPanel({
  phase,
  diceResults,
  rollCount,
  lockedDice,
  isRolling,
  onToggleLock,
  onReroll,
  onKeep,
  pendingFoodOrWorkers,
  currentPlayer,
  onChooseFoodOrWorkers,
  foodOrWorkerChoices,
  citiesToFeed,
  onFeed,
  pendingWorkers,
  onResetBuild,
  onSkipBuild,
  stoneToTradeForWorkers,
  onTradeStone,
  onResetStone,
  pendingCoins,
  onResetBuy,
  onSkipBuy,
  hasPurchased,
  selectedDevelopment,
  selectedGoods,
  selectedCoins,
  onToggleGood,
  onConfirmPurchase,
  onCancelSelection,
  calculateSelectedValue,
  lastPurchasedDevelopment,
  onDiscard,
  leadershipUsed,
  leadershipMode,
  onUseLeadership,
  onLeadershipReroll,
  onCancelLeadership,
  skullsCanBeToggled,
  granariesRate,
  foodToTradeForCoins,
  onTradeFood,
  onResetTrade
}) {
  const [foodSelected, setFoodSelected] = useState(0);

  const hasLeadership = currentPlayer.developments.indexOf('leadership') !== -1;
  const canReroll = rollCount < 2 && lockedDice && diceResults && lockedDice.length < diceResults.length;
  const canUseLeadership = hasLeadership && !leadershipUsed && rollCount >= 2;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      {phase === 'roll' && (
        <div className="flex flex-col h-full">
          <h3 className="text-xl font-bold mb-4 text-amber-800">Lancer de dés</h3>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Cliquez sur les dés en haut pour les verrouiller/déverrouiller
              </p>
              <p className="text-lg font-bold text-amber-700">
                Lancer {rollCount + 1}/3
              </p>
            </div>

            {leadershipMode ? (
              <div className="space-y-3">
                <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-3">
                  <div className="text-center text-purple-700 font-bold mb-2">
                    👑 Mode Leadership
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Déverrouillez exactement 1 dé pour le relancer
                  </p>
                </div>
                <button
                  onClick={onLeadershipReroll}
                  disabled={isRolling}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Relancer le dé sélectionné
                </button>
                <button
                  onClick={onCancelLeadership}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {canUseLeadership && (
                  <button
                    onClick={onUseLeadership}
                    disabled={isRolling}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    👑 Utiliser Leadership (relancer 1 dé)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'choose_food_or_workers' && (
        <ChooseFoodOrWorkersPhase
          pendingFoodOrWorkers={pendingFoodOrWorkers}
          currentPlayer={currentPlayer}
          onChoose={onChooseFoodOrWorkers}
          foodSelected={foodSelected}
          setFoodSelected={setFoodSelected}
          pendingWorkers={pendingWorkers}
          foodOrWorkerChoices={foodOrWorkerChoices}
        />
      )}

      {phase === 'feed' && (
        <FeedPhase
          currentPlayer={currentPlayer}
          citiesToFeed={citiesToFeed}
          onContinue={onFeed}
        />
      )}

      {phase === 'build' && (
        <BuildPhase
          currentPlayer={currentPlayer}
          pendingWorkers={pendingWorkers}
          onReset={onResetBuild}
          onSkip={onSkipBuild}
          stoneToTradeForWorkers={stoneToTradeForWorkers}
          onTradeStone={onTradeStone}
          onResetStone={onResetStone}
        />
      )}

      {phase === 'buy' && (
        <BuyPhase
          player={currentPlayer}
          pendingCoins={pendingCoins}
          onReset={onResetBuy}
          onSkip={onSkipBuy}
          hasPurchased={hasPurchased}
          selectedDevelopment={selectedDevelopment}
          selectedGoods={selectedGoods}
          selectedCoins={selectedCoins}
          onToggleGood={onToggleGood}
          onConfirmPurchase={onConfirmPurchase}
          onCancelSelection={onCancelSelection}
          calculateSelectedValue={calculateSelectedValue}
          lastPurchasedDevelopment={lastPurchasedDevelopment}
          granariesRate={granariesRate}
          foodToTradeForCoins={foodToTradeForCoins}
          onTradeFood={onTradeFood}
          onResetTrade={onResetTrade}
        />
      )}

      {phase === 'discard' && (
        <DiscardPhase
          player={currentPlayer}
          onContinue={onDiscard}
        />
      )}
    </div>
  );
}
