import { useTranslation } from 'react-i18next';
import { calculateDevelopmentCost } from '../../utils/developmentCost';

export default function ActionButtonsBar({
  phase,
  diceResults,
  rollCount,
  lockedDice,
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
  onContinueDiscard,
  preservationUsed,
  onUsePreservation,
  onRollInitial,
  playerCount = 1
}) {
  const { t } = useTranslation();

  if (phase === 'roll') {
    const hasLeadership = currentPlayer.developments.indexOf('leadership') !== -1;
    const hasPreservation = currentPlayer.developments.indexOf('preservation') !== -1;
    const hasPottery = currentPlayer.goodsPositions && currentPlayer.goodsPositions.pottery > 0;
    const hasFood = currentPlayer.food > 0;
    const canUsePreservation = hasPreservation && hasPottery && hasFood && !preservationUsed && !diceResults;
    const canReroll = rollCount < 2 && diceResults && lockedDice.length < diceResults.length;
    const canUseLeadership = hasLeadership && !leadershipUsed && rollCount >= 2;

  // Après un relance leadership, il faut forcer l'affichage du bouton Valider
  const isLastRoll = rollCount === 2 || (diceResults && lockedDice.length >= diceResults.length);
  // On ne fait plus d'auto-validation, on laisse toujours le bouton Valider visible si on n'est pas en mode leadership
  const showValidateButton = diceResults && !leadershipMode;


    if (leadershipMode) {
      return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onCancelLeadership}
            className="h-12 sm:h-16 w-full sm:w-32 bg-gray-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-600 cursor-pointer"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={onLeadershipReroll}
            className="h-12 sm:h-16 w-full sm:w-32 bg-purple-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-purple-700 transition cursor-pointer"
          >
            {t('actions.reroll')}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {canUsePreservation && (
          <button
            onClick={onUsePreservation}
            className="h-12 sm:h-16 w-full sm:w-36 bg-amber-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-amber-700 cursor-pointer whitespace-nowrap"
            title={t('actions.preservationTooltip')}
          >
            {t('actions.preservation')}
          </button>
        )}
        {!diceResults && !canUsePreservation && onRollInitial && (
          <button
            onClick={onRollInitial}
            className="h-12 sm:h-16 w-full sm:w-36 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            {t('actions.rollDice')}
          </button>
        )}
        {!diceResults && canUsePreservation && onRollInitial && (
          <button
            onClick={onRollInitial}
            className="h-12 sm:h-16 w-full sm:w-32 bg-gray-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-700 transition cursor-pointer"
          >
            {t('actions.skip')}
          </button>
        )}
        {canUseLeadership && (
          <button
            onClick={onUseLeadership}
            className="h-12 sm:h-16 w-full sm:w-32 bg-purple-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-purple-700 transition cursor-pointer whitespace-nowrap"
          >
            {t('developments.leadership')}
          </button>
        )}
        {canReroll && (
          <button
            onClick={onReroll}
            className="h-12 sm:h-16 w-full sm:w-32 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            {t('actions.reroll')}
          </button>
        )}
        {showValidateButton && (
          <button
            onClick={onKeep}
            className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 transition cursor-pointer"
          >
            {t('actions.validate')}
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
        {t('actions.validate')}
      </button>
    );
  }

  if (phase === 'feed') {
    return (
      <button
        onClick={onFeed}
        className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 cursor-pointer"
      >
        {t('common.ok')}
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
          {t('actions.cancel')}
        </button>
        <button
          onClick={onSkipBuild}
          disabled={hasWorkersRemaining}
          className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          {t('actions.validate')}
        </button>
      </div>
    );
  }

  if (phase === 'buy') {
    if (selectedDevelopment) {
      const selectedValue = calculateSelectedValue();
      const actualCost = calculateDevelopmentCost(selectedDevelopment, currentPlayer.productions, currentPlayer.monuments, playerCount);
      const canPurchase = selectedValue >= actualCost;
      return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onCancelSelection}
            className="h-12 sm:h-16 w-full sm:w-32 bg-gray-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-600 cursor-pointer"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={onConfirmPurchase}
            disabled={!canPurchase}
            className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('actions.confirm')}
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
            {t('actions.cancel')}
          </button>
        )}
        <button
          onClick={onSkipBuy}
          className="h-12 sm:h-16 w-full sm:w-32 bg-green-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-green-700 cursor-pointer"
        >
          {hasPurchased ? t('actions.validate') : t('actions.skip')}
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
        {t('actions.finish')}
      </button>
    );
  }

  return null;
}
