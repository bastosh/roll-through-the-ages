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
import { useTradePhase } from '../hooks/useTradePhase';
import { useSmithingPhase } from '../hooks/useSmithingPhase';
import { feedCities, processRollResults } from '../utils/phaseHandlers';
import { handleDisasters } from '../utils/gameUtils';
import PlayerScorePanel from './player/PlayerScorePanel';
import PhaseInfoBar from './shared/PhaseInfoBar';
import ActionButtonsBar from './shared/ActionButtonsBar';
import DisasterHelp from './shared/DisasterHelp';
import PlayerTurnModal from './player/PlayerTurnModal';
import SphinxChoiceModal from './shared/SphinxChoiceModal';
import DiceBar from './dice/DiceBar';
import GameHeader from './layout/GameHeader';
import GameEndScreen from './layout/GameEndScreen';
import ThemeToggle from './shared/ThemeToggle';

export default function Game({ playerNames, variantId, isSoloMode, bronze2024DevCount = 5, savedGameState }) {
  // Load variant configuration
  const variantConfig = useMemo(function() {
    const base = getVariantById(variantId);
    // Si Bronze Age 2024, on adapte le nombre de développements selon le choix
    if (variantId === 'bronze_age_2024') {
      return {
        ...base,
        endGameConditions: {
          ...base.endGameConditions,
          developmentCount: bronze2024DevCount
        }
      };
    }
    return base;
  }, [variantId, bronze2024DevCount]);

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

      // Initialize metropolis for Ancient Empires
      let metropolis = null;
      if (variantConfig.useMetropolis) {
        metropolis = { built: false, progress: 0, requiredWorkers: 10 };
      }

      // Initialize production buildings for Ancient Empires
      const productions = [];
      if (variantConfig.productions) {
        for (let j = 0; j < variantConfig.productions.length; j++) {
          productions.push({
            name: variantConfig.productions[j].name,
            built: false,
            progress: 0
          });
        }
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
        score: 0,
        builtBoats: 0,
        pendingBoats: 0,
        metropolis: metropolis,
        productions: productions,
        sphinxPowerAvailable: false
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
  const [workerDiceCount, setWorkerDiceCount] = useState(savedGameState?.workerDiceCount ?? 0);
  const [gameEnded, setGameEnded] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [gameEndTriggered, setGameEndTriggered] = useState(savedGameState?.gameEndTriggered ?? false);
  const [showPlayerTurnModal, setShowPlayerTurnModal] = useState(!isSoloMode && playerNames.length > 1 && !savedGameState);
  const [preservationUsed, setPreservationUsed] = useState(savedGameState?.preservationUsed ?? false);
  const [pendingSkulls, setPendingSkulls] = useState(savedGameState?.pendingSkulls ?? 0);
  const [showSphinxModal, setShowSphinxModal] = useState(false);
  const [sphinxStarvationPoints, setSphinxStarvationPoints] = useState(0);

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
    stoneToTradeForWorkers,
    initializeBuildPhase,
    buildCity,
    unbuildCity,
    buildMetropolis,
    unbuildMetropolis,
    buildProduction,
    unbuildProduction,
    buildMonument,
    unbuildMonument,
    checkAllMonumentsBuilt,
    resetBuild,
    canSkipBuild,
    tradeStone,
    resetStone,
    calculateMaxBoats,
    buildBoats,
    unbuildBoats,
    confirmBoats,
    resetPhase: resetBuildPhase
  } = buildPhaseHook;

  // Use buy phase hook
  const buyPhaseHook = useBuyPhase();
  const {
    selectedDevelopmentToBuy,
    selectedGoodsForPurchase,
    originalGoodsPositions,
    lastPurchasedDevelopment,
    foodToTradeForCoins,
    workersToTradeForCoins,
    selectDevelopment,
    autoBuyDevelopment,
    toggleGoodForPurchase,
    calculateSelectedValue,
    confirmPurchase,
    cancelPurchaseSelection,
    resetBuy: resetBuyPhase,
    tradeFood,
    tradeWorkers,
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

  // Use trade phase hook
  const tradePhaseHook = useTradePhase();
  const {
    tradesUsed,
    initializeTradePhase,
    tradeResource,
    resetTrades,
    resetPhase: resetTradePhase
  } = tradePhaseHook;

  // Use smithing phase hook
  const smithingPhaseHook = useSmithingPhase();
  const {
    spearheadsToSpend,
    initializeSmithingPhase,
    incrementSpearheads,
    decrementSpearheads,
    resetPhase: resetSmithingPhase
  } = smithingPhaseHook;

  // Get Granaries exchange rate from development effect
  function getGranariesRate() {
    const granariesDev = DEVELOPMENTS.find(d => d.id === 'granaries');
    if (!granariesDev) return 4; // Default fallback
    // Extract number from effect like "Échangez 1 nourriture contre 4 pièces"
    const match = granariesDev.effect.match(/(\d+)\s+pièces/);
    return match ? parseInt(match[1]) : 4;
  }

  // Get Slavery exchange rate (3 coins per worker for Ancient Empires)
  function getSlaveryRate() {
    return 3; // 1 worker = 3 coins
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
  // UNLESS player has Preservation and can use it
  useEffect(function() {
    if (phase === 'roll' && !diceResults && !savedGameState) {
      const hasPreservation = currentPlayer.developments.indexOf('preservation') !== -1;
      const hasPottery = currentPlayer.goodsPositions.pottery > 0;
      const hasFood = currentPlayer.food > 0;
      const canUsePreservation = hasPreservation && hasPottery && hasFood && !preservationUsed;

      // Only auto-roll if player cannot use Preservation
      if (!canUsePreservation) {
        rollDice(true, 0);
      }
    }
  }, [phase]);

  // Initialize discard phase when entering it
  useEffect(function() {
    if (phase === 'discard' && !tempGoodsPositions) {
      initializeDiscard(currentPlayer.goodsPositions);
    }
  }, [phase, tempGoodsPositions]);

  function handleUsePreservation() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Vérifier que le joueur a Conservation, de la Poterie et de la Nourriture
    const hasPreservation = player.developments.indexOf('preservation') !== -1;
    const hasPottery = player.goodsPositions.pottery > 0;
    const hasFood = player.food > 0;

    if (!hasPreservation || !hasPottery || !hasFood || preservationUsed) {
      return;
    }

    // Retirer 1 Poterie
    player.goodsPositions.pottery--;

    // Doubler la nourriture (max 15)
    const newFood = Math.min(player.food * 2, 15);
    player.food = newFood;

    setPlayers(newPlayers);
    setPreservationUsed(true);

    // Lancer les dés après avoir utilisé Conservation
    setTimeout(() => {
      rollDice(true, 0);
    }, 100);
  }

  function handleRollInitial() {
    rollDice(true, 0);
  }

  function handleKeep() {
    processResults(diceResults);
  }

  function processResults(results) {
    const result = processRollResults(
      results,
      currentPlayerIndex,
      players,
      variantConfig
    );

    // Count worker dice for slavery bonus
    let workersCount = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].type === 'workers') {
        workersCount++;
      }
    }
    setWorkerDiceCount(workersCount);

    setPlayers(result.players);
    setPendingWorkers(result.pendingWorkers);
    setPendingFoodOrWorkers(result.pendingFoodOrWorkers);
    setPendingCoins(result.pendingCoins);
    setPendingSkulls(result.skulls || 0);

    if (result.foodOrWorkerChoicesCount > 0) {
      initializeChoices(result.foodOrWorkerChoicesCount);
    }

    if (result.nextPhase === 'smithing_invasion') {
      initializeSmithingPhase();
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

    // Count food_or_workers dice that were chosen as workers (for slavery bonus)
    let additionalWorkerDice = 0;
    for (let i = 0; i < foodOrWorkerChoices.length; i++) {
      if (foodOrWorkerChoices[i] === 'workers') {
        additionalWorkerDice++;
      }
    }
    setWorkerDiceCount(workerDiceCount + additionalWorkerDice);

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

  function handleFeed(useSphinx = false) {
    const newPlayers = [...players];
    const result = feedCities(newPlayers[currentPlayerIndex], pendingWorkers, useSphinx);
    newPlayers[currentPlayerIndex] = result.player;
    setPlayers(newPlayers);

    // If Sphinx can be used, show modal
    if (result.canUseSphinx && !useSphinx) {
      setSphinxStarvationPoints(result.starvationPoints);
      setShowSphinxModal(true);
      return;
    }

    // Skip build phase if no workers
    if (result.shouldSkipBuild) {
      skipToBuyPhase();
    } else {
      // Initialize build phase state before entering build phase
      initializeBuildPhase(result.player);
      setPhase('build');
    }
  }

  function handleSphinxUse() {
    setShowSphinxModal(false);
    handleFeed(true);
  }

  function handleSphinxDecline() {
    setShowSphinxModal(false);
    // Re-run feed without using Sphinx
    const newPlayers = [...players];
    const result = feedCities(newPlayers[currentPlayerIndex], pendingWorkers, false);
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
    const currentPlayerState = players[currentPlayerIndex];

    // Add coins bonus from completed mine production buildings (Ancient Empires)
    let mineBonus = 0;
    if (variantConfig.productions && currentPlayerState.productions) {
      const hasCoinage = currentPlayerState.developments.indexOf('coinage') !== -1;
      const coinValue = hasCoinage ? 12 : 7;

      for (let i = 0; i < currentPlayerState.productions.length; i++) {
        const production = currentPlayerState.productions[i];
        const productionDef = variantConfig.productions[i];
        if (production.built && productionDef.name === 'mine' && productionDef.bonus === '1 coin') {
          mineBonus += coinValue;
        }
      }
    }

    // Add coins bonus from slavery development (Ancient Empires Beri only)
    // For Ancient Empires Beri: automatic coins from worker dice (5 coins per die)
    // For Ancient Empires Original: manual trading only (1 worker = 3 coins, handled in buy phase)
    let slaveryBonus = 0;
    if (currentPlayerState.developments.indexOf('slavery') !== -1 && variantId === 'ancient_empires') {
      slaveryBonus = workerDiceCount * 5;
    }

    // Apply mine bonus and slavery bonus to pendingCoins
    const totalCoins = pendingCoins + mineBonus + slaveryBonus;
    setPendingCoins(totalCoins);

    // Calculate minimum cost of available developments
    const purchasedDevIds = currentPlayerState.developments;
    const availableDevs = DEVELOPMENTS.filter(d => purchasedDevIds.indexOf(d.id) === -1);
    const minCost = availableDevs.length > 0 ? Math.min(...availableDevs.map(d => d.cost)) : Infinity;

    // Calculate total value available
    const goodsValue = getGoodsValue(currentPlayerState.goodsPositions);
    const totalValue = goodsValue + totalCoins;

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
    // In solo mode, check if game should end based on variant's max rounds
    if (isSoloMode && soloTurn >= variantConfig.soloMaxRounds) {
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
      setPhase('discard');
      // initializeDiscard will be called by useEffect when phase changes
    }
  }

  function handleBuildCity(cityIndex) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = buildCity(player, cityIndex, pendingWorkers);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleUnbuildCity(cityIndex) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = unbuildCity(player, cityIndex, pendingWorkers);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleBuildMetropolis() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = buildMetropolis(player, pendingWorkers);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleUnbuildMetropolis() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = unbuildMetropolis(player, pendingWorkers);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleBuildProduction(productionIndex) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = buildProduction(player, productionIndex, pendingWorkers, variantConfig);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleUnbuildProduction(productionIndex) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newPendingWorkers = unbuildProduction(player, productionIndex, pendingWorkers, variantConfig);
    setPendingWorkers(newPendingWorkers);
    setPlayers(newPlayers);
  }

  function handleBuildMonument(monumentId) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const result = buildMonument(player, monumentId, pendingWorkers, MONUMENTS, newPlayers, currentPlayerIndex);
    setPendingWorkers(result.newPendingWorkers);
    setPlayers(newPlayers);

    // Apply Delphi Oracle bonus if monument was completed
    if (result.oracleBonus > 0) {
      setPendingCoins(pendingCoins + result.oracleBonus);
    }

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

  function handleUnbuildMonument(monumentId) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const result = unbuildMonument(player, monumentId, pendingWorkers, MONUMENTS);
    setPendingWorkers(result.newPendingWorkers);
    setPlayers(newPlayers);
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

    // Confirm boats built during this phase
    const newPlayers = [...players];
    confirmBoats(newPlayers[currentPlayerIndex]);
    setPlayers(newPlayers);

    setPendingWorkers(0);
    setPendingFoodOrWorkers(0);
    resetStone();

    // If variant is Late Bronze Age or Ancient Empires, player has shipping development and boats, go to trade phase
    const hasShipping = newPlayers[currentPlayerIndex].developments.indexOf('shipping') !== -1;
    const isTradeVariant = variantId === 'late_bronze_age' || variantId === 'ancient_empires';
    if (isTradeVariant && hasShipping && newPlayers[currentPlayerIndex].builtBoats > 0) {
      initializeTradePhase(newPlayers[currentPlayerIndex]);
      setPhase('trade');
    } else {
      skipToBuyPhase();
    }
  }

  function handleBuildBoat() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    buildBoats(player, 1);
    setPlayers(newPlayers);
  }

  function handleUnbuildBoat() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    unbuildBoats(player, 1);
    setPlayers(newPlayers);
  }

  function handleTradeResource(fromType, toType) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const success = tradeResource(player, fromType, toType);
    if (success) {
      setPlayers(newPlayers);
    }
    return success;
  }

  function handleResetTrades() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    resetTrades(player);
    // Force update by creating a new player object
    newPlayers[currentPlayerIndex] = { ...player };
    setPlayers(newPlayers);
  }

  function handleSkipTrade() {
    resetTradePhase();
    skipToBuyPhase();
  }

  function handleConfirmSmithing() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Dépenser les Lances
    if (spearheadsToSpend > 0) {
      player.goodsPositions.spearheads -= spearheadsToSpend;
    }

    // Appliquer l'invasion avec les Lances dépensées
    handleDisasters(newPlayers, currentPlayerIndex, pendingSkulls, spearheadsToSpend);

    setPlayers(newPlayers);
    resetSmithingPhase();

    // Passer à la phase suivante
    if (pendingFoodOrWorkers > 0) {
      setPhase('choose_food_or_workers');
    } else {
      setPhase('feed');
    }
  }

  function handleSkipSmithing() {
    const newPlayers = [...players];

    // Appliquer l'invasion sans Lances
    handleDisasters(newPlayers, currentPlayerIndex, pendingSkulls, 0);

    setPlayers(newPlayers);
    resetSmithingPhase();

    // Passer à la phase suivante
    if (pendingFoodOrWorkers > 0) {
      setPhase('choose_food_or_workers');
    } else {
      setPhase('feed');
    }
  }

  function handleTradeStone(amount) {
    if (amount < 0) return;

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Calculate the difference to know how much stone to add/remove
    const difference = amount - stoneToTradeForWorkers;

    // Check if we have enough stone (current stone + already traded stone >= new amount)
    const totalStoneAvailable = player.goodsPositions.stone + stoneToTradeForWorkers;

    // Calculate what the new pending workers would be
    const newPendingWorkers = pendingWorkers + (difference * 3);

    // Prevent reducing stone trade if it would result in negative workers
    if (newPendingWorkers < 0) {
      return;
    }

    if (amount <= totalStoneAvailable) {
      // Update stone and workers based on the difference
      player.goodsPositions.stone -= difference;
      setPendingWorkers(newPendingWorkers);
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
    const result = selectDevelopment(dev, player, pendingCoins, players.length);

    if (result && result.autoBuy) {
      handleAutoBuyDevelopment(dev);
    }
  }

  function handleAutoBuyDevelopment(dev) {
    console.log('🛒 handleAutoBuyDevelopment', { isSoloMode, soloTurn });
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const result = autoBuyDevelopment(dev, player, pendingCoins, players.length);
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

    const result = confirmPurchase(player, pendingCoins, players.length);
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

  function handleTradeWorkers(amount) {
    const slaveryRate = getSlaveryRate();
    const result = tradeWorkers(amount, pendingWorkers, slaveryRate);
    if (result) {
      setPendingWorkers(result.newPendingWorkers);
      setPendingCoins(pendingCoins + result.newPendingCoins);
    }
  }

  function handleResetWorkersTrade() {
    if (workersToTradeForCoins > 0) {
      const slaveryRate = getSlaveryRate();
      setPendingWorkers(pendingWorkers + workersToTradeForCoins);
      setPendingCoins(pendingCoins - (workersToTradeForCoins * slaveryRate));
      resetTrade();
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

    // In solo mode, check if game should end based on variant's max rounds
    if (isSoloMode && soloTurn >= variantConfig.soloMaxRounds) {
      endGame();
      return;
    }

    nextTurn();
  }

  function nextTurn() {
    const isLastPlayer = currentPlayerIndex === players.length - 1;

    if (isLastPlayer) {
      // In solo mode, check if game should end BEFORE incrementing
      if (isSoloMode && soloTurn >= variantConfig.soloMaxRounds) {
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
    setWorkerDiceCount(0);
    setPreservationUsed(false);
    // Reset any ongoing trade states from hooks
    resetTrade();
    resetStone();
  }

  // Update scores in real-time
  useEffect(function() {
    const newPlayers = [...players];
    let hasChanged = false;

    for (let i = 0; i < newPlayers.length; i++) {
      const newScore = calculatePlayerScore(newPlayers[i], DEVELOPMENTS, MONUMENTS, variantConfig);
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
        workerDiceCount: workerDiceCount,
        gameEndTriggered: gameEndTriggered,
        leadershipUsed: leadershipUsed,
        preservationUsed: preservationUsed,
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
    workerDiceCount,
    gameEndTriggered,
    leadershipUsed,
    preservationUsed,
    gameEnded,
    playerNames,
    variantId,
    isSoloMode
  ]);

  function endGame() {
    console.log('🏁 endGame called!');
    const newPlayers = [...players];

    for (let i = 0; i < newPlayers.length; i++) {
      newPlayers[i].score = calculatePlayerScore(newPlayers[i], DEVELOPMENTS, MONUMENTS, variantConfig);
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
    return <GameEndScreen players={players} DEVELOPMENTS={DEVELOPMENTS} MONUMENTS={MONUMENTS} variantConfig={variantConfig} />;
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

    // During roll phase, show all food and goods from dice
    // During choose phase, only show pending food_or_workers choices (other resources already added)
    if (phase === 'roll') {
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

      // Add food bonus from completed village production buildings (Ancient Empires)
      if (variantConfig.productions && currentPlayer.productions) {
        for (let i = 0; i < currentPlayer.productions.length; i++) {
          const production = currentPlayer.productions[i];
          const productionDef = variantConfig.productions[i];
          if (production.built && productionDef.name === 'village' && productionDef.bonus === '1 food') {
            previewFood += 1;
          }
        }
      }

      // Add goods bonus from completed market production buildings (Ancient Empires)
      if (variantConfig.productions && currentPlayer.productions) {
        for (let i = 0; i < currentPlayer.productions.length; i++) {
          const production = currentPlayer.productions[i];
          const productionDef = variantConfig.productions[i];
          if (production.built && productionDef.name === 'market' && productionDef.bonus === '1 good') {
            previewGoodsCount += 1;
          }
        }
      }
    }

    // Handle food_or_workers in choose phase - only show pending choices
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Player Turn Modal */}
      <PlayerTurnModal
        show={showPlayerTurnModal}
        playerName={currentPlayer.name}
        round={round}
        gameEndTriggered={gameEndTriggered}
        onStart={() => setShowPlayerTurnModal(false)}
      />

      {/* Sphinx Choice Modal */}
      <SphinxChoiceModal
        show={showSphinxModal}
        starvationPoints={sphinxStarvationPoints}
        onUseSphinx={handleSphinxUse}
        onDecline={handleSphinxDecline}
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
          soloMaxRounds={variantConfig.soloMaxRounds}
        />

        {/* Dice Display - Compact bar with phase info and action buttons */}
        <div className="flex-shrink-0 bg-white dark:bg-dark-surface rounded-lg shadow-lg px-2 sm:px-4 py-3 my-4 mx-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 min-h-24 transition-colors">
          <DiceBar
            diceResults={diceResults}
            lockedDice={lockedDice}
            phase={phase}
            foodOrWorkerChoices={foodOrWorkerChoices}
            leadershipMode={leadershipMode}
            isSoloMode={isSoloMode}
            variantConfig={variantConfig}
            onToggleLock={toggleLock}
            onToggleFoodOrWorker={handleToggleFoodOrWorkerDie}
            canUsePreservation={
              currentPlayer.developments.indexOf('preservation') !== -1 &&
              currentPlayer.goodsPositions.pottery > 0 &&
              currentPlayer.food > 0 &&
              !preservationUsed &&
              !diceResults
            }
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
              workersToTradeForCoins={workersToTradeForCoins}
              onTradeWorkers={handleTradeWorkers}
              onResetWorkersTrade={handleResetWorkersTrade}
              slaveryRate={getSlaveryRate()}
              needsToDiscard={!currentPlayer.developments.includes('caravans') && getTotalGoodsCount(tempGoodsPositions || currentPlayer.goodsPositions) > 6}
              hasCaravans={currentPlayer.developments.indexOf('caravans') !== -1}
              foodOrWorkerChoices={foodOrWorkerChoices}
              pendingFoodOrWorkers={pendingFoodOrWorkers}
              selectedGoodsForPurchase={selectedGoodsForPurchase}
              calculateSelectedValue={calculateSelectedValue}
              rollCount={rollCount}
              diceResults={diceResults}
              variantConfig={variantConfig}
              playerCount={players.length}
            />
          </div>

          {/* Action buttons - always visible */}
          <div>
            <ActionButtonsBar
              phase={phase}
              diceResults={diceResults}
              rollCount={rollCount}
              lockedDice={lockedDice}
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
              preservationUsed={preservationUsed}
              onUsePreservation={handleUsePreservation}
              onRollInitial={handleRollInitial}
              playerCount={players.length}
            />
          </div>
        </div>

        {/* Player panel - full width */}
        <div className="lg:flex-1 lg:min-h-0 mx-4 mb-4">
          <PlayerScorePanel
            player={currentPlayer}
            onBuyDevelopment={handleSelectDevelopment}
            canBuy={phase === 'buy' && !selectedDevelopmentToBuy}
            pendingCoins={pendingCoins}
            onBuildCity={handleBuildCity}
            onUnbuildCity={handleUnbuildCity}
            onBuildMetropolis={handleBuildMetropolis}
            onUnbuildMetropolis={handleUnbuildMetropolis}
            onBuildProduction={handleBuildProduction}
            onUnbuildProduction={handleUnbuildProduction}
            onBuildMonument={handleBuildMonument}
            onUnbuildMonument={handleUnbuildMonument}
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
            variantId={variantId}
            maxBoats={calculateMaxBoats(currentPlayer)}
            onBuildBoat={handleBuildBoat}
            onUnbuildBoat={handleUnbuildBoat}
            isTradePhase={phase === 'trade'}
            tradesUsed={tradesUsed}
            onTrade={handleTradeResource}
            onResetTrades={handleResetTrades}
            onSkipTrade={handleSkipTrade}
            isSmithingInvasionPhase={phase === 'smithing_invasion'}
            spearheadsToSpend={spearheadsToSpend}
            onIncrementSpearheads={incrementSpearheads}
            onDecrementSpearheads={decrementSpearheads}
            onConfirmSmithing={handleConfirmSmithing}
            onSkipSmithing={handleSkipSmithing}
            variantConfig={variantConfig}
          />
        </div>

        {/* Disaster Help Button */}
        <DisasterHelp currentPlayer={currentPlayer} developments={DEVELOPMENTS} />
      </div>
    </div>
  );
}
