import { useTranslation } from 'react-i18next';
import { handleDisasters } from '../../utils/gameUtils';
import DisasterInfo from './DisasterInfo';
export default function PhaseInfoBar({
  phase,
  currentPlayer,
  pendingWorkers,
  pendingCoins,
  citiesToFeed,
  totalGoodsCount,
  goodsValue,
  selectedDevelopment,
  hasPurchased,
  lastPurchasedDevelopment,
  stoneToTradeForWorkers,
  onTradeStone,
  onResetStone,
  foodToTradeForCoins,
  onTradeFood,
  onResetTrade,
  granariesRate,
  needsToDiscard,
  hasCaravans,
  foodOrWorkerChoices = [],
  pendingFoodOrWorkers = 0,
  calculateSelectedValue = null,
  rollCount = 0
}) {
  const { t } = useTranslation();
  const hasEngineering = currentPlayer.developments.indexOf('engineering') !== -1;
  const hasGranaries = currentPlayer.developments.indexOf('granaries') !== -1;
  const totalStoneAvailable = currentPlayer.goodsPositions.stone + stoneToTradeForWorkers;
  const totalFoodAvailable = currentPlayer.food + foodToTradeForCoins;
  const foodAvailable = currentPlayer.food;
  const foodNeeded = citiesToFeed;
  const foodShortage = Math.max(0, foodNeeded - foodAvailable);
  const foodRemaining = Math.max(0, foodAvailable - foodNeeded);
  const hasFamine = foodShortage > 0;
  const totalValue = goodsValue + pendingCoins;

    // Détection des crânes
    let skulls = 0;
    // diceResults must come from props (Game.jsx passes it)
    const diceResults = arguments.length > 0 && arguments[0]?.diceResults !== undefined ? arguments[0].diceResults : undefined;
    // But in this component, diceResults is not a prop, so we need to add it to the props and Game.jsx
    // For now, assume diceResults is passed as a prop (as in Game.jsx)
    if (typeof diceResults !== 'undefined' && Array.isArray(diceResults)) {
      for (let i = 0; i < diceResults.length; i++) {
        if (diceResults[i] && diceResults[i].skulls) {
          skulls += diceResults[i].skulls;
        }
      }
    }

    // Simuler l'effet de handleDisasters pour affichage (sans modifier l'état réel)
    let disasterInfo = null;
    if (skulls >= 2) {
      // Créer des copies pour ne pas modifier l'état réel
      const fakePlayers = [JSON.parse(JSON.stringify(currentPlayer))];
      let effect = '';
      let isAvoided = false;
      try {
        handleDisasters(fakePlayers, 0, skulls);
        if (skulls === 2) {
          const hasIrrigation = fakePlayers[0].developments.indexOf('irrigation') !== -1;
          isAvoided = hasIrrigation;
          effect = hasIrrigation
            ? t('disasterEffects.noLossIrrigation')
            : fakePlayers[0].disasters > currentPlayer.disasters
              ? t('disasterEffects.youLosePoints', { count: 2 })
              : '';
        } else if (skulls === 3) {
          const hasMedicine = currentPlayer.developments.indexOf('medicine') !== -1;
          isAvoided = hasMedicine;
          effect = t('disasterEffects.opponentsWithoutMedicine');
        } else if (skulls === 4) {
          const hasSmithing = fakePlayers[0].developments.indexOf('smithing') !== -1;
          const hasGreatWall = fakePlayers[0].monuments && fakePlayers[0].monuments.some(m => m.id === 'great_wall' && m.completed);
          isAvoided = hasSmithing || hasGreatWall;

          if (hasSmithing) {
            effect = t('disasterEffects.youInvadeOpponents');
          } else if (hasGreatWall) {
            effect = t('disasterEffects.protectedByWall');
          } else {
            effect = fakePlayers[0].disasters > currentPlayer.disasters ? t('disasterEffects.youLosePoints', { count: 4 }) : '';
          }
        } else if (skulls >= 5) {
          const hasReligion = fakePlayers[0].developments.indexOf('religion') !== -1;
          isAvoided = hasReligion;
          effect = hasReligion
            ? t('disasterEffects.opponentsWithoutReligion')
            : t('disasterEffects.youLoseAllGoods');
        }
      } catch {
        effect = '';
      }
      let label = '';
      if (skulls === 2) label = t('disasters.drought');
      else if (skulls === 3) label = t('disasters.pestilence');
      else if (skulls === 4) label = t('disasters.invasion');
      else if (skulls >= 5) label = t('disasters.revolt');
      disasterInfo = { icon: '💀'.repeat(skulls), label, effect, isAvoided };
    }

  if (phase === 'roll') {
    return (
      <div className="flex flex-row items-center gap-8">
        <div className="flex flex-col justify-center min-w-[120px]">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-amber-800">{t('phaseInfo.rollPhase')}</div>
            <div className="text-xs text-gray-700 font-bold bg-amber-100 rounded px-2 py-0.5">{t('phaseInfo.rollNumber', { number: rollCount + 1 })}</div>
          </div>
          <div className="text-xs text-gray-600 leading-tight">{t('phaseInfo.clickToLockUnlock')}</div>
        </div>
        {disasterInfo && (
          <DisasterInfo skulls={skulls} label={disasterInfo.label} effect={disasterInfo.effect} isAvoided={disasterInfo.isAvoided} />
        )}
      </div>
    );
  }

  if (phase === 'choose_food_or_workers') {
    // Calculer le nombre de dés choisis pour nourriture
    const hasAgriculture = currentPlayer.developments.indexOf('agriculture') !== -1;
    let foodDiceCount = 0;
    for (let i = 0; i < foodOrWorkerChoices.length; i++) {
      if (foodOrWorkerChoices[i] === 'food') foodDiceCount++;
    }
    const workerDiceCount = pendingFoodOrWorkers - foodDiceCount;

    // Calculer la nourriture qui sera ajoutée
    let foodToAdd = foodDiceCount * 2;
    if (hasAgriculture) {
      foodToAdd += foodDiceCount;
    }

    const futureFood = currentPlayer.food + foodToAdd;
    const futureFoodAfterFeeding = futureFood - citiesToFeed;
    const willHaveFamine = futureFoodAfterFeeding < 0;
    const faminePoints = Math.abs(Math.min(0, futureFoodAfterFeeding));

    return (
      <div className="flex items-center gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-amber-800">{t('phaseInfo.chooseFoodOrWorkers')}</div>
          <div className="text-xs text-gray-600">
            {foodOrWorkerChoices.some(c => c === 'none') ? (
              <span>{t('phaseInfo.clickDiceToChoose')}</span>
            ) : willHaveFamine ? (
              <span className="text-red-600 font-semibold">{t('phaseInfo.famineWarning', { count: faminePoints, plural: faminePoints > 1 ? 's' : '' })}</span>
            ) : (
              <span className="text-green-600 font-semibold">{t('phaseInfo.citiesFed', { remaining: futureFoodAfterFeeding })}</span>
            )}
          </div>
        </div>
        {!foodOrWorkerChoices.some(c => c === 'none') && (
          <div className="flex items-center gap-3 text-lg bg-gray-50 rounded px-3 py-1">
            <div>🌾 {futureFood}</div>
            <div className="text-gray-400">→</div>
            <div>🏛️ {citiesToFeed}</div>
            <div className="text-gray-400">=</div>
            <div className={willHaveFamine ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
              {futureFoodAfterFeeding >= 0 ? futureFoodAfterFeeding : 0}
            </div>
          </div>
        )}
        {disasterInfo && (
          <DisasterInfo skulls={skulls} label={disasterInfo.label} effect={disasterInfo.effect} isAvoided={disasterInfo.isAvoided} />
        )}
      </div>
    );
  }

  if (phase === 'feed') {
    return (
      <div className="flex items-center gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-amber-800">{t('phaseInfo.feedCities')}</div>
          <div className="text-xs text-gray-600">
            {hasFamine ? (
              <span className="text-red-600 font-semibold">{t('phaseInfo.famineWarningFeed', { count: foodShortage, plural: foodShortage > 1 ? 's' : '' })}</span>
            ) : (
              <span className="text-green-600 font-semibold">{t('phaseInfo.citiesFedSuccess', { remaining: foodRemaining })}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-lg">
          <div>🌾 {foodAvailable}</div>
          <div className="text-gray-400">→</div>
          <div>🏛️ {foodNeeded}</div>
        </div>
        {disasterInfo && (
          <DisasterInfo skulls={skulls} label={disasterInfo.label} effect={disasterInfo.effect} isAvoided={disasterInfo.isAvoided} />
        )}
      </div>
    );
  }

  if (phase === 'build') {
    return (
      <div className="flex items-center gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-amber-800">{t('phaseInfo.buildPhase')}</div>
          <div className="text-xs text-gray-600">
            {pendingWorkers > 0 ? (
              <span className="text-amber-600 font-semibold">{t('phaseInfo.useAllWorkers', { count: pendingWorkers })}</span>
            ) : (
              <span>{t('phaseInfo.clickCitiesMonuments')}</span>
            )}
          </div>
        </div>
        <div className="text-xl font-bold">
          ⚒️ {pendingWorkers}
        </div>
        {hasEngineering && (
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-400 rounded px-5 py-2">
            <div className="text-base font-semibold text-blue-700">🏗️ {t('phaseInfo.engineering')}</div>
            <div className="text-sm text-gray-600">{t('phaseInfo.stone')}</div>
            <button
              onClick={() => onTradeStone(Math.max(0, stoneToTradeForWorkers - 1))}
              disabled={stoneToTradeForWorkers <= 0}
              className="px-3 py-1 bg-blue-300 text-white text-lg rounded hover:bg-blue-400 disabled:bg-gray-200 disabled:text-gray-400"
            >–</button>
            <span className="w-12 text-center text-lg font-bold">{stoneToTradeForWorkers}</span>
            <button
              onClick={() => onTradeStone(Math.min(totalStoneAvailable, stoneToTradeForWorkers + 1))}
              disabled={stoneToTradeForWorkers >= totalStoneAvailable}
              className="px-3 py-1 bg-blue-500 text-white text-lg rounded hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400"
            >+</button>
            <div className="text-sm">→ {stoneToTradeForWorkers * 3} ⚒️</div>
            {stoneToTradeForWorkers > 0 && (
              <button
                onClick={onResetStone}
                className="px-3 py-1 bg-orange-500 text-white text-lg rounded hover:bg-orange-600 cursor-pointer ml-2"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'buy') {
    const selectedValue = selectedDevelopment && calculateSelectedValue ? calculateSelectedValue() : pendingCoins;
    const canAfford = selectedDevelopment ? selectedValue >= selectedDevelopment.cost : false;

    return (
      <div className="flex items-center gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-amber-800">
            {selectedDevelopment ? t('phaseInfo.buyDevelopmentName', { name: selectedDevelopment.name }) : t('phaseInfo.buyDevelopment')}
          </div>
          <div className="text-xs text-gray-600">
            {selectedDevelopment ? (
              <span>{t('phaseInfo.clickResourcesToAdd')}</span>
            ) : hasPurchased && lastPurchasedDevelopment ? (
              <span className="text-green-600 font-semibold">{t('phaseInfo.developmentPurchased', { name: lastPurchasedDevelopment.name })}</span>
            ) : (
              <span>{t('phaseInfo.clickDevelopmentToBuy')}</span>
            )}
          </div>
        </div>

        {selectedDevelopment ? (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-400 rounded px-3 py-1">
            <div className="text-gray-600">{t('phaseInfo.cost')}</div>
            <div className="text-lg font-bold text-gray-800">{selectedDevelopment.cost} 💰</div>
            <div className="text-gray-400">|</div>
            <div className="text-gray-600">{t('phaseInfo.committed')}</div>
            <div className={`text-lg font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              {selectedValue} 💰
            </div>
          </div>
        ) : (
          <div className="w-24 text-xl font-bold">
            💰 {totalValue} {pendingCoins > 0 && `(${pendingCoins})`}
          </div>
        )}

        {hasGranaries && !selectedDevelopment && (
          <div className="flex items-center gap-4 bg-green-50 border border-green-400 rounded px-5 py-2">
            <div className="text-base font-semibold text-green-700">🌾 {t('phaseInfo.granaries')}</div>
            <div className="text-sm text-gray-600">{t('common.food')}:</div>
            <button
              onClick={() => onTradeFood(Math.max(0, foodToTradeForCoins - 1))}
              disabled={foodToTradeForCoins <= 0}
              className="px-3 py-1 bg-green-300 text-white text-lg rounded hover:bg-green-400 disabled:bg-gray-200 disabled:text-gray-400"
            >–</button>
            <span className="w-12 text-center text-lg font-bold">{foodToTradeForCoins}</span>
            <button
              onClick={() => onTradeFood(Math.min(totalFoodAvailable, foodToTradeForCoins + 1))}
              disabled={foodToTradeForCoins >= totalFoodAvailable}
              className="px-3 py-1 bg-green-500 text-white text-lg rounded hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400"
            >+</button>
            <div className="text-sm">→ {foodToTradeForCoins * granariesRate} 💰</div>
            {foodToTradeForCoins > 0 && (
              <button
                onClick={onResetTrade}
                className="px-3 py-1 bg-orange-500 text-white text-lg rounded hover:bg-orange-600 cursor-pointer ml-2"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'smithing_invasion') {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-orange-800">{t('phaseInfo.smithingInvasionTitle')}</div>
        <div className="text-xs text-gray-600">
          <span className="text-orange-600 font-semibold">{t('phaseInfo.smithingInvasionDescription')}</span>
        </div>
      </div>
    );
  }

  if (phase === 'discard') {
    const discardCount = totalGoodsCount - 6;
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-amber-800">{t('phaseInfo.endOfTurn')}</div>
        <div className="text-xs text-gray-600">
          {hasCaravans ? (
            <span className="text-green-600 font-semibold">{t('phaseInfo.caravansKeepAll')}</span>
          ) : needsToDiscard ? (
            <span className="text-red-600 font-semibold">{t('phaseInfo.discardResources', { count: discardCount, plural: discardCount > 1 ? 's' : '' })}</span>
          ) : (
            <span className="text-green-600 font-semibold">{t('phaseInfo.respectLimit')}</span>
          )}
        </div>
      </div>
    );
  }

  return null;
}
