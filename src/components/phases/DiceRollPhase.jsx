import { useTranslation } from 'react-i18next';
import DisasterWarning from '../shared/DisasterWarning';
import { getDiceText as getTranslatedDiceText } from '../../utils/diceTextHelpers';

function getDiceIcon(result, hasAgriculture, hasMasonry) {
  if (!result) return '?';

  let mainIcon = '';

  if (result.type === 'food') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    mainIcon = '🌾'.repeat(foodValue);
  } else if (result.type === 'goods') {
    if (result.skulls > 0 && result.value === 2) {
      return '🏺☠️🏺';
    }
    mainIcon = '🏺'.repeat(result.value);
  } else if (result.type === 'workers') {
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    mainIcon = '⚒️'.repeat(workersValue);
  } else if (result.type === 'food_or_workers') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    mainIcon = '🌾'.repeat(foodValue) + '/' + '⚒️'.repeat(workersValue);
  } else if (result.type === 'coins') {
    mainIcon = '💰';
  } else {
    mainIcon = '?';
  }

  if (result.skulls > 0 && result.type !== 'goods') {
    const skullIcon = '☠️'.repeat(result.skulls);
    return mainIcon + ' ' + skullIcon;
  }

  return mainIcon;
}

export default function DiceRollPhase({
  diceResults,
  rollCount,
  lockedDice,
  isRolling,
  onToggleLock,
  onReroll,
  onKeep,
  currentPlayer,
  leadershipUsed,
  leadershipMode,
  onUseLeadership,
  onLeadershipReroll,
  onCancelLeadership,
  skullsCanBeToggled,
  isRollPhase = true
}) {
  const { t } = useTranslation();
  const canReroll = rollCount < 2 && lockedDice.length < diceResults.length;
  const hasAgriculture = currentPlayer.developments.indexOf('agriculture') !== -1;
  const hasMasonry = currentPlayer.developments.indexOf('masonry') !== -1;
  const hasLeadership = currentPlayer.developments.indexOf('leadership') !== -1;
  const hasCoinage = currentPlayer.developments.indexOf('coinage') !== -1;
  const canUseLeadership = hasLeadership && !leadershipUsed && rollCount >= 2;

  // Compter les crânes
  let totalSkulls = 0;
  for (let i = 0; i < diceResults.length; i++) {
    if (diceResults[i] && diceResults[i].skulls) {
      totalSkulls += diceResults[i].skulls;
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Titre en haut */}
      <h3 className="text-xl font-bold mb-4 text-amber-800">{t('game.phaseRoll')}</h3>

      {/* Contenu principal centré */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-4 text-center">
          <p className="text-lg text-gray-600">{t('game.rollCount', { current: rollCount + 1, total: 3 })}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('game.clickToLockUnlock')}
          </p>
        </div>

        <DisasterWarning totalSkulls={totalSkulls} currentPlayer={currentPlayer} />

        <div className="grid grid-cols-3 gap-3 mb-4">
          {diceResults.map(function(result, i) {
            const isLocked = lockedDice.indexOf(i) !== -1;
            const hasSkulls = result && result.skulls > 0;

            let buttonClass = 'aspect-square rounded-lg flex flex-col items-center justify-center text-4xl font-bold transition-all ';
            if (isLocked) {
              if (hasSkulls) {
                if (skullsCanBeToggled) {
                  buttonClass += 'bg-red-200 border-4 border-red-400 cursor-pointer hover:border-red-600';
                } else {
                  buttonClass += 'bg-red-200 border-4 border-red-400 cursor-not-allowed';
                }
              } else {
                buttonClass += 'bg-amber-200 border-4 border-amber-500 cursor-pointer';
              }
            } else {
              buttonClass += 'bg-gray-100 border-4 border-gray-300 hover:border-amber-300 cursor-pointer';
            }

            return (
              <button
                key={i}
                onClick={() => onToggleLock(i)}
                disabled={hasSkulls && !skullsCanBeToggled}
                className={buttonClass}
              >
                {isRolling && !isLocked ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-600"></div>
                    <div className="text-xs text-gray-600 mt-2">...</div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-1">{getDiceIcon(result, hasAgriculture, hasMasonry)}</div>
                    <div className="text-xs text-gray-600 text-center px-1">
                      {getTranslatedDiceText(result, hasAgriculture, hasMasonry, hasCoinage, t)}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Boutons de relance au milieu - seulement en phase roll */}
        {isRollPhase && (leadershipMode ? (
          <div className="space-y-3">
            <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-3">
              <div className="text-center text-purple-700 font-bold mb-2">
                👑 {t('game.useLeadership')}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {t('game.clickToLockUnlock')}
              </p>
            </div>
            <button
              onClick={onLeadershipReroll}
              disabled={isRolling}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
            >
              {t('game.leadershipReroll')}
            </button>
            <button
              onClick={onCancelLeadership}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 cursor-pointer"
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {canReroll && (
              <button
                onClick={onReroll}
                disabled={isRolling}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
              >
                {t('game.reroll')}
              </button>
            )}
            {canUseLeadership && (
              <button
                onClick={onUseLeadership}
                disabled={isRolling}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
              >
                👑 {t('game.useLeadership')}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bouton valider en bas à droite - seulement en phase roll */}
      {isRollPhase && !leadershipMode && (
        <div className="mt-auto">
          <div className="grid grid-cols-2 gap-4">
            <div></div>
            <button
              onClick={onKeep}
              disabled={isRolling}
              className="h-24 rounded-lg font-bold text-xl text-white transition flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {t('actions.validate')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
