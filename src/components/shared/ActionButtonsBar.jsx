export default function ActionButtonsBar({
  phase,
  diceResults,
  rollCount,
  lockedDice,
  isRolling,
  onReroll,
  onKeep,
  leadershipUsed,
  leadershipMode,
  onUseLeadership,
  onLeadershipReroll,
  onCancelLeadership,
  currentPlayer,
  foodOrWorkerChoices,
  onValidateFoodOrWorkers,
  onFeed,
  pendingWorkers,
  onResetBuild,
  onSkipBuild,
  hasPurchased,
  onResetBuy,
  onSkipBuy,
  selectedDevelopment,
  onCancelSelection,
  onConfirmPurchase,
  calculateSelectedValue,
  canContinueDiscard,
  onContinueDiscard
}) {
  if (phase === 'roll') {
    const hasLeadership = currentPlayer.developments.indexOf('leadership') !== -1;
    const canReroll = rollCount < 2 && diceResults && lockedDice.length < diceResults.length;
    const canUseLeadership = hasLeadership && !leadershipUsed && rollCount >= 2;
    const isLastRoll = rollCount === 2 || (diceResults && lockedDice.length >= diceResults.length);
    const willAutoValidate = isLastRoll && !canUseLeadership;

    if (leadershipMode) {
      return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onCancelLeadership}
            className="h-12 sm:h-16 w-full sm:w-32 bg-gray-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-600 cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onLeadershipReroll}
            disabled={isRolling}
            className="h-12 sm:h-16 w-full sm:w-32 bg-purple-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Relancer
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {canUseLeadership && (
          <button
            onClick={onUseLeadership}
            disabled={isRolling}
            className="h-12 sm:h-16 w-full sm:w-32 bg-purple-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition cursor-pointer whitespace-nowrap"
          >
            Leadership
          </button>
        )}
        {canReroll && (
          <button
            onClick={onReroll}
            disabled={isRolling}
            className="h-12 sm:h-16 w-full sm:w-32 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Relancer
          </button>
        )}
        {diceResults && !willAutoValidate && (
          <button
            onClick={onKeep}
            disabled={isRolling}
            className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Valider
          </button>
        )}
      </div>
    );
  }

  if (phase === 'choose_food_or_workers') {
    const allChoicesMade = foodOrWorkerChoices && !foodOrWorkerChoices.some(c => c === 'none');
    return (
      <button
        onClick={onValidateFoodOrWorkers}
        disabled={!allChoicesMade}
        className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
      >
        Valider
      </button>
    );
  }

  if (phase === 'feed') {
    return (
      <button
        onClick={onFeed}
        className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 cursor-pointer"
      >
        OK
      </button>
    );
  }

  if (phase === 'build') {
    const hasWorkersRemaining = pendingWorkers > 0;
    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          onClick={onResetBuild}
          className="h-12 sm:h-16 w-full sm:w-32 bg-gray-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-600 cursor-pointer"
        >
          Annuler
        </button>
        <button
          onClick={onSkipBuild}
          disabled={hasWorkersRemaining}
          className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Valider
        </button>
      </div>
    );
  }

  if (phase === 'buy') {
    if (selectedDevelopment) {
      const selectedValue = calculateSelectedValue();
      const canPurchase = selectedValue >= selectedDevelopment.cost;
      return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onCancelSelection}
            className="h-12 sm:h-16 w-full sm:w-32 bg-gray-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-600 cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmPurchase}
            disabled={!canPurchase}
            className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            Confirmer
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {hasPurchased && (
          <button
            onClick={onResetBuy}
            className="h-12 sm:h-16 w-full sm:w-32 bg-gray-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-600 cursor-pointer"
          >
            Annuler
          </button>
        )}
        <button
          onClick={onSkipBuy}
          className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 cursor-pointer"
        >
          {hasPurchased ? 'Valider' : 'Passer'}
        </button>
      </div>
    );
  }

  if (phase === 'discard') {
    return (
      <button
        onClick={onContinueDiscard}
        disabled={!canContinueDiscard}
        className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
      >
        Terminer
      </button>
    );
  }

  return null;
}
