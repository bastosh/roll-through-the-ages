import { useState, useEffect, useMemo } from 'react';
import { getVariantById } from '../constants/variants';
import { getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';
import { addScore } from '../utils/scoreHistory';
import { calculatePlayerScore } from '../utils/scoring';
import { useDiceRolling } from '../hooks/useDiceRolling';
import { useBuildPhase } from '../hooks/useBuildPhase';
import { useBuyPhase } from '../hooks/useBuyPhase';
import { useFoodOrWorkersPhase } from '../hooks/useFoodOrWorkersPhase';
import { useDiscardPhase } from '../hooks/useDiscardPhase';
import { feedCities, processRollResults } from '../utils/phaseHandlers';
import PlayerScorePanel from './PlayerScorePanel';
import PhaseInfoBar from './shared/PhaseInfoBar';
import ActionButtonsBar from './shared/ActionButtonsBar';
import DisasterHelp from './shared/DisasterHelp';
import PlayerTurnModal from './PlayerTurnModal';
import DiceBar from './DiceBar';
import GameHeader from './GameHeader';
import GameEndScreen from './GameEndScreen';

export default function Game({ playerNames, variantId, isSoloMode, savedGameState }) {
  // Load variant configuration
  const variantConfig = useMemo(function() {
    return getVariantById(variantId);
  }, [variantId]);

  const MONUMENTS = variantConfig.monuments;
  const DEVELOPMENTS = variantConfig.developments;

  const [players, setPlayers] = useState(function() {
    // If there's a saved game state, use it
    if (savedGameState && savedGameState.players) {
      return savedGameState.players;
    }

    // Otherwise, initialize new game
    // Shuffle player order for multiplayer
    let orderedNames = playerNames;
    if (!isSoloMode && playerNames.length > 1) {
      orderedNames = [...playerNames];
      for (let i = orderedNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [orderedNames[i], orderedNames[j]] = [orderedNames[j], orderedNames[i]];
      }
    }

    return orderedNames.map(function(name, i) {
      // Déterminer quels monuments sont disponibles selon le nombre de joueurs
      const numPlayers = playerNames.length;
      const excludedMonuments = variantConfig.monumentRestrictions[numPlayers] || [];

      const monuments = [];
      for (let j = 0; j < MONUMENTS.length; j++) {
        if (excludedMonuments.indexOf(MONUMENTS[j].id) === -1) {
          monuments.push({ id: MONUMENTS[j].id, progress: 0, completed: false, firstToComplete: false });
        }
      }

      const cities = [];
      for (let j = 0; j < 4; j++) {
        const cityWorkers = [3, 4, 5, 6];
        cities.push({ built: false, progress: 0, requiredWorkers: cityWorkers[j] });
      }

      return {
        name: name,
        isStartPlayer: i === 0,
        food: 3,
        goodsPositions: { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 },
        cities: cities,
        monuments: monuments,
        developments: [],
        disasters: 0,
        score: 0
      };
    });
  });

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(savedGameState?.currentPlayerIndex ?? 0);
  const [round, setRound] = useState(savedGameState?.round ?? 1);
  const [soloTurn, setSoloTurn] = useState(savedGameState?.soloTurn ?? (isSoloMode ? 1 : 0));
  const [phase, setPhase] = useState(savedGameState?.phase ?? 'roll');
  const [pendingWorkers, setPendingWorkers] = useState(savedGameState?.pendingWorkers ?? 0);
  const [pendingFoodOrWorkers, setPendingFoodOrWorkers] = useState(savedGameState?.pendingFoodOrWorkers ?? 0);
  const [pendingCoins, setPendingCoins] = useState(savedGameState?.pendingCoins ?? 0);
  const [gameEnded, setGameEnded] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [gameEndTriggered, setGameEndTriggered] = useState(savedGameState?.gameEndTriggered ?? false);
  const [showPlayerTurnModal, setShowPlayerTurnModal] = useState(!isSoloMode && playerNames.length > 1 && !savedGameState);

  const currentPlayer = players[currentPlayerIndex];
  let numDice = 3;
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) numDice++;
  }

  // Use dice rolling hook
  const diceHook = useDiceRolling(numDice, isSoloMode, variantConfig, currentPlayer, processResults, savedGameState);
  const {
    diceResults,
    rollCount,
    lockedDice,
    isRolling,
    rollingDice,
    leadershipUsed,
    leadershipMode,
    rollDice,
    toggleLock,
    handleReroll,
    handleUseLeadership,
    handleLeadershipReroll,
    handleCancelLeadership,
    resetForNewTurn,
    setDiceResults
  } = diceHook;

  // Use build phase hook
  const buildPhaseHook = useBuildPhase();
  const {
    buildPhaseInitialState,
    stoneToTradeForWorkers,
    initializeBuildPhase,
    buildCity,
    buildMonument,
    checkAllMonumentsBuilt,
    resetBuild,
    canSkipBuild,
    tradeStone,
    resetStone,
    resetPhase: resetBuildPhase
  } = buildPhaseHook;

  // Use buy phase hook
  const buyPhaseHook = useBuyPhase();
  const {
    selectedDevelopmentToBuy,
    selectedGoodsForPurchase,
    coinsForPurchase,
    originalGoodsPositions,
    lastPurchasedDevelopment,
    foodToTradeForCoins,
    selectDevelopment,
    autoBuyDevelopment,
    toggleGoodForPurchase,
    calculateSelectedValue,
    confirmPurchase,
    cancelPurchaseSelection,
    resetBuy: resetBuyPhase,
    tradeFood,
    resetTrade,
    resetPhase: resetBuyPhaseState
  } = buyPhaseHook;

  // Use food or workers phase hook
  const foodOrWorkersHook = useFoodOrWorkersPhase();
  const {
    foodOrWorkerChoices,
    initializeChoices,
    toggleChoice,
    validateChoices,
    reset: resetFoodOrWorkersPhase
  } = foodOrWorkersHook;

  // Use discard phase hook
  const discardPhaseHook = useDiscardPhase();
  const {
    tempGoodsPositions,
    initializeDiscard,
    discardGood,
    confirmDiscard,
    resetPhase: resetDiscardPhase
  } = discardPhaseHook;

  // Get Granaries exchange rate from development effect
  function getGranariesRate() {
    const granariesDev = DEVELOPMENTS.find(d => d.id === 'granaries');
    if (!granariesDev) return 4; // Default fallback
    // Extract number from effect like "Échangez 1 nourriture contre 4 pièces"
    const match = granariesDev.effect.match(/(\d+)\s+pièces/);
    return match ? parseInt(match[1]) : 4;
  }

  function handleToggleTestMode() {
    const newTestMode = !testMode;
    setTestMode(newTestMode);

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    if (newTestMode) {
      // Add all developments
      const allDevIds = DEVELOPMENTS.map(d => d.id);
      player.developments = allDevIds;
    } else {
      // Remove all developments
      player.developments = [];
    }

    setPlayers(newPlayers);
  }

  // Auto-roll dice when entering roll phase (but not on initial load from saved state)
  useEffect(function() {
    if (phase === 'roll' && !diceResults && !savedGameState) {
      rollDice(true, 0);
    }
  }, [phase]);

  function handleKeep() {
    processResults(diceResults);
  }

  function processResults(results) {
    const result = processRollResults(
      results,
      players[currentPlayerIndex],
      currentPlayerIndex,
      players
    );

    setPlayers(result.players);
    setPendingWorkers(result.pendingWorkers);
    setPendingFoodOrWorkers(result.pendingFoodOrWorkers);
    setPendingCoins(result.pendingCoins);

    if (result.foodOrWorkerChoicesCount > 0) {
      initializeChoices(result.foodOrWorkerChoicesCount);
    }

    setPhase(result.nextPhase);
  }

  function handleToggleFoodOrWorkerDie(dieIndex) {
    toggleChoice(dieIndex);
  }

  function handleValidateFoodOrWorkers() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const hasAgriculture = player.developments.indexOf('agriculture') !== -1;
    const hasMasonry = player.developments.indexOf('masonry') !== -1;

    const result = validateChoices(player, pendingWorkers, hasAgriculture, hasMasonry);

    // Transform food_or_workers dice to show the actual choice
    const newDiceResults = [...diceResults];
    let choiceIndex = 0;
    for (let i = 0; i < newDiceResults.length; i++) {
      if (newDiceResults[i].type === 'food_or_workers') {
        const choice = foodOrWorkerChoices[choiceIndex];
        if (choice === 'food') {
          newDiceResults[i] = { type: 'food', value: 2, skulls: 0, wasChoice: true };
        } else if (choice === 'workers') {
          newDiceResults[i] = { type: 'workers', value: 2, skulls: 0, wasChoice: true };
        }
        choiceIndex++;
      }
    }
    setDiceResults(newDiceResults);

    player.food = result.newFood;
    setPlayers(newPlayers);
    setPendingWorkers(result.newPendingWorkers);
    setPendingFoodOrWorkers(0);
    resetFoodOrWorkersPhase();
    setPhase('feed');
  }

  function handleFeed() {
    const newPlayers = [...players];
    const result = feedCities(newPlayers[currentPlayerIndex], pendingWorkers);
    newPlayers[currentPlayerIndex] = result.player;
    setPlayers(newPlayers);

    // Skip build phase if no workers
    if (result.shouldSkipBuild) {
      skipToBuyPhase();
    } else {
      // Initialize build phase state before entering build phase
      initializeBuildPhase(result.player);
      setPhase('build');
    }
  }

  function skipToBuyPhase() {
    // Calculate minimum cost of available developments
    const purchasedDevIds = players[currentPlayerIndex].developments;
    const availableDevs = DEVELOPMENTS.filter(d => purchasedDevIds.indexOf(d.id) === -1);
    const minCost = availableDevs.length > 0 ? Math.min(...availableDevs.map(d => d.cost)) : Infinity;

    // Calculate total value available
    const goodsValue = getGoodsValue(players[currentPlayerIndex].goodsPositions);
    const totalValue = goodsValue + pendingCoins;

    // Skip buy phase if can't afford anything
    if (totalValue < minCost) {
      checkAndSkipDiscard();
    } else {
      // Reset buy phase state when entering the phase
      resetBuyPhaseState();
      setPhase('buy');
    }
  }

  function checkAndSkipDiscard() {
    // In solo mode, check if game should end at turn 10
    if (isSoloMode && soloTurn >= 10) {
      console.log('🎯 Solo game ending at turn', soloTurn);
      endGame();
      return;
    }

    const player = players[currentPlayerIndex];
    const totalGoods = getTotalGoodsCount(player.goodsPositions);
    const hasCaravans = player.developments.indexOf('caravans') !== -1;

    // Skip discard phase if player has 6 or fewer goods, or has Caravans
    if (totalGoods <= 6 || hasCaravans) {
      nextTurn();
    } else {
      initializeDiscard(player.goodsPositions);
      setPhase('discard');
    }
  }

  function handleBuildCity(cityIndex) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = buildCity(player, cityIndex, pendingWorkers);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleBuildMonument(monumentId) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const result = buildMonument(player, monumentId, pendingWorkers, MONUMENTS, newPlayers, currentPlayerIndex);
    setPendingWorkers(result.newPendingWorkers);
    setPlayers(newPlayers);

    // Check if all monuments have been collectively built (for variants that require it)
    if (result.monumentCompleted && variantConfig.endGameConditions.allMonumentsBuilt) {
      if (checkAllMonumentsBuilt(MONUMENTS, newPlayers)) {
        if (isSoloMode || players.length === 1) {
          endGame();
        } else {
          setGameEndTriggered(true);
        }
      }
    }
  }

  function handleResetBuild() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = resetBuild(player, pendingWorkers);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleSkipBuild() {
    const player = players[currentPlayerIndex];

    // Check if player can still place workers
    if (!canSkipBuild(player, pendingWorkers)) {
      return;
    }

    setPendingWorkers(0);
    setPendingFoodOrWorkers(0);
    resetStone();
    skipToBuyPhase();
  }

  function handleTradeStone(amount) {
    if (amount < 0) return;

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Calculate the difference to know how much stone to add/remove
    const difference = amount - stoneToTradeForWorkers;

    // Check if we have enough stone (current stone + already traded stone >= new amount)
    const totalStoneAvailable = player.goodsPositions.stone + stoneToTradeForWorkers;

    if (amount <= totalStoneAvailable) {
      // Update stone and workers based on the difference
      player.goodsPositions.stone -= difference;
      setPendingWorkers(pendingWorkers + (difference * 3));
      tradeStone(amount);
      setPlayers(newPlayers);
    }
  }

  function handleResetStone() {
    if (stoneToTradeForWorkers > 0) {
      const newPlayers = [...players];
      const player = newPlayers[currentPlayerIndex];

      player.goodsPositions.stone += stoneToTradeForWorkers;
      setPendingWorkers(pendingWorkers - (stoneToTradeForWorkers * 3));
      resetStone();
      setPlayers(newPlayers);
    }
  }

  function handleSelectDevelopment(devId) {
    const dev = DEVELOPMENTS.find(d => d.id === devId);
    if (!dev) return;

    const player = players[currentPlayerIndex];
    const result = selectDevelopment(dev, player, pendingCoins);

    if (result && result.autoBuy) {
      handleAutoBuyDevelopment(dev);
    }
  }

  function handleAutoBuyDevelopment(dev) {
    console.log('🛒 handleAutoBuyDevelopment', { isSoloMode, soloTurn });
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const result = autoBuyDevelopment(dev, player, pendingCoins);
    setPendingCoins(result.newCoins);
    setPlayers(newPlayers);

    // Check end game condition based on variant (but not in test mode or solo mode)
    if (!testMode && !isSoloMode && player.developments.length >= variantConfig.endGameConditions.developmentCount) {
      console.log('🎮 End game condition triggered (multiplayer dev count)');
      if (players.length === 1) {
        endGame();
      } else {
        setGameEndTriggered(true);
      }
      return;
    }

    console.log('➡️ Calling checkAndSkipDiscard from handleAutoBuyDevelopment');
    // Automatically proceed to next phase
    checkAndSkipDiscard();
  }

  function handleToggleGoodForPurchase(type) {
    if (!selectedDevelopmentToBuy) return;
    const player = players[currentPlayerIndex];
    toggleGoodForPurchase(type, player);
  }

  function handleConfirmPurchase() {
    if (!selectedDevelopmentToBuy) return;

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const result = confirmPurchase(player, pendingCoins);
    if (!result) return;

    setPendingCoins(result.newPendingCoins);
    setPlayers(newPlayers);

    // Check end game condition based on variant (but not in test mode or solo mode)
    if (!testMode && !isSoloMode && player.developments.length >= variantConfig.endGameConditions.developmentCount) {
      if (players.length === 1) {
        endGame();
      } else {
        setGameEndTriggered(true);
      }
      return;
    }

    // Automatically proceed to next phase after purchase
    checkAndSkipDiscard();
  }

  function handleCancelPurchaseSelection() {
    cancelPurchaseSelection();
  }

  function handleResetBuy() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const result = resetBuyPhase(player);
    if (result) {
      setPendingCoins(result.coins);
      setPlayers(newPlayers);
    }
  }

  function handleSkipBuy() {
    console.log('⏭️ handleSkipBuy called', { isSoloMode, soloTurn });
    setPendingCoins(0);
    resetBuyPhaseState();
    console.log('➡️ Calling checkAndSkipDiscard from handleSkipBuy');
    checkAndSkipDiscard();
  }

  function handleTradeFood(amount) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const granariesRate = getGranariesRate();

    const result = tradeFood(amount, player, granariesRate);
    if (result) {
      setPendingCoins(pendingCoins + result.newPendingCoins);
      setPlayers(newPlayers);
    }
  }

  function handleResetTrade() {
    if (foodToTradeForCoins > 0) {
      const newPlayers = [...players];
      const player = newPlayers[currentPlayerIndex];
      const granariesRate = getGranariesRate();

      player.food += foodToTradeForCoins;
      setPendingCoins(pendingCoins - (foodToTradeForCoins * granariesRate));
      resetTrade();
      setPlayers(newPlayers);
    }
  }

  function handleDiscardGood(type) {
    discardGood(type);
  }

  function handleContinueDiscard() {
    if (!tempGoodsPositions) return;

    const finalPositions = confirmDiscard();
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = {
      ...newPlayers[currentPlayerIndex],
      goodsPositions: finalPositions
    };
    setPlayers(newPlayers);

    // In solo mode, check if game should end at turn 10
    if (isSoloMode && soloTurn >= 10) {
      endGame();
      return;
    }

    nextTurn();
  }

  function nextTurn() {
    const isLastPlayer = currentPlayerIndex === players.length - 1;

    if (isLastPlayer) {
      // In solo mode, check if game should end BEFORE incrementing
      if (isSoloMode && soloTurn >= 10) {
        endGame();
        return;
      }

      // End of round - check if game should end
      if (gameEndTriggered && !isSoloMode) {
        endGame();
        return;
      }

      setRound(round + 1);
      setCurrentPlayerIndex(0);

      // In solo mode, increment turn counter
      if (isSoloMode) {
        setSoloTurn(soloTurn + 1);
      }

      // Show player turn modal for multiplayer
      if (!isSoloMode && players.length > 1) {
        setShowPlayerTurnModal(true);
      }
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1);

      // Show player turn modal for multiplayer
      if (!isSoloMode && players.length > 1) {
        setShowPlayerTurnModal(true);
      }
    }

    setPhase('roll');
    resetForNewTurn();
    setPendingCoins(0);
    // Reset any ongoing trade states from hooks
    resetTrade();
    resetStone();
  }

  // Update scores in real-time
  useEffect(function() {
    const newPlayers = [...players];
    let hasChanged = false;

    for (let i = 0; i < newPlayers.length; i++) {
      const newScore = calculatePlayerScore(newPlayers[i], DEVELOPMENTS, MONUMENTS);
      if (newPlayers[i].score !== newScore) {
        newPlayers[i].score = newScore;
        hasChanged = true;
      }
    }

    if (hasChanged) {
      setPlayers(newPlayers);
    }
  }, [players]);

  // Save game state to localStorage
  useEffect(function() {
    if (!gameEnded && players.length > 0) {
      const gameState = {
        players: players,
        currentPlayerIndex: currentPlayerIndex,
        round: round,
        soloTurn: soloTurn,
        phase: phase,
        diceResults: diceResults,
        rollCount: rollCount,
        lockedDice: lockedDice,
        pendingWorkers: pendingWorkers,
        pendingFoodOrWorkers: pendingFoodOrWorkers,
        pendingCoins: pendingCoins,
        gameEndTriggered: gameEndTriggered,
        leadershipUsed: leadershipUsed,
        playerNames: playerNames,
        variantId: variantId,
        isSoloMode: isSoloMode,
        timestamp: new Date().toISOString()
      };

      try {
        window.localStorage.setItem('rtta_game_state', JSON.stringify(gameState));
      } catch (error) {
        console.error('Error saving game state:', error);
      }
    }
  }, [
    players,
    currentPlayerIndex,
    round,
    soloTurn,
    phase,
    diceResults,
    rollCount,
    lockedDice,
    pendingWorkers,
    pendingFoodOrWorkers,
    pendingCoins,
    gameEndTriggered,
    leadershipUsed,
    gameEnded,
    playerNames,
    variantId,
    isSoloMode
  ]);

  function endGame() {
    console.log('🏁 endGame called!');
    const newPlayers = [...players];

    for (let i = 0; i < newPlayers.length; i++) {
      newPlayers[i].score = calculatePlayerScore(newPlayers[i], DEVELOPMENTS, MONUMENTS);
    }

    setPlayers(newPlayers);
    setGameEnded(true);
    console.log('✅ Game ended, gameEnded state set to true');

    // Save scores to history (only for solo mode or multiplayer with 2+ players)
    // Don't save scores for "partie libre" (1 player, not solo mode)
    const shouldSaveScores = isSoloMode || playerNames.length > 1;

    if (shouldSaveScores) {
      for (let i = 0; i < newPlayers.length; i++) {
        addScore(newPlayers[i].name, newPlayers[i].score, isSoloMode, variantId);
      }
    }

    // Clear saved game state
    try {
      window.localStorage.removeItem('rtta_game_state');
    } catch (error) {
      console.error('Error clearing game state:', error);
    }
  }

  if (gameEnded) {
    return <GameEndScreen players={players} DEVELOPMENTS={DEVELOPMENTS} MONUMENTS={MONUMENTS} />;
  }

  let citiesToFeed = 3;
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) citiesToFeed++;
  }

  // Calculate preview values for food and goods based on dice results
  let previewFood = 0;
  let previewGoodsCount = 0;

  if (diceResults && (phase === 'roll' || phase === 'choose_food_or_workers')) {
    const hasAgriculture = currentPlayer.developments.indexOf('agriculture') !== -1;

    for (let i = 0; i < diceResults.length; i++) {
      const r = diceResults[i];
      if (r.type === 'food') {
        previewFood += r.value;
        if (hasAgriculture) {
          previewFood += 1;
        }
      } else if (r.type === 'goods') {
        previewGoodsCount += r.value;
      }
    }

    // Handle food_or_workers in choose phase
    if (phase === 'choose_food_or_workers') {
      for (let i = 0; i < foodOrWorkerChoices.length; i++) {
        if (foodOrWorkerChoices[i] === 'food') {
          previewFood += 2;
          if (hasAgriculture) {
            previewFood += 1;
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200 p-4">
      {/* Player Turn Modal */}
      <PlayerTurnModal
        show={showPlayerTurnModal}
        playerName={currentPlayer.name}
        round={round}
        gameEndTriggered={gameEndTriggered}
        onStart={() => setShowPlayerTurnModal(false)}
      />

      <div className="lg:h-full flex flex-col">
        <GameHeader
          playerName={currentPlayer.name}
          playerScore={currentPlayer.score}
          round={round}
          soloTurn={soloTurn}
          isSoloMode={isSoloMode}
          isMultiplayer={players.length > 1}
          testMode={testMode}
          showTestMode={import.meta.env.VITE_ENABLE_TEST_MODE === 'true'}
          onToggleTestMode={handleToggleTestMode}
        />

        {/* Dice Display - Compact bar with phase info and action buttons */}
        <div className="flex-shrink-0 bg-white rounded-lg shadow-lg px-2 sm:px-4 py-3 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 min-h-24">
          <DiceBar
            diceResults={diceResults}
            isRolling={isRolling}
            rollingDice={rollingDice}
            lockedDice={lockedDice}
            phase={phase}
            foodOrWorkerChoices={foodOrWorkerChoices}
            leadershipMode={leadershipMode}
            isSoloMode={isSoloMode}
            variantConfig={variantConfig}
            onToggleLock={toggleLock}
            onToggleFoodOrWorker={handleToggleFoodOrWorkerDie}
          />

          {/* Phase info bar - always visible */}
          <div className="flex-1">
            <PhaseInfoBar
              phase={phase}
              currentPlayer={currentPlayer}
              pendingWorkers={pendingWorkers}
              pendingCoins={pendingCoins}
              citiesToFeed={citiesToFeed}
              totalGoodsCount={getTotalGoodsCount(tempGoodsPositions || currentPlayer.goodsPositions)}
              goodsValue={getGoodsValue(currentPlayer.goodsPositions)}
              selectedDevelopment={selectedDevelopmentToBuy}
              hasPurchased={originalGoodsPositions !== null}
              lastPurchasedDevelopment={lastPurchasedDevelopment}
              stoneToTradeForWorkers={stoneToTradeForWorkers}
              onTradeStone={handleTradeStone}
              onResetStone={handleResetStone}
              foodToTradeForCoins={foodToTradeForCoins}
              onTradeFood={handleTradeFood}
              onResetTrade={handleResetTrade}
              granariesRate={getGranariesRate()}
              needsToDiscard={!currentPlayer.developments.includes('caravans') && getTotalGoodsCount(tempGoodsPositions || currentPlayer.goodsPositions) > 6}
              hasCaravans={currentPlayer.developments.indexOf('caravans') !== -1}
              foodOrWorkerChoices={foodOrWorkerChoices}
              pendingFoodOrWorkers={pendingFoodOrWorkers}
              selectedGoodsForPurchase={selectedGoodsForPurchase}
              calculateSelectedValue={calculateSelectedValue}
              diceResults={diceResults}
            />
          </div>

          {/* Action buttons - always visible */}
          <div>
            <ActionButtonsBar
              phase={phase}
              diceResults={diceResults}
              rollCount={rollCount}
              lockedDice={lockedDice}
              isRolling={isRolling}
              onReroll={handleReroll}
              onKeep={handleKeep}
              leadershipUsed={leadershipUsed}
              leadershipMode={leadershipMode}
              onUseLeadership={handleUseLeadership}
              onLeadershipReroll={handleLeadershipReroll}
              onCancelLeadership={handleCancelLeadership}
              currentPlayer={currentPlayer}
              foodOrWorkerChoices={foodOrWorkerChoices}
              onValidateFoodOrWorkers={handleValidateFoodOrWorkers}
              onFeed={handleFeed}
              pendingWorkers={pendingWorkers}
              onResetBuild={handleResetBuild}
              onSkipBuild={handleSkipBuild}
              hasPurchased={originalGoodsPositions !== null}
              onResetBuy={handleResetBuy}
              onSkipBuy={handleSkipBuy}
              selectedDevelopment={selectedDevelopmentToBuy}
              onCancelSelection={handleCancelPurchaseSelection}
              onConfirmPurchase={handleConfirmPurchase}
              calculateSelectedValue={calculateSelectedValue}
              canContinueDiscard={!tempGoodsPositions || !currentPlayer.developments.includes('caravans') && getTotalGoodsCount(tempGoodsPositions) <= 6 || currentPlayer.developments.includes('caravans')}
              onContinueDiscard={handleContinueDiscard}
            />
          </div>
        </div>

        {/* Player panel - full width */}
        <div className="lg:flex-1 lg:min-h-0">
          <PlayerScorePanel
            player={currentPlayer}
            onBuyDevelopment={handleSelectDevelopment}
            canBuy={phase === 'buy' && !selectedDevelopmentToBuy}
            pendingCoins={pendingCoins}
            onBuildCity={handleBuildCity}
            onBuildMonument={handleBuildMonument}
            canBuild={phase === 'build'}
            pendingWorkers={pendingWorkers}
            selectedDevelopmentId={selectedDevelopmentToBuy ? selectedDevelopmentToBuy.id : null}
            allPlayers={players}
            currentPlayerIndex={currentPlayerIndex}
            monuments={MONUMENTS}
            developments={DEVELOPMENTS}
            previewFood={previewFood}
            previewGoodsCount={previewGoodsCount}
            interactionMode={phase === 'discard' ? 'discard' : (phase === 'buy' && selectedDevelopmentToBuy ? 'buy' : null)}
            tempGoodsPositions={tempGoodsPositions}
            selectedGoodsForPurchase={selectedGoodsForPurchase}
            onDiscardGood={handleDiscardGood}
            onToggleGoodForPurchase={handleToggleGoodForPurchase}
          />
        </div>

        {/* Disaster Help Button */}
        <DisasterHelp currentPlayer={currentPlayer} developments={DEVELOPMENTS} />
      </div>
    </div>
  );
}
