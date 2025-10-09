import { useState } from 'react';
import DiceRollPhase from './phases/DiceRollPhase';
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      {phase === 'roll' && !diceResults && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mb-4"></div>
          <p className="text-lg text-gray-600">Lancement des dés...</p>
        </div>
      )}

      {phase === 'roll' && diceResults && (
        <DiceRollPhase
          diceResults={diceResults}
          rollCount={rollCount}
          lockedDice={lockedDice}
          isRolling={isRolling}
          onToggleLock={onToggleLock}
          onReroll={onReroll}
          onKeep={onKeep}
          currentPlayer={currentPlayer}
          leadershipUsed={leadershipUsed}
          leadershipMode={leadershipMode}
          onUseLeadership={onUseLeadership}
          onLeadershipReroll={onLeadershipReroll}
          onCancelLeadership={onCancelLeadership}
          skullsCanBeToggled={skullsCanBeToggled}
        />
      )}

      {phase === 'choose_food_or_workers' && (
        <ChooseFoodOrWorkersPhase
          pendingFoodOrWorkers={pendingFoodOrWorkers}
          currentPlayer={currentPlayer}
          onChoose={onChooseFoodOrWorkers}
          foodSelected={foodSelected}
          setFoodSelected={setFoodSelected}
          pendingWorkers={pendingWorkers}
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
