import { useState } from 'react';
import { getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';
import { GOODS_TYPES, GOODS_NAMES, GOODS_COLORS, GOODS_VALUES } from '../constants/gameData';

function DiceRollDisplay({ diceResults, rollCount, lockedDice, isRolling, onToggleLock, onReroll, onKeep, currentPlayer, leadershipUsed, leadershipMode, onUseLeadership, onLeadershipReroll, onCancelLeadership, skullsCanBeToggled }) {
  const canReroll = rollCount < 2 && lockedDice.length < diceResults.length;
  const hasAgriculture = currentPlayer.developments.indexOf('agriculture') !== -1;
  const hasMasonry = currentPlayer.developments.indexOf('masonry') !== -1;
  const hasLeadership = currentPlayer.developments.indexOf('leadership') !== -1;
  const canUseLeadership = hasLeadership && !leadershipUsed && rollCount >= 2;

  // Compter les crânes
  let totalSkulls = 0;
  for (let i = 0; i < diceResults.length; i++) {
    if (diceResults[i] && diceResults[i].skulls) {
      totalSkulls += diceResults[i].skulls;
    }
  }

  // Déterminer le type de catastrophe
  let disasterType = null;
  let disasterMessage = '';
  let disasterAffected = '';

  if (totalSkulls === 2) {
    disasterType = 'drought';
    const hasIrrigation = currentPlayer.developments.indexOf('irrigation') !== -1;
    if (hasIrrigation) {
      disasterMessage = 'Sécheresse évitée grâce à l\'Irrigation';
      disasterAffected = 'protected';
    } else {
      disasterMessage = 'Sécheresse !';
      disasterAffected = 'Vous perdez 2 points';
    }
  } else if (totalSkulls === 3) {
    disasterType = 'plague';
    const hasMedicine = currentPlayer.developments.indexOf('medicine') !== -1;
    if (hasMedicine) {
      disasterMessage = 'Peste évitée grâce à la Médecine';
      disasterAffected = 'Les autres joueurs perdent 3 points';
    } else {
      disasterMessage = 'Peste !';
      disasterAffected = 'Les autres joueurs non protégés perdent 3 points';
    }
  } else if (totalSkulls === 4) {
    disasterType = 'invasion';
    let hasGreatWall = false;
    for (let i = 0; i < currentPlayer.monuments.length; i++) {
      if (currentPlayer.monuments[i].id === 'great_wall' && currentPlayer.monuments[i].completed) {
        hasGreatWall = true;
        break;
      }
    }
    if (hasGreatWall) {
      disasterMessage = 'Invasion repoussée par la Grande Muraille';
      disasterAffected = 'protected';
    } else {
      disasterMessage = 'Invasion !';
      disasterAffected = 'Vous perdez 4 points';
    }
  } else if (totalSkulls >= 5) {
    disasterType = 'revolt';
    const hasReligion = currentPlayer.developments.indexOf('religion') !== -1;
    if (hasReligion) {
      disasterMessage = 'Révolte évitée grâce à la Religion';
      disasterAffected = 'Les autres joueurs perdent toutes leurs ressources';
    } else {
      disasterMessage = 'Révolte !';
      disasterAffected = 'Vous perdez toutes vos ressources';
    }
  }

  function getDiceIcon(result) {
    if (!result) return '?';

    let mainIcon = '';

    if (result.type === 'food') {
      const foodValue = result.value + (hasAgriculture ? 1 : 0);
      mainIcon = '🌾'.repeat(foodValue);
    } else if (result.type === 'goods') {
      if (result.skulls > 0 && result.value === 2) {
        // Pour le dé goods + crâne : amphore, crâne, amphore
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

  function getDiceText(result) {
    if (!result) return '';
    let text = result.value.toString();
    if (result.type === 'food') {
      const foodValue = result.value + (hasAgriculture ? 1 : 0);
      text = foodValue + ' nourriture';
      if (hasAgriculture) text += ' (agriculture)';
    }
    if (result.type === 'goods') text = result.value + ' bien' + (result.value > 1 ? 's' : '');
    if (result.type === 'workers') {
      const workersValue = result.value + (hasMasonry ? 1 : 0);
      text = workersValue + ' ouvrier' + (workersValue > 1 ? 's' : '');
      if (hasMasonry) text += ' (maçonnerie)';
    }
    if (result.type === 'food_or_workers') {
      const foodValue = result.value + (hasAgriculture ? 1 : 0);
      const workersValue = result.value + (hasMasonry ? 1 : 0);
      text = foodValue + ' nourriture OU ' + workersValue + ' ouvriers';
      const bonuses = [];
      if (hasAgriculture) bonuses.push('agriculture');
      if (hasMasonry) bonuses.push('maçonnerie');
      if (bonuses.length > 0) text += ' (' + bonuses.join(', ') + ')';
    }
    if (result.type === 'coins') text = result.value + ' pièces';
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

      {disasterType && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          disasterAffected === 'protected'
            ? 'bg-green-50 border-green-400'
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {disasterAffected === 'protected' ? '🛡️' : '☠️'}
            </div>
            <div className={`text-lg font-bold mb-1 ${
              disasterAffected === 'protected' ? 'text-green-700' : 'text-red-700'
            }`}>
              {disasterMessage}
            </div>
            <div className="text-sm text-gray-600">
              {disasterAffected !== 'protected' && disasterAffected}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {diceResults.map(function(result, i) {
          const isLocked = lockedDice.indexOf(i) !== -1;
          const hasSkulls = result && result.skulls > 0;

          let buttonClass = 'aspect-square rounded-lg flex flex-col items-center justify-center text-4xl font-bold transition-all ';
          if (isLocked) {
            if (hasSkulls) {
              // Si les crânes peuvent être basculés, montrer comme cliquable
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
        {leadershipMode ? (
          <>
            <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-3 mb-2">
              <div className="text-center text-purple-700 font-bold mb-2">
                👑 Mode Leadership
              </div>
              <p className="text-sm text-gray-600 text-center">
                Déverrouillez exactement 1 dé (sans crâne) pour le relancer
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
          </>
        ) : (
          <>
            {canReroll && (
              <button
                onClick={onReroll}
                disabled={isRolling}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Relancer les dés non verrouillés
              </button>
            )}
            {canUseLeadership && (
              <button
                onClick={onUseLeadership}
                disabled={isRolling}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
              >
                👑 Utiliser Leadership (relancer 1 dé)
              </button>
            )}
            <button
              onClick={onKeep}
              disabled={isRolling}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
            >
              Conserver et continuer
            </button>
          </>
        )}
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
  const futureFood = Math.min(currentFood + totalFood, 15);
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
          <div className="text-xs text-gray-600 mb-2 font-semibold">⚒️ Ouvriers</div>
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
              <div className="text-4xl mb-1">⚒️</div>
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
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 text-lg cursor-pointer"
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
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 cursor-pointer"
      >
        Continuer
      </button>
    </div>
  );
}

function BuildPhaseDisplay({ currentPlayer, pendingWorkers, onReset, onSkip, stoneToTradeForWorkers, onTradeStone, onResetStone }) {
  const hasWorkersRemaining = pendingWorkers > 0;
  const hasEngineering = currentPlayer.developments.indexOf('engineering') !== -1;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Construire</h3>

      {hasEngineering && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-4">
          <div className="text-center mb-3">
            <div className="text-sm font-bold text-blue-700 mb-2">🏗️ Ingénierie</div>
            <div className="text-xs text-gray-600 mb-2">
              Échangez de la pierre contre 3 ouvriers/unité
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-sm">
                Pierre: <span className="font-bold">{currentPlayer.goodsPositions.stone}</span>
              </div>
              <input
                type="number"
                min="0"
                max={currentPlayer.goodsPositions.stone}
                value={stoneToTradeForWorkers}
                onChange={(e) => onTradeStone(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border-2 border-blue-400 rounded text-center font-bold"
              />
              <div className="text-sm">
                → <span className="font-bold text-purple-600">{stoneToTradeForWorkers * 3} ⚒️</span>
              </div>
            </div>
            {stoneToTradeForWorkers > 0 && (
              <button
                onClick={onResetStone}
                className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 cursor-pointer"
              >
                Annuler l'échange
              </button>
            )}
          </div>
        </div>
      )}

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
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 cursor-pointer"
        >
          Annuler toutes les sélections
        </button>

        <button
          onClick={onSkip}
          disabled={hasWorkersRemaining}
          className={`w-full py-3 rounded-lg font-bold ${
            hasWorkersRemaining
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer'
          }`}
        >
          Terminer la construction
        </button>
      </div>
    </div>
  );
}

function BuyPhaseDisplay({ player, pendingCoins, onReset, onSkip, hasPurchased, selectedDevelopment, selectedGoods, selectedCoins, onToggleGood, onConfirmPurchase, onCancelSelection, calculateSelectedValue, lastPurchasedDevelopment, granariesRate, foodToTradeForCoins, onTradeFood, onResetTrade }) {
  const totalGoods = getTotalGoodsCount(player.goodsPositions);
  const goodsValue = getGoodsValue(player.goodsPositions);
  const totalValue = goodsValue + pendingCoins;
  const hasGranaries = player.developments.indexOf('granaries') !== -1;

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
              const maxForType = GOODS_VALUES[type].length - 1;

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
                  <div className="flex-1 flex gap-1">
                    {GOODS_VALUES[type].map(function(val, idx) {
                      if (idx === 0) return null;

                      const isFilled = idx <= position;
                      const showEmptyBox = idx > position;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={'w-5 h-6 border-2 rounded transition ' + (
                              showEmptyBox ? 'bg-white border-gray-300' :
                              isUsed ? 'bg-white border-gray-400' :
                              GOODS_COLORS[type] + ' border-gray-700'
                            )}
                          />
                          <div className={'text-xs mt-0.5 ' + (showEmptyBox ? 'text-gray-400' : 'text-gray-500')}>
                            {val}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Acheter un développement</h3>

      {hasGranaries && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-4">
          <div className="text-center mb-3">
            <div className="text-sm font-bold text-green-700 mb-2">🌾 Greniers</div>
            <div className="text-xs text-gray-600 mb-2">
              Échangez de la nourriture contre {granariesRate} pièces/unité
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-sm">
                Nourriture: <span className="font-bold">{player.food}</span>
              </div>
              <input
                type="number"
                min="0"
                max={player.food}
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
                  <div className="flex-1 flex gap-1">
                    {GOODS_VALUES[type].map(function(val, idx) {
                      if (idx === 0) return null;
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={'w-5 h-6 border-2 border-gray-400 rounded ' + (
                              idx <= position ? GOODS_COLORS[type] : 'bg-white'
                            )}
                            title={val.toString()}
                          />
                          <div className="text-xs text-gray-500 mt-0.5">{val}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs font-bold w-8 text-right">{value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hasPurchased && lastPurchasedDevelopment ? (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
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
        <p className="text-center mb-4 text-sm text-gray-600">
          Cliquez sur un développement dans le panneau de gauche pour l'acheter
        </p>
      )}

      <div className="flex flex-col gap-3">
        {hasPurchased && (
          <button
            onClick={onReset}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 cursor-pointer"
          >
            Annuler la sélection
          </button>
        )}

        {hasPurchased ? (
          <button
            onClick={onSkip}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 cursor-pointer"
          >
            Valider et continuer
          </button>
        ) : (
          <button
            onClick={onSkip}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 cursor-pointer"
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
  const totalGoods = getTotalGoodsCount(player.goodsPositions);
  const goodsValue = getGoodsValue(player.goodsPositions);
  const needsToDiscard = !hasCaravans && totalGoods > 6;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Fin du tour</h3>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
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
                <div className="flex-1 flex gap-1">
                  {GOODS_VALUES[type].map(function(val, idx) {
                    if (idx === 0) return null;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={'w-5 h-6 border-2 border-gray-400 rounded ' + (
                            idx <= position ? GOODS_COLORS[type] : 'bg-white'
                          )}
                          title={val.toString()}
                        />
                        <div className="text-xs text-gray-500 mt-0.5">{val}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs font-bold w-8 text-right">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2 font-semibold">Valeur totale: {goodsValue} pièces</div>
      </div>

      {hasCaravans ? (
        <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-400">
          <p className="text-center text-green-700 font-semibold">
            ✓ Caravanes: vous pouvez garder toutes vos ressources !
          </p>
        </div>
      ) : (
        <div>
          {needsToDiscard ? (
            <div className="bg-red-50 rounded-lg p-4 mb-4 border-2 border-red-400">
              <p className="text-center text-red-700 font-semibold mb-2">
                ⚠️ Limite de 6 ressources dépassée
              </p>
              <p className="text-center text-red-600">
                Vous devez défausser {totalGoods - 6} ressource(s)
              </p>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-400">
              <p className="text-center text-green-700 font-semibold">
                ✓ Vous respectez la limite de 6 ressources
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 cursor-pointer"
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
        <DiceRollDisplay
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
        <BuyPhaseDisplay
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
        <DiscardPhaseDisplay
          player={currentPlayer}
          onContinue={onDiscard}
        />
      )}
    </div>
  );
}
