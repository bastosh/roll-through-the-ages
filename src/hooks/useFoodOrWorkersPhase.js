import { useState } from 'react';

/**
 * Hook pour gérer la phase de choix nourriture/ouvriers
 */
export function useFoodOrWorkersPhase() {
  const [foodOrWorkerChoices, setFoodOrWorkerChoices] = useState([]);

  function initializeChoices(count) {
    const initialChoices = [];
    for (let i = 0; i < count; i++) {
      initialChoices.push('none');
    }
    setFoodOrWorkerChoices(initialChoices);
  }

  function toggleChoice(dieIndex) {
    const newChoices = [...foodOrWorkerChoices];
    if (newChoices[dieIndex] === 'none') {
      newChoices[dieIndex] = 'food';
    } else if (newChoices[dieIndex] === 'food') {
      newChoices[dieIndex] = 'workers';
    } else {
      newChoices[dieIndex] = 'food';
    }
    setFoodOrWorkerChoices(newChoices);
  }

  function validateChoices(player, pendingWorkers, hasAgriculture, hasMasonry) {
    let foodDiceCount = 0;
    let workerDiceCount = 0;

    for (let i = 0; i < foodOrWorkerChoices.length; i++) {
      if (foodOrWorkerChoices[i] === 'food') {
        foodDiceCount++;
      } else if (foodOrWorkerChoices[i] === 'workers') {
        workerDiceCount++;
      }
    }

    // Calculate food to add (2 per die base)
    let foodToAdd = foodDiceCount * 2;
    if (hasAgriculture) {
      foodToAdd += foodDiceCount; // Agriculture adds +1 per die
    }
    const newFood = Math.min(player.food + foodToAdd, 15);

    // Calculate workers to add (2 per die base)
    let workersToAdd = workerDiceCount * 2;
    if (hasMasonry) {
      workersToAdd += workerDiceCount; // Masonry adds +1 per die
    }
    const newPendingWorkers = pendingWorkers + workersToAdd;

    return {
      newFood,
      newPendingWorkers,
      foodDiceCount,
      workerDiceCount
    };
  }

  function reset() {
    setFoodOrWorkerChoices([]);
  }

  return {
    foodOrWorkerChoices,
    initializeChoices,
    toggleChoice,
    validateChoices,
    reset
  };
}
