import { useState, useEffect } from 'react';
import { MONUMENTS, DEVELOPMENTS, GOODS_TYPES, GOODS_VALUES, DICE_FACES } from '../constants/gameData';
import { addGoods, handleDisasters, getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';
import PlayerScorePanel from './PlayerScorePanel';
import ActionPanel from './ActionPanel';

export default function Game({ playerNames }) {
  const [players, setPlayers] = useState(function() {
    return playerNames.map(function(name, i) {
      // Déterminer quels monuments sont disponibles selon le nombre de joueurs
      const numPlayers = playerNames.length;
      const excludedMonuments = [];

      if (numPlayers <= 2) {
        // 1-2 joueurs : Temple et Grande Pyramide non accessibles
        excludedMonuments.push('temple', 'great_pyramid');
      } else if (numPlayers === 3) {
        // 3 joueurs : Jardins suspendus non accessibles
        excludedMonuments.push('hanging_gardens');
      }
      // 4 joueurs : tous les monuments disponibles

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
  const [phase, setPhase] = useState('roll');
  const [diceResults, setDiceResults] = useState(null);
  const [rollCount, setRollCount] = useState(0);
  const [lockedDice, setLockedDice] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [pendingWorkers, setPendingWorkers] = useState(0);
  const [pendingFoodOrWorkers, setPendingFoodOrWorkers] = useState(0);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  let numDice = 3;
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) numDice++;
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

      const newLocked = [...lockedDice];
      for (let i = 0; i < newResults.length; i++) {
        const result = newResults[i];
        if (result && result.skulls > 0 && newLocked.indexOf(i) === -1) {
          newLocked.push(i);
        }
      }
      setLockedDice(newLocked);
    }, 600);
  }

  function toggleLock(index) {
    if (diceResults[index] && diceResults[index].skulls > 0) return;

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
    setPhase('build');
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
    }
  }

  function handleResetBuild() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    // Reset city progress and return workers
    let workersToReturn = 0;
    for (let i = 0; i < player.cities.length; i++) {
      workersToReturn += player.cities[i].progress;
      player.cities[i].progress = 0;
      player.cities[i].built = false; // Reset built status
    }

    // Reset monument progress and return workers
    for (let i = 0; i < player.monuments.length; i++) {
      workersToReturn += player.monuments[i].progress;
      player.monuments[i].progress = 0;
      player.monuments[i].completed = false; // Reset completed status
      player.monuments[i].firstToComplete = false; // Reset first to complete
    }

    setPendingWorkers(pendingWorkers + workersToReturn);
    setPlayers(newPlayers);
  }

  function handleSkipBuild() {
    if (pendingWorkers > 0) {
      return; // Ne pas permettre de passer si des ouvriers restent
    }
    setPendingWorkers(0);
    setPendingFoodOrWorkers(0);
    setPhase('buy');
  }

  const [originalGoodsPositions, setOriginalGoodsPositions] = useState(null);
  const [originalCoins, setOriginalCoins] = useState(0);
  const [originalDevelopments, setOriginalDevelopments] = useState(null);
  const [selectedDevelopmentToBuy, setSelectedDevelopmentToBuy] = useState(null);
  const [selectedGoodsForPurchase, setSelectedGoodsForPurchase] = useState({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
  const [coinsForPurchase, setCoinsForPurchase] = useState(0);
  const [lastPurchasedDevelopment, setLastPurchasedDevelopment] = useState(null);

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

    if (player.developments.length >= 5) {
      endGame();
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

    // Store last purchased development
    setLastPurchasedDevelopment(selectedDevelopmentToBuy);

    // Reset selection
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);

    if (player.developments.length >= 5) {
      endGame();
      return;
    }
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

      if (player.developments.length >= 5) {
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
    setPhase('discard');
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
    if (currentPlayerIndex === players.length - 1) {
      setRound(round + 1);
      setCurrentPlayerIndex(0);
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }

    setPhase('roll');
    setDiceResults(null);
    setRollCount(0);
    setLockedDice([]);
    setPendingCoins(0);
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
      score += completedCount * 2;
    }

    if (player.developments.indexOf('empire') !== -1) {
      let cityCount = 3;
      for (let j = 0; j < player.cities.length; j++) {
        if (player.cities[j].built) cityCount++;
      }
      score += cityCount;
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

  function endGame() {
    const newPlayers = [...players];

    for (let i = 0; i < newPlayers.length; i++) {
      newPlayers[i].score = calculatePlayerScore(newPlayers[i]);
    }

    setPlayers(newPlayers);
    setGameEnded(true);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-amber-800">
              Roll Through the Ages{players.length > 1 ? ' - Manche ' + round : ''}
            </h1>
            <div className="text-lg font-semibold text-gray-700">
              {players.length > 1 ? 'Tour de ' + currentPlayer.name : currentPlayer.name}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4" style={{ height: 'calc(100vh - 180px)' }}>
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
          />
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
          />
        </div>
      </div>
    </div>
  );
}
