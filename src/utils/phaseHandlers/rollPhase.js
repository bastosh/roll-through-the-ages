import { addGoods, handleDisasters } from '../gameUtils';

/**
 * Process dice results and update player state
 * @returns {Object} Updated state including next phase
 */
export function processRollResults(results, currentPlayerIndex, allPlayers, variantConfig = null) {
  const newPlayers = [...allPlayers];
  const currentPlayer = newPlayers[currentPlayerIndex];

  // Count skulls
  let skulls = 0;
  for (let i = 0; i < results.length; i++) {
    skulls += results[i].skulls;
  }

  // Process food
  let foodToAdd = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.type === 'food') {
      foodToAdd += r.value;
      if (currentPlayer.developments.indexOf('agriculture') !== -1) {
        foodToAdd += 1;
      }
    }
  }

  // Add food bonus from completed village production buildings (Ancient Empires)
  if (variantConfig && variantConfig.productions && currentPlayer.productions) {
    for (let i = 0; i < currentPlayer.productions.length; i++) {
      const production = currentPlayer.productions[i];
      const productionDef = variantConfig.productions[i];
      if (production.built && productionDef.name === 'village' && productionDef.bonus === '1 food') {
        foodToAdd += 1;
      }
    }
  }

  currentPlayer.food = Math.min(currentPlayer.food + foodToAdd, 15);

  // Process goods
  let goodsToAdd = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].type === 'goods') {
      goodsToAdd += results[i].value;
    }
  }

  // Add goods bonus from completed market production buildings (Ancient Empires)
  if (variantConfig && variantConfig.productions && currentPlayer.productions) {
    for (let i = 0; i < currentPlayer.productions.length; i++) {
      const production = currentPlayer.productions[i];
      const productionDef = variantConfig.productions[i];
      if (production.built && productionDef.name === 'market' && productionDef.bonus === '1 good') {
        goodsToAdd += 1;
      }
    }
  }

  // Add Heavenly Gate bonus: +1 resource if at least one 1-resource die (goods with value 1) is kept
  let hasHeavenlyGate = false;
  for (let i = 0; i < currentPlayer.monuments.length; i++) {
    if (currentPlayer.monuments[i].id === 'heavenly_gate' && currentPlayer.monuments[i].completed) {
      hasHeavenlyGate = true;
      break;
    }
  }
  if (hasHeavenlyGate) {
    let hasOneResourceDie = false;
    for (let i = 0; i < results.length; i++) {
      if (results[i].type === 'goods' && results[i].value === 1) {
        hasOneResourceDie = true;
        break;
      }
    }
    if (hasOneResourceDie) {
      goodsToAdd += 1;
    }
  }

  addGoods(currentPlayer, goodsToAdd);

  // Process workers, food_or_workers, and coins
  let workers = 0;
  let foodOrWorkersDice = 0;
  let coins = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.type === 'workers') {
      workers += r.value;
      if (currentPlayer.developments.indexOf('masonry') !== -1) {
        workers += 1;
      }
    }
    if (r.type === 'food_or_workers') {
      foodOrWorkersDice += 1;
    }
    if (r.type === 'coins') {
      coins += r.value;
      if (currentPlayer.developments.indexOf('coinage') !== -1) {
        coins += 5;
      }
    }
  }

  // Add Ishtar Gate bonus: +1 worker permanently each turn
  let hasIshtarGate = false;
  for (let i = 0; i < currentPlayer.monuments.length; i++) {
    if (currentPlayer.monuments[i].id === 'ishtar_gate' && currentPlayer.monuments[i].completed) {
      hasIshtarGate = true;
      break;
    }
  }
  if (hasIshtarGate) {
    workers += 1;
  }

  // Check if Smithing (Forge) phase is needed (4 skulls + smithing development)
  const needsSmithingPhase = skulls === 4 && currentPlayer.developments.indexOf('smithing') !== -1;

  // Apply disasters (but skip invasion if Smithing phase is needed)
  if (!needsSmithingPhase) {
    handleDisasters(newPlayers, currentPlayerIndex, skulls);
  }

  // Determine next phase
  let nextPhase;
  if (needsSmithingPhase) {
    nextPhase = 'smithing_invasion';
  } else if (foodOrWorkersDice > 0) {
    nextPhase = 'choose_food_or_workers';
  } else {
    nextPhase = 'feed';
  }

  return {
    players: newPlayers,
    pendingWorkers: workers,
    pendingFoodOrWorkers: foodOrWorkersDice,
    pendingCoins: coins,
    nextPhase: nextPhase,
    foodOrWorkerChoicesCount: foodOrWorkersDice,
    skulls: skulls // Needed for smithing phase
  };
}
