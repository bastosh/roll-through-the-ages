import DiceDisplay from './DiceDisplay';

/**
 * Composant pour la barre d'affichage des dés avec info de phase et boutons d'action
 */
export default function DiceBar({
  diceResults,
  lockedDice,
  phase,
  foodOrWorkerChoices,
  leadershipMode,
  isSoloMode,
  variantConfig,
  onToggleLock,
  onToggleFoodOrWorker,
  canUsePreservation
}) {
  if (!diceResults && phase !== 'roll' && phase !== 'choose_food_or_workers') {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto p-1 justify-center sm:justify-start">
      {diceResults ? (
        diceResults.map(function(result, i) {
          const isLocked = lockedDice.indexOf(i) !== -1;
          const hasSkulls = result && result.skulls > 0;
          const canToggle = phase === 'roll' && (!hasSkulls || (leadershipMode || (isSoloMode && !variantConfig.soloSkullsLocked)));

          // Check if this is a food_or_workers die in choose phase
          let foodOrWorkerIndex = -1;
          let foodOrWorkerChoice = undefined;

          if (phase === 'choose_food_or_workers' && result.type === 'food_or_workers') {
            // Find which food_or_worker die this is
            let count = 0;
            for (let j = 0; j <= i; j++) {
              if (diceResults[j].type === 'food_or_workers') {
                if (j === i) {
                  foodOrWorkerIndex = count;
                  break;
                }
                count++;
              }
            }
            if (foodOrWorkerIndex !== -1 && foodOrWorkerChoices && foodOrWorkerIndex < foodOrWorkerChoices.length) {
              foodOrWorkerChoice = foodOrWorkerChoices[foodOrWorkerIndex];
            }
          }

          const isClickable = foodOrWorkerIndex !== -1;

          return (
            <DiceDisplay
              key={i}
              result={result}
              index={i}
              isLocked={isLocked}
              canToggle={canToggle}
              isClickable={isClickable}
              foodOrWorkerIndex={foodOrWorkerIndex}
              foodOrWorkerChoice={foodOrWorkerChoice}
              onToggleLock={onToggleLock}
              onToggleFoodOrWorker={onToggleFoodOrWorker}
              leadershipMode={leadershipMode}
            />
          );
        })
      ) : canUsePreservation ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Utilisez Conservation ou passez pour lancer les dés</span>
        </div>
      ) : null}
    </div>
  );
}
