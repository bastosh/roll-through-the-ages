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
      try {
        handleDisasters(fakePlayers, 0, skulls);
        if (skulls === 2) {
          effect = fakePlayers[0].developments.indexOf('irrigation') !== -1
            ? 'Aucune perte (Irrigation)'
            : fakePlayers[0].disasters > currentPlayer.disasters
              ? 'Vous perdez 2 points'
              : '';
        } else if (skulls === 3) {
          effect = 'Les adversaires sans Médecine perdent 3 points';
        } else if (skulls === 4) {
          effect = fakePlayers[0].monuments && fakePlayers[0].monuments.some(m => m.id === 'great_wall' && m.completed)
            ? 'Protégé par la Grande Muraille.'
            : fakePlayers[0].disasters > currentPlayer.disasters ? 'Vous perdez 4 points' : '';
        } else if (skulls >= 5) {
          effect = fakePlayers[0].developments.indexOf('religion') !== -1
            ? 'Tous les autres joueurs sans Religion perdent tous leurs biens'
            : 'Vous perdez tous vos biens';
        }
      } catch (e) {
        effect = '';
      }
      let label = '';
      if (skulls === 2) label = 'Sécheresse';
      else if (skulls === 3) label = 'Peste';
      else if (skulls === 4) label = 'Invasion';
      else if (skulls >= 5) label = 'Révolte';
      disasterInfo = { icon: '💀'.repeat(skulls), label, effect };
    }

  if (phase === 'roll') {
    return (
      <div className="flex flex-row items-center gap-8">
        <div className="flex flex-col justify-center min-w-[120px]">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-amber-800">Phase de lancer</div>
            <div className="text-xs text-gray-700 font-bold bg-amber-100 rounded px-2 py-0.5">Lancer {rollCount + 1}/3</div>
          </div>
          <div className="text-xs text-gray-600 leading-tight">Cliquez sur les dés pour les verrouiller/déverrouiller</div>
        </div>
        {disasterInfo && (
          <DisasterInfo skulls={skulls} label={disasterInfo.label} effect={disasterInfo.effect} />
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
          <div className="text-sm font-semibold text-amber-800">Choisir nourriture ou ouvriers</div>
          <div className="text-xs text-gray-600">
            {foodOrWorkerChoices.some(c => c === 'none') ? (
              <span>Cliquez sur les dés pour faire votre choix</span>
            ) : willHaveFamine ? (
              <span className="text-red-600 font-semibold">⚠️ Famine ! Vous perdrez {faminePoints} point{faminePoints > 1 ? 's' : ''}</span>
            ) : (
              <span className="text-green-600 font-semibold">✓ Cités nourries (reste: {futureFoodAfterFeeding})</span>
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
          <DisasterInfo skulls={skulls} label={disasterInfo.label} effect={disasterInfo.effect} />
        )}
      </div>
    );
  }

  if (phase === 'feed') {
    return (
      <div className="flex items-center gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-amber-800">Nourrir les cités</div>
          <div className="text-xs text-gray-600">
            {hasFamine ? (
              <span className="text-red-600 font-semibold">⚠️ Famine ! Vous perdrez {foodShortage} point{foodShortage > 1 ? 's' : ''}</span>
            ) : (
              <span className="text-green-600 font-semibold">✅ Cités nourries avec succès (reste: {foodRemaining})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-lg">
          <div>🌾 {foodAvailable}</div>
          <div className="text-gray-400">→</div>
          <div>🏛️ {foodNeeded}</div>
        </div>
        {disasterInfo && (
          <DisasterInfo skulls={skulls} label={disasterInfo.label} effect={disasterInfo.effect} />
        )}
      </div>
    );
  }

  if (phase === 'build') {
    return (
      <div className="flex items-center gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-amber-800">Phase de construction</div>
          <div className="text-xs text-gray-600">
            {pendingWorkers > 0 ? (
              <span className="text-amber-600 font-semibold">⚠️ Utilisez tous vos ouvriers ({pendingWorkers} restants)</span>
            ) : (
              <span>Cliquez sur les cités et monuments</span>
            )}
          </div>
        </div>
        <div className="text-xl font-bold">
          ⚒️ {pendingWorkers}
        </div>
        {hasEngineering && (
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-400 rounded px-5 py-2">
            <div className="text-base font-semibold text-blue-700">🏗️ Ingénierie</div>
            <div className="text-sm text-gray-600">Pierre:</div>
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
            {selectedDevelopment ? `Acheter: ${selectedDevelopment.name}` : 'Acheter un développement'}
          </div>
          <div className="text-xs text-gray-600">
            {selectedDevelopment ? (
              <span>Cliquez sur les ressources pour les ajouter</span>
            ) : hasPurchased && lastPurchasedDevelopment ? (
              <span className="text-green-600 font-semibold">✓ {lastPurchasedDevelopment.name} acheté</span>
            ) : (
              <span>Cliquez sur un développement pour l'acheter</span>
            )}
          </div>
        </div>

        {selectedDevelopment ? (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-400 rounded px-3 py-1">
            <div className="text-gray-600">Coût:</div>
            <div className="text-lg font-bold text-gray-800">{selectedDevelopment.cost} 💰</div>
            <div className="text-gray-400">|</div>
            <div className="text-gray-600">Engagé:</div>
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
            <div className="text-base font-semibold text-green-700">🌾 Greniers</div>
            <div className="text-sm text-gray-600">Nourriture:</div>
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

  if (phase === 'discard') {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-amber-800">Fin du tour</div>
        <div className="text-xs text-gray-600">
          {hasCaravans ? (
            <span className="text-green-600 font-semibold">✓ Caravanes: vous pouvez garder toutes vos ressources</span>
          ) : needsToDiscard ? (
            <span className="text-red-600 font-semibold">⚠️ Défaussez {totalGoodsCount - 6} ressource(s) (limite: 6)</span>
          ) : (
            <span className="text-green-600 font-semibold">✓ Vous respectez la limite de 6 ressources</span>
          )}
        </div>
      </div>
    );
  }

  return null;
}
