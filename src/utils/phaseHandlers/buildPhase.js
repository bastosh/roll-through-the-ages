/**
 * Build a city
 */
export function buildCity(player, cityIndex, pendingWorkers) {
  const city = player.cities[cityIndex];
  let newPendingWorkers = pendingWorkers;

  if (!city.built) {
    if (city.progress > 0 && pendingWorkers === 0) {
      // Remove a worker from city
      city.progress--;
      newPendingWorkers++;
    } else if (pendingWorkers >= 1) {
      // Add a worker to city
      city.progress++;
      if (city.progress >= city.requiredWorkers) {
        city.built = true;
      }
      newPendingWorkers--;
    }
  }

  return { player, newPendingWorkers };
}

/**
 * Build a monument
 */
export function buildMonument(player, monumentId, pendingWorkers, MONUMENTS, allPlayers, currentPlayerIndex) {
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

  let newPendingWorkers = pendingWorkers;
  let monumentCompleted = false;

  if (monument && !monument.completed && pendingWorkers >= 1) {
    // Add a worker to monument
    monument.progress++;
    if (monument.progress >= monumentDef.workers) {
      monument.completed = true;
      monumentCompleted = true;

      // Check if anyone else has completed this monument
      let anyoneElseCompleted = false;
      for (let i = 0; i < allPlayers.length; i++) {
        if (i !== currentPlayerIndex) {
          for (let j = 0; j < allPlayers[i].monuments.length; j++) {
            if (allPlayers[i].monuments[j].id === monumentId && allPlayers[i].monuments[j].completed) {
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
    newPendingWorkers--;
  }

  return { player, newPendingWorkers, monumentCompleted };
}

/**
 * Unbuild a monument (remove a worker)
 */
export function unbuildMonument(player, monumentId, pendingWorkers) {
  let monument = null;
  for (let i = 0; i < player.monuments.length; i++) {
    if (player.monuments[i].id === monumentId) {
      monument = player.monuments[i];
      break;
    }
  }

  let newPendingWorkers = pendingWorkers;

  if (monument && !monument.completed && monument.progress > 0) {
    // Remove a worker from monument
    monument.progress--;
    newPendingWorkers++;
  }

  return { player, newPendingWorkers };
}

/**
 * Check if all monuments have been collectively built
 */
export function checkAllMonumentsBuilt(MONUMENTS, allPlayers) {
  for (let i = 0; i < MONUMENTS.length; i++) {
    const monumentId = MONUMENTS[i].id;
    let builtByAnyone = false;
    for (let j = 0; j < allPlayers.length; j++) {
      for (let k = 0; k < allPlayers[j].monuments.length; k++) {
        if (allPlayers[j].monuments[k].id === monumentId && allPlayers[j].monuments[k].completed) {
          builtByAnyone = true;
          break;
        }
      }
      if (builtByAnyone) break;
    }
    if (!builtByAnyone) {
      return false;
    }
  }
  return true;
}

/**
 * Reset build phase to initial state
 */
export function resetBuild(player, buildPhaseInitialState) {
  if (!buildPhaseInitialState) return { player, workersToReturn: 0 };

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

  return { player, workersToReturn };
}

/**
 * Check if player can skip build phase
 */
export function canSkipBuild(player, pendingWorkers) {
  if (pendingWorkers === 0) return true;

  // Check if any city can be built
  for (let i = 0; i < player.cities.length; i++) {
    if (!player.cities[i].built) {
      return false;
    }
  }

  // Check if any monument can be built
  for (let i = 0; i < player.monuments.length; i++) {
    if (!player.monuments[i].completed) {
      return false;
    }
  }

  return true;
}

/**
 * Trade stone for workers
 */
export function tradeStone(player, amount, currentTradeAmount, pendingWorkers) {
  if (amount < 0) return null;

  // Calculate the difference to know how much stone to add/remove
  const difference = amount - currentTradeAmount;

  // Check if we have enough stone (current stone + already traded stone >= new amount)
  const totalStoneAvailable = player.goodsPositions.stone + currentTradeAmount;

  if (amount <= totalStoneAvailable) {
    // Update stone and workers based on the difference
    player.goodsPositions.stone -= difference;
    const newPendingWorkers = pendingWorkers + (difference * 3);
    const newTradeAmount = amount;

    return { player, newPendingWorkers, newTradeAmount };
  }

  return null;
}

/**
 * Reset stone trade
 */
export function resetStone(player, stoneToTradeForWorkers, pendingWorkers) {
  if (stoneToTradeForWorkers > 0) {
    player.goodsPositions.stone += stoneToTradeForWorkers;
    const newPendingWorkers = pendingWorkers - (stoneToTradeForWorkers * 3);
    return { player, newPendingWorkers };
  }
  return null;
}
