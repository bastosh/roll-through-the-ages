import { useState } from 'react';
import { getGoodsValue } from '../utils/gameUtils';

function DiceRollDisplay({ diceResults, rollCount, lockedDice, isRolling, onToggleLock, onReroll, onKeep, currentPlayer }) {
  const canReroll = rollCount < 2 && lockedDice.length < diceResults.length;
  const hasAgriculture = currentPlayer.developments.indexOf('agriculture') !== -1;

  function getDiceIcon(result) {
    if (!result) return '?';
    if (result.type === 'food') return '🌾';
    if (result.type === 'goods') return '📦';
    if (result.type === 'workers') return '👷';
    if (result.type === 'food_or_workers') return '🌾/👷';
    if (result.type === 'coins') return '💰';
    return '?';
  }

  function getDiceText(result) {
    if (!result) return '';
    let text = result.value.toString();
    if (result.type === 'food') {
      const foodValue = result.value + (hasAgriculture ? 1 : 0);
      text = foodValue + ' nourriture';
      if (hasAgriculture) text += ' (+Agriculture)';
    }
    if (result.type === 'goods') text = result.value + ' bien' + (result.value > 1 ? 's' : '');
    if (result.type === 'workers') text = result.value + ' ouvrier' + (result.value > 1 ? 's' : '');
    if (result.type === 'food_or_workers') text = result.value + ' nourriture OU ouvriers';
    if (result.type === 'coins') text = result.value + ' pièces';
    if (result.skulls > 0) text += ' ☠️';
    return text;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Lancer de dés</h3>

      <div className="mb-4 text-center">
        <p className="text-lg text-gray-600">Lancer {rollCount + 1}/3</p>
        <p className="text-sm text-gray-500 mt-1">
          Cliquez sur un dé pour le verrouiller/déverrouiller
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {diceResults.map(function(result, i) {
          const isLocked = lockedDice.indexOf(i) !== -1;
          const hasSkulls = result && result.skulls > 0;

          let buttonClass = 'aspect-square rounded-lg flex flex-col items-center justify-center text-4xl font-bold transition-all ';
          if (isLocked) {
            if (hasSkulls) {
              buttonClass += 'bg-red-200 border-4 border-red-400 cursor-not-allowed';
            } else {
              buttonClass += 'bg-amber-200 border-4 border-amber-500';
            }
          } else {
            buttonClass += 'bg-gray-100 border-4 border-gray-300 hover:border-amber-300';
          }

          return (
            <button
              key={i}
              onClick={() => onToggleLock(i)}
              disabled={hasSkulls}
              className={buttonClass}
            >
              {isRolling && !isLocked ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-600"></div>
                  <div className="text-xs text-gray-600 mt-2">...</div>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-1">{getDiceIcon(result)}</div>
                  <div className="text-xs text-gray-600 text-center px-1">
                    {getDiceText(result)}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {canReroll && (
          <button
            onClick={onReroll}
            disabled={isRolling}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Relancer les dés non verrouillés
          </button>
        )}
        <button
          onClick={onKeep}
          disabled={isRolling}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          Conserver et continuer
        </button>
      </div>
    </div>
  );
}

function ChooseFoodOrWorkers({ pendingFoodOrWorkers, currentPlayer, onChoose, foodSelected, setFoodSelected, pendingWorkers }) {
  const hasAgriculture = currentPlayer.developments.indexOf('agriculture') !== -1;
  const hasMasonry = currentPlayer.developments.indexOf('masonry') !== -1;

  // Chaque dé donne 2 de base
  const totalFood = foodSelected * 2 + (hasAgriculture ? foodSelected : 0);
  const totalWorkers = (pendingFoodOrWorkers - foodSelected) * 2 + (hasMasonry ? (pendingFoodOrWorkers - foodSelected) : 0);

  // Calculate cities to feed
  let citiesToFeed = 3; // Base 3 cities
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) citiesToFeed++;
  }

  const currentFood = currentPlayer.food;
  const futureFood = Math.min(currentFood + totalFood, 12);
  const foodAfterFeeding = Math.max(0, futureFood - citiesToFeed);
  const foodShortage = Math.max(0, citiesToFeed - futureFood);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Choisir nourriture ou ouvriers</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold">🌾 Nourriture</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Actuelle:</span>
              <span className="font-bold">{currentFood}</span>
            </div>
            <div className="flex justify-between">
              <span>Après récolte:</span>
              <span className="font-bold">{futureFood}</span>
            </div>
            <div className="flex justify-between">
              <span>Cités à nourrir:</span>
              <span className="font-bold">-{citiesToFeed}</span>
            </div>
            <div className={`flex justify-between border-t border-amber-200 pt-1 mt-1 font-bold ${foodShortage > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <span>Après nourrissage:</span>
              <span className="text-lg">{foodAfterFeeding}</span>
            </div>
            {foodShortage > 0 && (
              <div className="text-center text-red-600 font-semibold text-xs">
                ⚠️ Famine: -{foodShortage} pt(s)
              </div>
            )}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold">👷 Ouvriers</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Dés ouvriers:</span>
              <span className="font-bold">{pendingWorkers}</span>
            </div>
            <div className="flex justify-between">
              <span>Dés à répartir:</span>
              <span className="font-bold">+{totalWorkers}</span>
            </div>
            <div className="flex justify-between border-t border-purple-200 pt-1 mt-1 font-bold text-purple-700">
              <span>Total:</span>
              <span className="text-lg">{pendingWorkers + totalWorkers}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center mb-6 font-semibold">
        Vous avez {pendingFoodOrWorkers} dé(s) à répartir
        <span className="text-sm text-gray-600 block mt-1">(chaque dé donne 2 ressources de base)</span>
      </p>

      <div className="mb-6">
        <div className="text-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-1">👷</div>
              <div className="text-2xl font-bold text-purple-700">{totalWorkers}</div>
              {hasMasonry && (pendingFoodOrWorkers - foodSelected) > 0 && (
                <span className="text-xs text-gray-600">(+Maçonnerie)</span>
              )}
            </div>
            <input
              type="range"
              min="0"
              max={pendingFoodOrWorkers}
              value={foodSelected}
              onChange={(e) => setFoodSelected(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-1">🌾</div>
              <div className="text-2xl font-bold text-amber-700">{totalFood}</div>
              {hasAgriculture && foodSelected > 0 && (
                <span className="text-xs text-gray-600">(+Agriculture)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onChoose(foodSelected)}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 text-lg"
      >
        Valider
      </button>
    </div>
  );
}

function FeedPhase({ currentPlayer, citiesToFeed, onContinue }) {
  const foodAvailable = currentPlayer.food;
  const foodNeeded = citiesToFeed;
  const foodShortage = Math.max(0, foodNeeded - foodAvailable);
  const foodRemaining = Math.max(0, foodAvailable - foodNeeded);
  const hasFamine = foodShortage > 0;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Nourrir les cités</h3>

      <div className="bg-amber-50 rounded-lg p-6 mb-6">
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-5xl mb-2">🌾</div>
            <div className="text-sm text-gray-600">Nourriture disponible</div>
            <div className="text-3xl font-bold text-amber-700">{foodAvailable}</div>
          </div>

          <div className="flex items-center text-3xl text-gray-400">→</div>

          <div className="text-center">
            <div className="text-5xl mb-2">🏛️</div>
            <div className="text-sm text-gray-600">Cités à nourrir</div>
            <div className="text-3xl font-bold text-gray-700">{foodNeeded}</div>
          </div>
        </div>

        <div className={`text-center p-4 rounded-lg ${hasFamine ? 'bg-red-100 border-2 border-red-400' : 'bg-green-100 border-2 border-green-400'}`}>
          {hasFamine ? (
            <>
              <div className="text-4xl mb-2">⚠️</div>
              <div className="text-red-700 font-bold text-xl mb-2">Famine !</div>
              <div className="text-red-600 font-semibold">
                Vous perdrez {foodShortage} point{foodShortage > 1 ? 's' : ''}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Nourriture restante: 0
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">✅</div>
              <div className="text-green-700 font-bold text-xl mb-2">Cités nourries avec succès</div>
              <div className="text-green-600 font-semibold">
                Nourriture restante: {foodRemaining}
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
      >
        Continuer
      </button>
    </div>
  );
}

function BuildPhaseDisplay({ pendingWorkers, onReset, onSkip }) {
  const hasWorkersRemaining = pendingWorkers > 0;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Construire</h3>

      <p className="text-center mb-6">
        Ouvriers disponibles: <span className="font-bold text-2xl">{pendingWorkers}</span>
        <span className="text-sm text-gray-500 block mt-1">
          Cliquez sur les cités et monuments dans le panneau de gauche
        </span>
      </p>

      {hasWorkersRemaining && (
        <p className="text-center mb-4 text-amber-600 font-semibold">
          ⚠️ Vous devez utiliser tous vos ouvriers
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onReset}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600"
        >
          Annuler toutes les sélections
        </button>

        <button
          onClick={onSkip}
          disabled={hasWorkersRemaining}
          className={`w-full py-3 rounded-lg font-bold ${
            hasWorkersRemaining
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Terminer la construction
        </button>
      </div>
    </div>
  );
}

function BuyPhaseDisplay({ player, pendingCoins, onReset, onSkip, hasPurchased }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Acheter un développement</h3>

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

      <p className="text-center mb-6 text-gray-600">
        Cliquez sur un développement dans le panneau de gauche pour l'acheter
      </p>

      <div className="flex flex-col gap-3">
        {hasPurchased && (
          <button
            onClick={onReset}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600"
          >
            Annuler la sélection
          </button>
        )}

        {hasPurchased ? (
          <button
            onClick={onSkip}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Valider et continuer
          </button>
        ) : (
          <button
            onClick={onSkip}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700"
          >
            Ne rien acheter
          </button>
        )}
      </div>
    </div>
  );
}

function DiscardPhaseDisplay({ player, onContinue }) {
  const hasCaravans = player.developments.indexOf('caravans') !== -1;
  const totalGoods = player.goodsPositions.wood + player.goodsPositions.stone +
                     player.goodsPositions.pottery + player.goodsPositions.cloth +
                     player.goodsPositions.spearheads;
  const needsToDiscard = !hasCaravans && totalGoods > 6;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Fin du tour</h3>

      {hasCaravans ? (
        <p className="text-center mb-6 text-green-700 font-semibold">
          ✓ Caravanes: vous pouvez garder toutes vos ressources !
        </p>
      ) : (
        <div>
          <p className="text-center mb-4">
            Vous ne pouvez garder que 6 ressources maximum.
          </p>
          <p className="text-center mb-6 font-semibold">
            Ressources actuelles: {totalGoods}
          </p>
          {needsToDiscard && (
            <p className="text-red-600 text-center mb-4">
              ⚠️ Vous devez défausser {totalGoods - 6} ressource(s)
            </p>
          )}
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
      >
        Terminer le tour
      </button>
    </div>
  );
}

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
  pendingCoins,
  onResetBuy,
  onSkipBuy,
  hasPurchased,
  onDiscard
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
        <DiceRollDisplay
          diceResults={diceResults}
          rollCount={rollCount}
          lockedDice={lockedDice}
          isRolling={isRolling}
          onToggleLock={onToggleLock}
          onReroll={onReroll}
          onKeep={onKeep}
          currentPlayer={currentPlayer}
        />
      )}

      {phase === 'choose_food_or_workers' && (
        <ChooseFoodOrWorkers
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
        <BuildPhaseDisplay
          pendingWorkers={pendingWorkers}
          onReset={onResetBuild}
          onSkip={onSkipBuild}
        />
      )}

      {phase === 'buy' && (
        <BuyPhaseDisplay
          player={currentPlayer}
          pendingCoins={pendingCoins}
          onReset={onResetBuy}
          onSkip={onSkipBuy}
          hasPurchased={hasPurchased}
        />
      )}

      {phase === 'discard' && (
        <DiscardPhaseDisplay
          player={currentPlayer}
          onContinue={onDiscard}
        />
      )}
    </div>
  );
}
