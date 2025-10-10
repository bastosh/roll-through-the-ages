import { addGoods, handleDisasters } from '../gameUtils';

/**
 * Process dice results and update player state
 * @returns {Object} Updated state including next phase
 */
export function processRollResults(results, player, currentPlayerIndex, allPlayers) {
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
  currentPlayer.food = Math.min(currentPlayer.food + foodToAdd, 15);

  // Process goods
  let goodsToAdd = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].type === 'goods') {
      goodsToAdd += results[i].value;
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

  // Apply disasters
  handleDisasters(newPlayers, currentPlayerIndex, skulls);

  // Determine next phase
  const nextPhase = foodOrWorkersDice > 0 ? 'choose_food_or_workers' : 'feed';

  return {
    players: newPlayers,
    pendingWorkers: workers,
    pendingFoodOrWorkers: foodOrWorkersDice,
    pendingCoins: coins,
    nextPhase: nextPhase,
    foodOrWorkerChoicesCount: foodOrWorkersDice
  };
}
