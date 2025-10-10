/**
 * Toggle food/worker choice for a specific die
 */
export function toggleFoodOrWorkerDie(foodOrWorkerChoices, dieIndex) {
  const newChoices = [...foodOrWorkerChoices];
  if (newChoices[dieIndex] === 'none') {
    newChoices[dieIndex] = 'food';
  } else if (newChoices[dieIndex] === 'food') {
    newChoices[dieIndex] = 'workers';
  } else {
    newChoices[dieIndex] = 'food';
  }
  return newChoices;
}

/**
 * Validate food/worker choices and update player state
 */
export function validateFoodOrWorkers(foodOrWorkerChoices, player, pendingWorkers) {
  const newPlayer = { ...player };

  let foodDiceCount = 0;
  let workerDiceCount = 0;

  for (let i = 0; i < foodOrWorkerChoices.length; i++) {
    if (foodOrWorkerChoices[i] === 'food') {
      foodDiceCount++;
    } else if (foodOrWorkerChoices[i] === 'workers') {
      workerDiceCount++;
    }
  }

  // Add food - each die gives 2 food base
  let foodToAdd = foodDiceCount * 2;
  if (newPlayer.developments.indexOf('agriculture') !== -1) {
    foodToAdd += foodDiceCount; // Agriculture adds +1 per die
  }
  newPlayer.food = Math.min(newPlayer.food + foodToAdd, 15);

  // Add workers - each die gives 2 workers base
  let workersToAdd = workerDiceCount * 2;
  if (newPlayer.developments.indexOf('masonry') !== -1) {
    workersToAdd += workerDiceCount; // Masonry adds +1 per die
  }

  return {
    player: newPlayer,
    newPendingWorkers: pendingWorkers + workersToAdd,
    nextPhase: 'feed'
  };
}
