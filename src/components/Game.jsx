import { useState, useEffect, useMemo } from 'react';
import { GOODS_TYPES, GOODS_VALUES } from '../constants/gameData';
import { getVariantById } from '../constants/variants';
import { getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';
import { addScore } from '../utils/scoreHistory';
import { calculatePlayerScore } from '../utils/scoring';
import { useDiceRolling } from '../hooks/useDiceRolling';
import { feedCities, toggleFoodOrWorkerDie, validateFoodOrWorkers, processRollResults } from '../utils/phaseHandlers';
import PlayerScorePanel from './PlayerScorePanel';
import PhaseInfoBar from './shared/PhaseInfoBar';
import ActionButtonsBar from './shared/ActionButtonsBar';
import DisasterHelp from './shared/DisasterHelp';

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
  const [foodOrWorkerChoices, setFoodOrWorkerChoices] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [foodToTradeForCoins, setFoodToTradeForCoins] = useState(0);
  const [stoneToTradeForWorkers, setStoneToTradeForWorkers] = useState(0);
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
      // Initialize choices array with 'none' for each die
      const initialChoices = [];
      for (let i = 0; i < result.foodOrWorkerChoicesCount; i++) {
        initialChoices.push('none');
      }
      setFoodOrWorkerChoices(initialChoices);
    }

    setPhase(result.nextPhase);
  }

  function handleToggleFoodOrWorkerDie(dieIndex) {
    const newChoices = toggleFoodOrWorkerDie(foodOrWorkerChoices, dieIndex);
    setFoodOrWorkerChoices(newChoices);
  }

  function handleValidateFoodOrWorkers() {
    const newPlayers = [...players];
    const result = validateFoodOrWorkers(
      foodOrWorkerChoices,
      newPlayers[currentPlayerIndex],
      pendingWorkers
    );

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

    newPlayers[currentPlayerIndex] = result.player;
    setPlayers(newPlayers);
    setPendingWorkers(result.newPendingWorkers);
    setPendingFoodOrWorkers(0);
    setFoodOrWorkerChoices([]);
    setPhase(result.nextPhase);
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
      // Save the initial state before entering build phase
      const player = result.player;
      const cities = [];
      for (let i = 0; i < player.cities.length; i++) {
        cities.push({
          built: player.cities[i].built,
          progress: player.cities[i].progress,
          requiredWorkers: player.cities[i].requiredWorkers
        });
      }
      const monuments = [];
      for (let i = 0; i < player.monuments.length; i++) {
        monuments.push({
          id: player.monuments[i].id,
          progress: player.monuments[i].progress,
          completed: player.monuments[i].completed,
          firstToComplete: player.monuments[i].firstToComplete
        });
      }
      setBuildPhaseInitialState({ cities, monuments });
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
      setOriginalGoodsPositions(null);
      setOriginalCoins(0);
      setOriginalDevelopments(null);
      setLastPurchasedDevelopment(null);
      setSelectedDevelopmentToBuy(null);
      setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
      setCoinsForPurchase(0);
      setFoodToTradeForCoins(0);
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
      setTempGoodsPositions({ ...player.goodsPositions });
      setPhase('discard');
    }
  }

  function handleBuildCity(cityIndex) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const city = player.cities[cityIndex];

    if (!city.built) {
      if (city.progress > 0 && pendingWorkers === 0) {
        city.progress--;
        setPendingWorkers(pendingWorkers + 1);
      } else if (pendingWorkers >= 1) {
        city.progress++;
        if (city.progress >= city.requiredWorkers) {
          city.built = true;
        }
        setPendingWorkers(pendingWorkers - 1);
      }
      setPlayers(newPlayers);
    }
  }

  function handleBuildMonument(monumentId) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    let monument = null;
    for (let i = 0; i < player.monuments.length; i++) {
      if (player.monuments[i].id === monumentId) {
        monument = player.monuments[i];
        break;
      }
    }

    let monumentDef = null;
    for (let i = 0; i < MONUMENTS.length; i++) {
      if (MONUMENTS[i].id === monumentId) {
        monumentDef = MONUMENTS[i];
        break;
      }
    }

    if (monument && !monument.completed) {
      if (monument.progress > 0 && pendingWorkers === 0) {
        monument.progress--;
        setPendingWorkers(pendingWorkers + 1);
      } else if (pendingWorkers >= 1) {
        monument.progress++;
        if (monument.progress >= monumentDef.workers) {
          monument.completed = true;

          let anyoneElseCompleted = false;
          for (let i = 0; i < newPlayers.length; i++) {
            if (i !== currentPlayerIndex) {
              for (let j = 0; j < newPlayers[i].monuments.length; j++) {
                if (newPlayers[i].monuments[j].id === monumentId && newPlayers[i].monuments[j].completed) {
                  anyoneElseCompleted = true;
                  break;
                }
              }
            }
          }

          if (!anyoneElseCompleted) {
            monument.firstToComplete = true;
          }
        }
        setPendingWorkers(pendingWorkers - 1);
      }
      setPlayers(newPlayers);

      // Check if all monuments have been collectively built (for variants that require it)
      if (variantConfig.endGameConditions.allMonumentsBuilt) {
        let allMonumentsBuilt = true;
        for (let i = 0; i < MONUMENTS.length; i++) {
          const monumentId = MONUMENTS[i].id;
          let builtByAnyone = false;
          for (let j = 0; j < newPlayers.length; j++) {
            for (let k = 0; k < newPlayers[j].monuments.length; k++) {
              if (newPlayers[j].monuments[k].id === monumentId && newPlayers[j].monuments[k].completed) {
                builtByAnyone = true;
                break;
              }
            }
            if (builtByAnyone) break;
          }
          if (!builtByAnyone) {
            allMonumentsBuilt = false;
            break;
          }
        }
        if (allMonumentsBuilt) {
          if (isSoloMode || players.length === 1) {
            endGame();
          } else {
            setGameEndTriggered(true);
          }
          return;
        }
      }
    }
  }

  function handleResetBuild() {
    if (!buildPhaseInitialState) return;

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Calculate workers to return (only workers placed during this turn)
    let workersToReturn = 0;

    // Calculate workers placed on cities during this turn
    for (let i = 0; i < player.cities.length; i++) {
      const initialProgress = buildPhaseInitialState.cities[i].progress;
      const currentProgress = player.cities[i].progress;
      workersToReturn += currentProgress - initialProgress;
    }

    // Calculate workers placed on monuments during this turn
    for (let i = 0; i < player.monuments.length; i++) {
      const initialMonument = buildPhaseInitialState.monuments.find(m => m.id === player.monuments[i].id);
      if (initialMonument) {
        const initialProgress = initialMonument.progress;
        const currentProgress = player.monuments[i].progress;
        workersToReturn += currentProgress - initialProgress;
      }
    }

    // Restore initial state
    for (let i = 0; i < player.cities.length; i++) {
      player.cities[i].built = buildPhaseInitialState.cities[i].built;
      player.cities[i].progress = buildPhaseInitialState.cities[i].progress;
    }

    for (let i = 0; i < player.monuments.length; i++) {
      const initialMonument = buildPhaseInitialState.monuments.find(m => m.id === player.monuments[i].id);
      if (initialMonument) {
        player.monuments[i].progress = initialMonument.progress;
        player.monuments[i].completed = initialMonument.completed;
        player.monuments[i].firstToComplete = initialMonument.firstToComplete;
      }
    }

    setPendingWorkers(pendingWorkers + workersToReturn);
    setPlayers(newPlayers);
  }

  function handleSkipBuild() {
    // Vérifier si le joueur peut encore placer des ouvriers
    if (pendingWorkers > 0) {
      const player = players[currentPlayerIndex];
      let canPlaceWorkers = false;

      // Vérifier si des cités peuvent être construites
      for (let i = 0; i < player.cities.length; i++) {
        if (!player.cities[i].built) {
          canPlaceWorkers = true;
          break;
        }
      }

      // Vérifier si des monuments peuvent être construits
      if (!canPlaceWorkers) {
        for (let i = 0; i < player.monuments.length; i++) {
          if (!player.monuments[i].completed) {
            canPlaceWorkers = true;
            break;
          }
        }
      }

      // Si le joueur peut encore placer des ouvriers, on ne permet pas de passer
      if (canPlaceWorkers) {
        return;
      }
    }

    setPendingWorkers(0);
    setPendingFoodOrWorkers(0);
    setStoneToTradeForWorkers(0);
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
      setStoneToTradeForWorkers(amount);
      setPlayers(newPlayers);
    }
  }

  function handleResetStone() {
    if (stoneToTradeForWorkers > 0) {
      const newPlayers = [...players];
      const player = newPlayers[currentPlayerIndex];

      player.goodsPositions.stone += stoneToTradeForWorkers;
      setPendingWorkers(pendingWorkers - (stoneToTradeForWorkers * 3));
      setStoneToTradeForWorkers(0);
      setPlayers(newPlayers);
    }
  }

  const [originalGoodsPositions, setOriginalGoodsPositions] = useState(null);
  const [originalCoins, setOriginalCoins] = useState(0);
  const [originalDevelopments, setOriginalDevelopments] = useState(null);
  const [selectedDevelopmentToBuy, setSelectedDevelopmentToBuy] = useState(null);
  const [selectedGoodsForPurchase, setSelectedGoodsForPurchase] = useState({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
  const [coinsForPurchase, setCoinsForPurchase] = useState(0);
  const [lastPurchasedDevelopment, setLastPurchasedDevelopment] = useState(null);
  const [buildPhaseInitialState, setBuildPhaseInitialState] = useState(null);
  const [tempGoodsPositions, setTempGoodsPositions] = useState(null);

  function handleSelectDevelopment(devId) {
    const dev = DEVELOPMENTS.find(d => d.id === devId);
    if (!dev) return;

    const player = players[currentPlayerIndex];
    const totalValue = getGoodsValue(player.goodsPositions) + pendingCoins;

    if (totalValue >= dev.cost && player.developments.indexOf(devId) === -1) {
      // Si le montant total est exactement égal au coût, acheter automatiquement
      if (totalValue === dev.cost) {
        handleAutoBuyDevelopment(dev);
      } else {
        // Sinon, demander au joueur de choisir les ressources
        // Par défaut, aucune ressource n'est utilisée (valeur 0), seules les pièces comptent
        setSelectedDevelopmentToBuy(dev);
        setSelectedGoodsForPurchase({
          wood: 0,
          stone: 0,
          pottery: 0,
          cloth: 0,
          spearheads: 0
        });
        setCoinsForPurchase(pendingCoins); // Automatically include coins
      }
    }
  }

  function handleAutoBuyDevelopment(dev) {
    console.log('🛒 handleAutoBuyDevelopment', { isSoloMode, soloTurn });
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Save original state only if not already saved (first purchase this turn)
    if (!originalGoodsPositions) {
      setOriginalGoodsPositions({ ...player.goodsPositions });
      setOriginalCoins(pendingCoins);
      setOriginalDevelopments([...player.developments]);
    }

    // Use all coins first
    let remaining = dev.cost - pendingCoins;
    setPendingCoins(0);

    // Use goods from most expensive to least expensive
    if (remaining > 0) {
      const goodsOrder = ['spearheads', 'cloth', 'pottery', 'stone', 'wood'];
      for (let i = 0; i < goodsOrder.length; i++) {
        const type = goodsOrder[i];
        while (player.goodsPositions[type] > 0 && remaining > 0) {
          const currentValue = GOODS_VALUES[type][player.goodsPositions[type]];
          const previousValue = GOODS_VALUES[type][player.goodsPositions[type] - 1];
          const valueToDeduct = currentValue - previousValue;
          player.goodsPositions[type]--;
          remaining -= valueToDeduct;
        }
      }
    }

    player.developments.push(dev.id);
    setPlayers(newPlayers);

    // Store last purchased development
    setLastPurchasedDevelopment(dev);

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
    const newSelected = { ...selectedGoodsForPurchase };

    if (newSelected[type] === 0) {
      // Click: use this resource (set to max position to add its value)
      newSelected[type] = player.goodsPositions[type];
    } else {
      // Click again: don't use this resource (set to 0 to remove its value)
      newSelected[type] = 0;
    }

    setSelectedGoodsForPurchase(newSelected);
  }

  function calculateSelectedValue() {
    let total = coinsForPurchase;
    for (const type of GOODS_TYPES) {
      const position = selectedGoodsForPurchase[type];
      if (position > 0) {
        total += GOODS_VALUES[type][position];
      }
    }
    return total;
  }

  function handleConfirmPurchase() {
    if (!selectedDevelopmentToBuy) return;

    const selectedValue = calculateSelectedValue();
    if (selectedValue < selectedDevelopmentToBuy.cost) return;

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Save original state only if not already saved (first purchase this turn)
    if (!originalGoodsPositions) {
      setOriginalGoodsPositions({ ...player.goodsPositions });
      setOriginalCoins(pendingCoins);
      setOriginalDevelopments([...player.developments]);
    }

    // Apply the purchase
    for (const type of GOODS_TYPES) {
      player.goodsPositions[type] -= selectedGoodsForPurchase[type];
    }
    setPendingCoins(pendingCoins - coinsForPurchase);

    player.developments.push(selectedDevelopmentToBuy.id);
    setPlayers(newPlayers);

    // Store last purchased development
    setLastPurchasedDevelopment(selectedDevelopmentToBuy);

    // Reset selection state (but keep lastPurchasedDevelopment for display)
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);
    setFoodToTradeForCoins(0);

    // Check end game condition based on variant (but not in test mode or solo mode)
    if (!testMode && !isSoloMode && player.developments.length >= variantConfig.endGameConditions.developmentCount) {
      if (players.length === 1) {
        endGame();
      } else {
        setGameEndTriggered(true);
      }
      return;
    }
  }

  function handleCancelPurchaseSelection() {
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);
  }

  function handleResetBuy() {
    if (originalGoodsPositions) {
      const newPlayers = [...players];
      const player = newPlayers[currentPlayerIndex];

      // Restore original goods, coins, and developments
      player.goodsPositions = { ...originalGoodsPositions };
      player.developments = [...originalDevelopments];
      setPendingCoins(originalCoins);

      setPlayers(newPlayers);
      setOriginalGoodsPositions(null);
      setOriginalCoins(0);
      setOriginalDevelopments(null);
      setLastPurchasedDevelopment(null);
    }
  }

  function handleSkipBuy() {
    console.log('⏭️ handleSkipBuy called', { isSoloMode, soloTurn });
    setPendingCoins(0);
    setOriginalGoodsPositions(null);
    setOriginalCoins(0);
    setOriginalDevelopments(null);
    setLastPurchasedDevelopment(null);
    setFoodToTradeForCoins(0);
    console.log('➡️ Calling checkAndSkipDiscard from handleSkipBuy');
    checkAndSkipDiscard();
  }

  function handleTradeFood(amount) {
    if (amount < 0) return;

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const granariesRate = getGranariesRate();

    // Calculate the difference to know how much food to add/remove
    const difference = amount - foodToTradeForCoins;

    // Check if we have enough food (current food + already traded food >= new amount)
    const totalFoodAvailable = player.food + foodToTradeForCoins;

    if (amount <= totalFoodAvailable) {
      // Update food and coins based on the difference
      player.food -= difference;
      setPendingCoins(pendingCoins + (difference * granariesRate));
      setFoodToTradeForCoins(amount);
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
      setFoodToTradeForCoins(0);
      setPlayers(newPlayers);
    }
  }

  function handleDiscardGood(type) {
    if (tempGoodsPositions && tempGoodsPositions[type] > 0) {
      setTempGoodsPositions({
        ...tempGoodsPositions,
        [type]: tempGoodsPositions[type] - 1
      });
    }
  }

  function handleContinueDiscard() {
    if (!tempGoodsPositions) return;

    const newPlayers = [...players];
    newPlayers[currentPlayerIndex] = {
      ...newPlayers[currentPlayerIndex],
      goodsPositions: tempGoodsPositions
    };
    setPlayers(newPlayers);
    setTempGoodsPositions(null);

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
    setFoodToTradeForCoins(0);
    setStoneToTradeForWorkers(0);
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
    // Calculate score breakdown and resources for each player
    const playersWithDetails = players.map(function(player) {
      let developmentScore = 0;
      for (let j = 0; j < player.developments.length; j++) {
        const devId = player.developments[j];
        for (let k = 0; k < DEVELOPMENTS.length; k++) {
          if (DEVELOPMENTS[k].id === devId) {
            developmentScore += DEVELOPMENTS[k].points;
            break;
          }
        }
      }

      let monumentScore = 0;
      for (let j = 0; j < player.monuments.length; j++) {
        const m = player.monuments[j];
        if (m.completed) {
          for (let k = 0; k < MONUMENTS.length; k++) {
            if (MONUMENTS[k].id === m.id) {
              const monument = MONUMENTS[k];
              monumentScore += m.firstToComplete ? monument.points[0] : monument.points[1];
              break;
            }
          }
        }
      }

      let bonusScore = 0;

      if (player.developments.indexOf('architecture') !== -1) {
        let completedCount = 0;
        for (let j = 0; j < player.monuments.length; j++) {
          if (player.monuments[j].completed) completedCount++;
        }
        let architectureDev = null;
        for (let k = 0; k < DEVELOPMENTS.length; k++) {
          if (DEVELOPMENTS[k].id === 'architecture') {
            architectureDev = DEVELOPMENTS[k];
            break;
          }
        }
        const multiplier = architectureDev && architectureDev.cost >= 60 ? 2 : 1;
        bonusScore += completedCount * multiplier;
      }

      if (player.developments.indexOf('empire') !== -1) {
        let cityCount = 3;
        for (let j = 0; j < player.cities.length; j++) {
          if (player.cities[j].built) cityCount++;
        }
        bonusScore += cityCount;
      }

      if (player.developments.indexOf('commerce') !== -1) {
        const totalGoodsCount = getTotalGoodsCount(player.goodsPositions);
        bonusScore += totalGoodsCount;
      }

      const totalResourcesCount = getTotalGoodsCount(player.goodsPositions) + player.food;

      return {
        player: player,
        developmentScore: developmentScore,
        monumentScore: monumentScore,
        bonusScore: bonusScore,
        disasterScore: player.disasters,
        totalScore: player.score,
        totalResourcesCount: totalResourcesCount
      };
    });

    // Sort by score, then by resources for tie-breaking
    const sortedPlayers = [...playersWithDetails].sort(function(a, b) {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // Tie-break by total resources
      return b.totalResourcesCount - a.totalResourcesCount;
    });

    // Determine winners (handle ties)
    const winnerScore = sortedPlayers[0].totalScore;
    const winnersWithSameScore = sortedPlayers.filter(p => p.totalScore === winnerScore);
    const isTie = winnersWithSameScore.length > 1;

    let winners = [];
    if (isTie) {
      const maxResources = Math.max(...winnersWithSameScore.map(p => p.totalResourcesCount));
      winners = winnersWithSameScore.filter(p => p.totalResourcesCount === maxResources);
    } else {
      winners = [sortedPlayers[0]];
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-amber-800">
            🏆 Partie terminée !
          </h1>

          {sortedPlayers.map(function(playerDetail, i) {
            const player = playerDetail.player;
            const isWinner = winners.some(w => w.player.name === player.name);
            const showResources = isTie && winnersWithSameScore.some(w => w.player.name === player.name);

            return (
              <div key={i} className={'mb-4 p-6 rounded-lg ' + (
                isWinner ? 'bg-yellow-100 border-4 border-yellow-400' : 'bg-gray-100'
              )}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold">
                    {isWinner ? '👑 ' : ''}
                    {player.name}
                  </h3>
                  <div className="text-4xl font-bold text-amber-700">
                    {playerDetail.totalScore} pts
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <table className="w-full text-base">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-gray-700">Développements</td>
                        <td className="py-2 text-right font-semibold text-gray-900">{playerDetail.developmentScore}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-gray-700">Monuments</td>
                        <td className="py-2 text-right font-semibold text-gray-900">+ {playerDetail.monumentScore}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-gray-700">Bonus</td>
                        <td className="py-2 text-right font-semibold text-gray-900">+ {playerDetail.bonusScore}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-gray-700">Catastrophes</td>
                        <td className="py-2 text-right font-semibold text-red-600">- {playerDetail.disasterScore}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-400">
                        <td className="py-2 text-gray-900 font-bold">Total</td>
                        <td className="py-2 text-right font-bold text-amber-700 text-lg">= {playerDetail.totalScore}</td>
                      </tr>
                      {showResources && (
                        <tr className="border-t border-gray-200">
                          <td className="py-2 text-amber-700 font-semibold">Ressources restantes</td>
                          <td className="py-2 text-right font-semibold text-amber-700">{playerDetail.totalResourcesCount}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-amber-700 transition mt-8 cursor-pointer"
          >
            Nouvelle partie
          </button>
        </div>
      </div>
    );
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200 p-4">
      {/* Player Turn Modal */}
      {showPlayerTurnModal && (
        <div className="fixed inset-0 bg-amber-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-amber-800">
              Tour de {currentPlayer.name}
            </h2>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎲</div>
              <p className="text-gray-600">
                {gameEndTriggered ? 'Dernier tour !' : `Manche ${round}`}
              </p>
            </div>
            <button
              onClick={() => setShowPlayerTurnModal(false)}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-amber-700 transition cursor-pointer"
            >
              Commencer mon tour
            </button>
          </div>
        </div>
      )}

      <div className="h-full flex flex-col">
        <div className="bg-white rounded-lg shadow-lg py-2 px-4 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-amber-800">
              Roll Through the Ages{players.length > 1 ? ' - Manche ' + round : ''}
            </h1>
            <div className="flex items-center gap-4">
              {import.meta.env.VITE_ENABLE_TEST_MODE === 'true' && (
                <button
                  onClick={handleToggleTestMode}
                  className={'px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer ' + (
                    testMode
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  )}
                >
                  {testMode ? '🧪 Mode Test ON' : '🧪 Mode Test'}
                </button>
              )}
              {isSoloMode && (
                <div className="text-xl font-bold text-amber-700 bg-amber-100 px-4 py-2 rounded-lg">
                  Tour {soloTurn}/10
                </div>
              )}
                <div className="text-xl font-bold text-amber-700 bg-amber-100 px-4 py-2 rounded-lg">
                { 'Score : ' + currentPlayer.score }
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {players.length > 1 ? 'Tour de ' + currentPlayer.name : currentPlayer.name}
              </div>
            </div>
          </div>
        </div>

        {/* Dice Display - Compact bar with phase info and action buttons */}
        <div className="flex-shrink-0 bg-white rounded-lg shadow-lg px-4 py-3 mb-4 flex items-center gap-4 min-h-24">
          {(diceResults || (phase === 'roll' && isRolling) || phase === 'choose_food_or_workers') && (
            <div className="flex gap-2">
              {diceResults ? (
                diceResults.map(function(result, i) {
                  const isLocked = lockedDice.indexOf(i) !== -1;
                  const hasSkulls = result && result.skulls > 0;
                  const canToggle = phase === 'roll' && (!hasSkulls || (leadershipMode || (isSoloMode && !variantConfig.soloSkullsLocked)));
                  const isDiceRolling = rollingDice.indexOf(i) !== -1;

                  // Check if this is a food_or_workers die in choose phase
                  let foodOrWorkerIndex = -1;
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
                  }

                  // Déterminer l'image de la face du dé
                  let imageSrc = '';
                  let isClickable = false;

                  if (foodOrWorkerIndex !== -1 && foodOrWorkerIndex < foodOrWorkerChoices.length) {
                    const choice = foodOrWorkerChoices[foodOrWorkerIndex];
                    if (choice === 'none') {
                      imageSrc = '/src/assets/food-workers.png';
                    } else if (choice === 'food') {
                      imageSrc = '/src/assets/food-selection.png';
                    } else if (choice === 'workers') {
                      imageSrc = '/src/assets/worker-selection.png';
                    }
                    isClickable = true;
                  } else if (result.type === 'food') {
                    // Use selection image if this was a food/workers choice
                    imageSrc = result.wasChoice ? '/src/assets/food-selection.png' : '/src/assets/food.png';
                  } else if (result.type === 'goods') {
                    if (result.skulls > 0 && result.value === 2) {
                      imageSrc = '/src/assets/crane-goods.png';
                    } else {
                      imageSrc = '/src/assets/good.png';
                    }
                  } else if (result.type === 'workers') {
                    // Use selection image if this was a food/workers choice
                    imageSrc = result.wasChoice ? '/src/assets/worker-selection.png' : '/src/assets/workers.png';
                  } else if (result.type === 'food_or_workers') {
                    imageSrc = '/src/assets/food-workers.png';
                  } else if (result.type === 'coins') {
                    imageSrc = '/src/assets/coin.png';
                  }

                  return (
                    <div key={i} className="relative w-16 h-16">
                      {isDiceRolling ? (
                        <div className="w-16 h-16 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        </div>
                      ) : (
                        <img
                          src={imageSrc}
                          alt={result.type}
                          onClick={isClickable ? () => handleToggleFoodOrWorkerDie(foodOrWorkerIndex) : (canToggle ? () => toggleLock(i) : undefined)}
                          className={'w-16 h-16 object-contain transition rounded-lg ' +
                            (isClickable || canToggle ? 'cursor-pointer hover:opacity-80 ' : 'cursor-default ') +
                            (isLocked && result.skulls > 0 ? 'ring-4 ring-red-500 ' :
                             isLocked ? 'ring-4 ring-amber-500 ' : '')}
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  <span className="text-sm font-semibold text-gray-700">Lancer en cours...</span>
                </div>
              )}
            </div>
          )}

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
        <div className="flex-1 min-h-0">
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
