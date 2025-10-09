import { useState, useEffect, useMemo } from 'react';
import { GOODS_TYPES, GOODS_VALUES, DICE_FACES } from '../constants/gameData';
import { getVariantById } from '../constants/variants';
import { addGoods, handleDisasters, getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';
import { addScore } from '../utils/scoreHistory';
import PlayerScorePanel from './PlayerScorePanel';
import ActionPanel from './ActionPanel';
import DisasterHelp from './shared/DisasterHelp';

export default function Game({ playerNames, variantId, isSoloMode }) {
  // Load variant configuration
  const variantConfig = useMemo(function() {
    return getVariantById(variantId);
  }, [variantId]);

  const MONUMENTS = variantConfig.monuments;
  const DEVELOPMENTS = variantConfig.developments;

  const [players, setPlayers] = useState(function() {
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

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [soloTurn, setSoloTurn] = useState(isSoloMode ? 1 : 0);
  const [phase, setPhase] = useState('roll');
  const [diceResults, setDiceResults] = useState(null);
  const [rollCount, setRollCount] = useState(0);
  const [lockedDice, setLockedDice] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [pendingWorkers, setPendingWorkers] = useState(0);
  const [pendingFoodOrWorkers, setPendingFoodOrWorkers] = useState(0);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [leadershipUsed, setLeadershipUsed] = useState(false);
  const [leadershipMode, setLeadershipMode] = useState(false);
  const [foodToTradeForCoins, setFoodToTradeForCoins] = useState(0);
  const [stoneToTradeForWorkers, setStoneToTradeForWorkers] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [gameEndTriggered, setGameEndTriggered] = useState(false);
  const [showPlayerTurnModal, setShowPlayerTurnModal] = useState(!isSoloMode && playerNames.length > 1);

  const currentPlayer = players[currentPlayerIndex];
  let numDice = 3;
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) numDice++;
  }

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

  // Auto-roll dice when entering roll phase
  useEffect(function() {
    if (phase === 'roll' && !diceResults) {
      rollDice(true);
    }
  }, [phase]);

  function rollDice(initial) {
    setIsRolling(true);
    let diceToRoll = [];

    if (initial) {
      for (let i = 0; i < numDice; i++) {
        diceToRoll.push(i);
      }
    } else {
      for (let i = 0; i < diceResults.length; i++) {
        if (lockedDice.indexOf(i) === -1) {
          diceToRoll.push(i);
        }
      }
    }

    setTimeout(function() {
      const newResults = [...diceResults || []];
      for (let i = 0; i < diceToRoll.length; i++) {
        const idx = diceToRoll[i];
        newResults[idx] = DICE_FACES[Math.floor(Math.random() * 6)];
      }
      setDiceResults(newResults);
      setIsRolling(false);

      // Skulls auto-locked unless in solo mode AND variant allows rerolling skulls
      const shouldLockSkulls = !isSoloMode || variantConfig.soloSkullsLocked;
      if (shouldLockSkulls) {
        const newLocked = [...lockedDice];
        for (let i = 0; i < newResults.length; i++) {
          const result = newResults[i];
          if (result && result.skulls > 0 && newLocked.indexOf(i) === -1) {
            newLocked.push(i);
          }
        }
        setLockedDice(newLocked);
      }
    }, 600);
  }

  function toggleLock(index) {
    // Skulls cannot be unlocked unless in solo mode AND variant allows rerolling skulls
    const skullsAreLocked = !isSoloMode || variantConfig.soloSkullsLocked;
    if (skullsAreLocked && diceResults[index] && diceResults[index].skulls > 0) return;

    const currentIndex = lockedDice.indexOf(index);
    if (currentIndex === -1) {
      setLockedDice([...lockedDice, index]);
    } else {
      const newLocked = [...lockedDice];
      newLocked.splice(currentIndex, 1);
      setLockedDice(newLocked);
    }
  }

  function handleReroll() {
    if (rollCount < 2 && lockedDice.length < diceResults.length) {
      setRollCount(rollCount + 1);
      rollDice(false);
    }
  }

  function handleKeep() {
    processResults(diceResults);
  }

  function handleUseLeadership() {
    // When entering leadership mode, lock all dice (user will unlock the one they want to reroll)
    const allLocked = [];
    for (let i = 0; i < diceResults.length; i++) {
      allLocked.push(i);
    }
    setLockedDice(allLocked);
    setLeadershipMode(true);
    setLeadershipUsed(true);
  }

  function handleLeadershipReroll() {
    // Count how many dice are unlocked in leadership mode (skulls allowed)
    let unlockedCount = 0;
    for (let i = 0; i < diceResults.length; i++) {
      const isLocked = lockedDice.indexOf(i) !== -1;
      if (!isLocked) {
        unlockedCount++;
      }
    }

    // Only allow if exactly 1 die is unlocked
    if (unlockedCount === 1) {
      rollDice(false);
      setLeadershipMode(false);
    }
  }

  function handleCancelLeadership() {
    // Reset locks to only skull dice (or all dice if in multiplayer/variant that locks skulls)
    setLeadershipMode(false);
    const skullsAreLocked = !isSoloMode || variantConfig.soloSkullsLocked;
    const newLocked = [];
    for (let i = 0; i < diceResults.length; i++) {
      const result = diceResults[i];
      if (skullsAreLocked && result && result.skulls > 0) {
        newLocked.push(i);
      }
    }
    setLockedDice(newLocked);
  }

  function processResults(results) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    let skulls = 0;
    for (let i = 0; i < results.length; i++) {
      skulls += results[i].skulls;
    }

    let foodToAdd = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.type === 'food') {
        foodToAdd += r.value;
        if (player.developments.indexOf('agriculture') !== -1) {
          foodToAdd += 1;
        }
      }
    }
    player.food = Math.min(player.food + foodToAdd, 15);

    let goodsToAdd = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].type === 'goods') {
        goodsToAdd += results[i].value;
      }
    }
    addGoods(player, goodsToAdd);

    let workers = 0;
    let foodOrWorkersDice = 0;
    let coins = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.type === 'workers') {
        workers += r.value;
        if (player.developments.indexOf('masonry') !== -1) {
          workers += 1;
        }
      }
      if (r.type === 'food_or_workers') {
        foodOrWorkersDice += 1; // Compte le nombre de dés, pas la valeur
      }
      if (r.type === 'coins') {
        coins += r.value;
        if (player.developments.indexOf('coinage') !== -1) {
          coins += 5;
        }
      }
    }

    setPendingWorkers(workers);
    setPendingFoodOrWorkers(foodOrWorkersDice);
    setPendingCoins(coins);

    handleDisasters(newPlayers, currentPlayerIndex, skulls);

    setPlayers(newPlayers);

    if (foodOrWorkersDice > 0) {
      setPhase('choose_food_or_workers');
    } else {
      setPhase('feed');
    }
  }

  function handleUseFoodOrWorkers(foodDiceCount) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const workerDiceCount = pendingFoodOrWorkers - foodDiceCount;

    // Add food - chaque dé donne 2 nourriture de base
    let foodToAdd = foodDiceCount * 2;
    if (player.developments.indexOf('agriculture') !== -1) {
      foodToAdd += foodDiceCount; // Agriculture ajoute +1 par dé
    }
    player.food = Math.min(player.food + foodToAdd, 15);

    // Add workers - chaque dé donne 2 ouvriers de base
    let workersToAdd = workerDiceCount * 2;
    if (player.developments.indexOf('masonry') !== -1) {
      workersToAdd += workerDiceCount; // Maçonnerie ajoute +1 par dé
    }
    setPendingWorkers(pendingWorkers + workersToAdd);

    setPendingFoodOrWorkers(0);
    setPlayers(newPlayers);
    setPhase('feed');
  }

  function handleFeed() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    let citiesToFeed = 3;
    for (let i = 0; i < player.cities.length; i++) {
      if (player.cities[i].built) citiesToFeed++;
    }

    if (player.food < citiesToFeed) {
      const unfedCities = citiesToFeed - player.food;
      player.disasters += unfedCities;
      player.food = 0;
    } else {
      player.food -= citiesToFeed;
    }

    setPlayers(newPlayers);

    // Skip build phase if no workers
    if (pendingWorkers === 0) {
      skipToBuyPhase();
    } else {
      // Save the initial state before entering build phase
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
      setPhase('buy');
    }
  }

  function checkAndSkipDiscard() {
    const player = players[currentPlayerIndex];
    const totalGoods = getTotalGoodsCount(player.goodsPositions);
    const hasCaravans = player.developments.indexOf('caravans') !== -1;

    // Skip discard phase if player has 6 or fewer goods, or has Caravans
    if (totalGoods <= 6 || hasCaravans) {
      nextTurn();
    } else {
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

  function handleSelectDevelopment(devId) {
    const dev = DEVELOPMENTS.find(d => d.id === devId);
    if (!dev) return;

    const player = players[currentPlayerIndex];
    const totalValue = getGoodsValue(player.goodsPositions) + pendingCoins;

    if (totalValue >= dev.cost && player.developments.indexOf(devId) === -1) {
      if (originalGoodsPositions) {
        return; // Already purchased something this turn
      }

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
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Save original state
    setOriginalGoodsPositions({ ...player.goodsPositions });
    setOriginalCoins(pendingCoins);
    setOriginalDevelopments([...player.developments]);

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
      if (players.length === 1) {
        endGame();
      } else {
        setGameEndTriggered(true);
      }
      return;
    }
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

    // Save original state
    setOriginalGoodsPositions({ ...player.goodsPositions });
    setOriginalCoins(pendingCoins);
    setOriginalDevelopments([...player.developments]);

    // Apply the purchase
    for (const type of GOODS_TYPES) {
      player.goodsPositions[type] -= selectedGoodsForPurchase[type];
    }
    setPendingCoins(pendingCoins - coinsForPurchase);

    player.developments.push(selectedDevelopmentToBuy.id);
    setPlayers(newPlayers);

    // Reset selection and state
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);
    setOriginalGoodsPositions(null);
    setOriginalCoins(0);
    setOriginalDevelopments(null);
    setLastPurchasedDevelopment(null);
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

    // Automatically proceed to next phase
    checkAndSkipDiscard();
  }

  function handleCancelPurchaseSelection() {
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);
  }

  function handleBuyDevelopment(devId) {
    let dev = null;
    for (let i = 0; i < DEVELOPMENTS.length; i++) {
      if (DEVELOPMENTS[i].id === devId) {
        dev = DEVELOPMENTS[i];
        break;
      }
    }

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const totalValue = getGoodsValue(player.goodsPositions) + pendingCoins;

    if (totalValue >= dev.cost && player.developments.indexOf(devId) === -1) {
      // Only allow one purchase per turn
      if (originalGoodsPositions) {
        return; // Already purchased something this turn
      }

      // Save original state before purchase
      setOriginalGoodsPositions({ ...player.goodsPositions });
      setOriginalCoins(pendingCoins);
      setOriginalDevelopments([...player.developments]);

      let remaining = dev.cost;

      if (pendingCoins > 0) {
        const coinsUsed = Math.min(pendingCoins, remaining);
        remaining -= coinsUsed;
        setPendingCoins(pendingCoins - coinsUsed);
      }

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

      player.developments.push(devId);
      setPlayers(newPlayers);

      // Check end game condition based on variant
      if (player.developments.length >= variantConfig.endGameConditions.developmentCount) {
        endGame();
        return;
      }
    }
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
    setPendingCoins(0);
    setOriginalGoodsPositions(null);
    setOriginalCoins(0);
    setOriginalDevelopments(null);
    setLastPurchasedDevelopment(null);
    setFoodToTradeForCoins(0);
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

  function handleDiscard() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    if (player.developments.indexOf('caravans') === -1) {
      let totalGoods = getTotalGoodsCount(player.goodsPositions);

      while (totalGoods > 6) {
        for (let i = GOODS_TYPES.length - 1; i >= 0; i--) {
          const type = GOODS_TYPES[i];
          if (player.goodsPositions[type] > 0) {
            player.goodsPositions[type]--;
            totalGoods--;
            break;
          }
        }
      }
    }

    setPlayers(newPlayers);
    nextTurn();
  }

  function nextTurn() {
    const isLastPlayer = currentPlayerIndex === players.length - 1;

    if (isLastPlayer) {
      // End of round - check if game should end
      if (gameEndTriggered && !isSoloMode) {
        endGame();
        return;
      }

      setRound(round + 1);
      setCurrentPlayerIndex(0);

      // In solo mode, increment turn counter and check if game should end
      if (isSoloMode) {
        const nextTurn = soloTurn + 1;
        setSoloTurn(nextTurn);

        if (nextTurn > 10) {
          endGame();
          return;
        }
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
    setDiceResults(null);
    setRollCount(0);
    setLockedDice([]);
    setPendingCoins(0);
    setLeadershipUsed(false);
    setLeadershipMode(false);
    setFoodToTradeForCoins(0);
    setStoneToTradeForWorkers(0);
  }

  function calculatePlayerScore(player) {
    let score = 0;

    for (let j = 0; j < player.developments.length; j++) {
      const devId = player.developments[j];
      for (let k = 0; k < DEVELOPMENTS.length; k++) {
        if (DEVELOPMENTS[k].id === devId) {
          score += DEVELOPMENTS[k].points;
          break;
        }
      }
    }

    for (let j = 0; j < player.monuments.length; j++) {
      const m = player.monuments[j];
      if (m.completed) {
        for (let k = 0; k < MONUMENTS.length; k++) {
          if (MONUMENTS[k].id === m.id) {
            const monument = MONUMENTS[k];
            score += m.firstToComplete ? monument.points[0] : monument.points[1];
            break;
          }
        }
      }
    }

    if (player.developments.indexOf('architecture') !== -1) {
      let completedCount = 0;
      for (let j = 0; j < player.monuments.length; j++) {
        if (player.monuments[j].completed) completedCount++;
      }
      // Find the architecture development to get the correct multiplier for this variant
      let architectureDev = null;
      for (let k = 0; k < DEVELOPMENTS.length; k++) {
        if (DEVELOPMENTS[k].id === 'architecture') {
          architectureDev = DEVELOPMENTS[k];
          break;
        }
      }
      // Late Bronze Age: 2 points per monument, Bronze Age: 1 point per monument
      const multiplier = architectureDev && architectureDev.cost >= 60 ? 2 : 1;
      score += completedCount * multiplier;
    }

    if (player.developments.indexOf('empire') !== -1) {
      let cityCount = 3;
      for (let j = 0; j < player.cities.length; j++) {
        if (player.cities[j].built) cityCount++;
      }
      score += cityCount;
    }

    // Commerce development (Late Bronze Age only)
    if (player.developments.indexOf('commerce') !== -1) {
      const totalGoodsCount = getTotalGoodsCount(player.goodsPositions);
      score += totalGoodsCount;
    }

    score -= player.disasters;

    return score;
  }

  // Update scores in real-time
  useEffect(function() {
    const newPlayers = [...players];
    let hasChanged = false;

    for (let i = 0; i < newPlayers.length; i++) {
      const newScore = calculatePlayerScore(newPlayers[i]);
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
    const newPlayers = [...players];

    for (let i = 0; i < newPlayers.length; i++) {
      newPlayers[i].score = calculatePlayerScore(newPlayers[i]);
    }

    setPlayers(newPlayers);
    setGameEnded(true);

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
    const sortedPlayers = [...players].sort(function(a, b) {
      return b.score - a.score;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-amber-800">
            🏆 Partie terminée !
          </h1>

          {sortedPlayers.map(function(player, i) {
            let completedMonuments = 0;
            for (let j = 0; j < player.monuments.length; j++) {
              if (player.monuments[j].completed) completedMonuments++;
            }

            return (
              <div key={i} className={'mb-4 p-6 rounded-lg ' + (
                i === 0 ? 'bg-yellow-100 border-4 border-yellow-400' : 'bg-gray-100'
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {i === 0 ? '👑 ' : ''}
                      {player.name}
                    </h3>
                    <p className="text-gray-600">
                      Développements: {player.developments.length} |
                      Monuments: {completedMonuments}
                    </p>
                  </div>
                  <div className="text-4xl font-bold text-amber-700">
                    {player.score} pts
                  </div>
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

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200 p-4">
      {/* Player Turn Modal */}
      {showPlayerTurnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex-shrink-0">
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
                  Tour {soloTurn}/10 · Reste {11 - soloTurn} tour{11 - soloTurn > 1 ? 's' : ''}
                </div>
              )}
              <div className="text-lg font-semibold text-gray-700">
                {players.length > 1 ? 'Tour de ' + currentPlayer.name : currentPlayer.name}
              </div>
            </div>
          </div>
        </div>

        {/* Score Display */}
        {/* <div className="flex-shrink-0">
          <ScoreDisplay players={players} currentPlayerIndex={currentPlayerIndex} />
        </div> */}

        {/* Dice Display - Compact bar (always) */}
        {(diceResults || (phase === 'roll' && isRolling)) && (
          <div className="flex-shrink-0 bg-white rounded-lg shadow-lg px-4 py-3 mb-4 flex items-center gap-4 h-24">
            <div className="flex gap-2">
              {isRolling ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  <span className="text-sm font-semibold text-gray-700">Lancer en cours...</span>
                </div>
              ) : diceResults ? (
                diceResults.map(function(result, i) {
                  const isLocked = lockedDice.indexOf(i) !== -1;
                  const hasSkulls = result && result.skulls > 0;
                  const canToggle = phase === 'roll' && (!hasSkulls || (leadershipMode || (isSoloMode && !variantConfig.soloSkullsLocked)));

                  // Déterminer l'image de la face du dé
                  let imageSrc = '';

                  if (result.type === 'food') {
                    imageSrc = '/src/assets/food.png';
                  } else if (result.type === 'goods') {
                    if (result.skulls > 0 && result.value === 2) {
                      imageSrc = '/src/assets/crane-goods.png';
                    } else {
                      imageSrc = '/src/assets/good.png';
                    }
                  } else if (result.type === 'workers') {
                    imageSrc = '/src/assets/workers.png';
                  } else if (result.type === 'food_or_workers') {
                    imageSrc = '/src/assets/food-workers.png';
                  } else if (result.type === 'coins') {
                    imageSrc = '/src/assets/coin.png';
                  }

                  return (
                    <img
                      key={i}
                      src={imageSrc}
                      alt={result.type}
                      onClick={canToggle ? () => toggleLock(i) : undefined}
                      className={'w-16 h-16 object-contain transition rounded-lg ' +
                        (canToggle ? 'cursor-pointer hover:opacity-80 ' : 'cursor-default ') +
                        (isLocked && result.skulls > 0 ? 'ring-4 ring-red-500 ' :
                         isLocked ? 'ring-4 ring-amber-500 ' : '')}
                    />
                  );
                })
              ) : null}
            </div>
            {phase === 'roll' && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm font-bold text-amber-700">Lancer {rollCount + 1}/3</span>
                  <span className="text-xs text-gray-500">Cliquez pour verrouiller</span>
                </div>
                {(function() {
                  const hasLeadership = currentPlayer.developments.indexOf('leadership') !== -1;
                  const canReroll = rollCount < 2 && diceResults && lockedDice.length < diceResults.length;

                  if (canReroll && !leadershipMode && !isRolling) {
                    return (
                      <button
                        onClick={handleReroll}
                        className="h-16 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer whitespace-nowrap"
                      >
                        Relancer les dés non verrouillés
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4 flex-1 min-h-0">
          <div className="col-span-2">
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
            />
          </div>
          <div className="col-span-1">
            <ActionPanel
              phase={phase}
              diceResults={diceResults}
              rollCount={rollCount}
              lockedDice={lockedDice}
              isRolling={isRolling}
              onToggleLock={toggleLock}
              onReroll={handleReroll}
              onKeep={handleKeep}
              pendingFoodOrWorkers={pendingFoodOrWorkers}
              currentPlayer={currentPlayer}
              onChooseFoodOrWorkers={handleUseFoodOrWorkers}
              citiesToFeed={citiesToFeed}
              onFeed={handleFeed}
              pendingWorkers={pendingWorkers}
              onResetBuild={handleResetBuild}
              onSkipBuild={handleSkipBuild}
              stoneToTradeForWorkers={stoneToTradeForWorkers}
              onTradeStone={handleTradeStone}
              onResetStone={handleResetStone}
              pendingCoins={pendingCoins}
              onResetBuy={handleResetBuy}
              onSkipBuy={handleSkipBuy}
              hasPurchased={originalGoodsPositions !== null}
              selectedDevelopment={selectedDevelopmentToBuy}
              selectedGoods={selectedGoodsForPurchase}
              selectedCoins={coinsForPurchase}
              onToggleGood={handleToggleGoodForPurchase}
              onConfirmPurchase={handleConfirmPurchase}
              onCancelSelection={handleCancelPurchaseSelection}
              calculateSelectedValue={calculateSelectedValue}
              lastPurchasedDevelopment={lastPurchasedDevelopment}
              onDiscard={handleDiscard}
              leadershipUsed={leadershipUsed}
              leadershipMode={leadershipMode}
              onUseLeadership={handleUseLeadership}
              onLeadershipReroll={handleLeadershipReroll}
              onCancelLeadership={handleCancelLeadership}
              skullsCanBeToggled={leadershipMode || (isSoloMode && !variantConfig.soloSkullsLocked)}
              granariesRate={getGranariesRate()}
              foodToTradeForCoins={foodToTradeForCoins}
              onTradeFood={handleTradeFood}
              onResetTrade={handleResetTrade}
            />
          </div>
        </div>

        {/* Disaster Help Button */}
        <DisasterHelp currentPlayer={currentPlayer} developments={DEVELOPMENTS} />
      </div>
    </div>
  );
}
