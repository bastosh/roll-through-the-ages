import { useState } from 'react';

/**
 * Hook pour gérer la phase de construction
 */
export function useBuildPhase() {
  const [buildPhaseInitialState, setBuildPhaseInitialState] = useState(null);
  const [stoneToTradeForWorkers, setStoneToTradeForWorkers] = useState(0);

  function initializeBuildPhase(player) {
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
    // Sauvegarder l'état initial des ressources et bateaux
    const goodsPositions = { ...player.goodsPositions };
    const builtBoats = player.builtBoats || 0;
    const pendingBoats = player.pendingBoats || 0;
    const initialStoneTraded = stoneToTradeForWorkers;

    // Sauvegarder l'état initial de la métropole (Ancient Empires)
    let metropolis = null;
    if (player.metropolis) {
      metropolis = {
        built: player.metropolis.built,
        progress: player.metropolis.progress,
        requiredWorkers: player.metropolis.requiredWorkers
      };
    }

    // Sauvegarder l'état initial des bâtiments de production (Ancient Empires)
    const productions = [];
    if (player.productions) {
      for (let i = 0; i < player.productions.length; i++) {
        productions.push({
          name: player.productions[i].name,
          built: player.productions[i].built,
          progress: player.productions[i].progress,
          requiredWorkers: player.productions[i].requiredWorkers
        });
      }
    }

    setBuildPhaseInitialState({ cities, monuments, goodsPositions, builtBoats, pendingBoats, stoneTraded: initialStoneTraded, metropolis, productions });
  }

  function buildCity(player, cityIndex, pendingWorkers) {
    const city = player.cities[cityIndex];
    let newPendingWorkers = pendingWorkers;

    if (!city.built && pendingWorkers >= 1) {
      // Add a worker to city
      city.progress++;
      if (city.progress >= city.requiredWorkers) {
        city.built = true;
      }
      newPendingWorkers--;
    }

    return newPendingWorkers;
  }

  function unbuildCity(player, cityIndex, pendingWorkers) {
    const city = player.cities[cityIndex];
    let newPendingWorkers = pendingWorkers;

    if (city.progress > 0) {
      // Remove a worker from city
      city.progress--;
      // If city was built and we remove a worker, mark it as not built
      if (city.built && city.progress < city.requiredWorkers) {
        city.built = false;
      }
      newPendingWorkers++;
    }

    return newPendingWorkers;
  }

  function buildMetropolis(player, pendingWorkers) {
    const metropolis = player.metropolis;
    let newPendingWorkers = pendingWorkers;

    if (metropolis && !metropolis.built && pendingWorkers >= 1) {
      // Add a worker to metropolis
      metropolis.progress++;
      if (metropolis.progress >= metropolis.requiredWorkers) {
        metropolis.built = true;
      }
      newPendingWorkers--;
    }

    return newPendingWorkers;
  }

  function unbuildMetropolis(player, pendingWorkers) {
    const metropolis = player.metropolis;
    let newPendingWorkers = pendingWorkers;

    if (metropolis && metropolis.progress > 0) {
      // Remove a worker from metropolis
      metropolis.progress--;
      // If metropolis was built and we remove a worker, mark it as not built
      if (metropolis.built && metropolis.progress < metropolis.requiredWorkers) {
        metropolis.built = false;
      }
      newPendingWorkers++;
    }

    return newPendingWorkers;
  }

  function buildProduction(player, productionIndex, pendingWorkers, variantConfig) {
    const production = player.productions[productionIndex];
    const productionDef = variantConfig.productions[productionIndex];
    let newPendingWorkers = pendingWorkers;

    if (production && !production.built && pendingWorkers >= 1) {
      // If this is the first worker, set requiredWorkers based on current city count
      if (production.progress === 0) {
        // Check if workers is a number (Ancient Empires Original) or an object (Ancient Empires Beri)
        if (typeof productionDef.workers === 'number') {
          // Fixed cost (Ancient Empires Original)
          production.requiredWorkers = productionDef.workers;
        } else {
          // Dynamic cost based on city count (Ancient Empires Beri)
          const citiesBuilt = 3 + player.cities.filter(c => c.built).length;
          const cityKey = `${citiesBuilt} cities`;
          production.requiredWorkers = productionDef.workers[cityKey] || productionDef.workers['3 cities'];
        }
      }

      // Add a worker to production building
      production.progress++;

      if (production.progress >= production.requiredWorkers) {
        production.built = true;
      }
      newPendingWorkers--;
    }

    return newPendingWorkers;
  }

  function unbuildProduction(player, productionIndex, pendingWorkers, variantConfig) {
    const production = player.productions[productionIndex];
    let newPendingWorkers = pendingWorkers;

    if (production && production.progress > 0) {
      // Remove a worker from production building
      production.progress--;

      // If production was built and we remove a worker, mark it as not built
      if (production.built && production.progress < production.requiredWorkers) {
        production.built = false;
      }

      // If all workers removed, reset requiredWorkers so it can be recalculated
      if (production.progress === 0) {
        production.requiredWorkers = undefined;
      }

      newPendingWorkers++;
    }

    return newPendingWorkers;
  }

  function buildMonument(player, monumentId, pendingWorkers, MONUMENTS, allPlayers, currentPlayerIndex) {
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

        // Apply monument completion effects
        if (monumentId === 'sphinx' || monumentId === 'great_pyramid') {
          player.starvationPreventionAvailable = true;
        }
      }
      newPendingWorkers--;
    }

    return { newPendingWorkers, monumentCompleted };
  }

  function unbuildMonument(player, monumentId, pendingWorkers, MONUMENTS) {
    let monument = null;
    for (let i = 0; i < player.monuments.length; i++) {
      if (player.monuments[i].id === monumentId) {
        monument = player.monuments[i];
        break;
      }
    }

    let monumentDef = null;
    if (MONUMENTS) {
      for (let i = 0; i < MONUMENTS.length; i++) {
        if (MONUMENTS[i].id === monumentId) {
          monumentDef = MONUMENTS[i];
          break;
        }
      }
    }

    let newPendingWorkers = pendingWorkers;

    if (monument && monument.progress > 0) {
      // Remove a worker from monument
      monument.progress--;
      // If monument was completed and we remove a worker, mark it as not completed
      if (monumentDef && monument.completed && monument.progress < monumentDef.workers) {
        monument.completed = false;
        monument.firstToComplete = false;
      }
      newPendingWorkers++;
    }

    return { newPendingWorkers };
  }

  function checkAllMonumentsBuilt(MONUMENTS, allPlayers) {
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

  function resetBuild(player, pendingWorkers) {
    if (!buildPhaseInitialState) return pendingWorkers;

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

    // Calculate workers placed on metropolis during this turn (Ancient Empires)
    if (player.metropolis && buildPhaseInitialState.metropolis) {
      const initialProgress = buildPhaseInitialState.metropolis.progress;
      const currentProgress = player.metropolis.progress;
      workersToReturn += currentProgress - initialProgress;
    }

    // Calculate workers placed on production buildings during this turn (Ancient Empires)
    if (player.productions && buildPhaseInitialState.productions) {
      for (let i = 0; i < player.productions.length; i++) {
        const initialProduction = buildPhaseInitialState.productions[i];
        if (initialProduction) {
          const initialProgress = initialProduction.progress;
          const currentProgress = player.productions[i].progress;
          workersToReturn += currentProgress - initialProgress;
        }
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

    // Restore metropolis (Ancient Empires)
    if (player.metropolis && buildPhaseInitialState.metropolis) {
      player.metropolis.built = buildPhaseInitialState.metropolis.built;
      player.metropolis.progress = buildPhaseInitialState.metropolis.progress;
    }

    // Restore production buildings (Ancient Empires)
    if (player.productions && buildPhaseInitialState.productions) {
      for (let i = 0; i < player.productions.length; i++) {
        const initialProduction = buildPhaseInitialState.productions[i];
        if (initialProduction) {
          player.productions[i].built = initialProduction.built;
          player.productions[i].progress = initialProduction.progress;
          player.productions[i].requiredWorkers = initialProduction.requiredWorkers;
        }
      }
    }

    // Restore goods and boats
    player.goodsPositions = { ...buildPhaseInitialState.goodsPositions };
    player.builtBoats = buildPhaseInitialState.builtBoats;
    player.pendingBoats = buildPhaseInitialState.pendingBoats;

    // Restore stone trade and adjust pending workers
    const stoneToRestore = stoneToTradeForWorkers - (buildPhaseInitialState.stoneTraded || 0);
    if (stoneToRestore > 0) {
      // We traded more stone than initially, need to restore it
      player.goodsPositions.stone += stoneToRestore;
      workersToReturn -= stoneToRestore * 3;
    } else if (stoneToRestore < 0) {
      // We traded less stone than initially, need to remove it
      player.goodsPositions.stone += stoneToRestore;
      workersToReturn -= stoneToRestore * 3;
    }
    setStoneToTradeForWorkers(buildPhaseInitialState.stoneTraded || 0);

    return pendingWorkers + workersToReturn;
  }

  function canSkipBuild(player, pendingWorkers) {
    if (pendingWorkers === 0) return true;

    // Check if any city can be built
    for (let i = 0; i < player.cities.length; i++) {
      if (!player.cities[i].built) {
        return false;
      }
    }

    // Check if metropolis can be built (Ancient Empires)
    if (player.metropolis && !player.metropolis.built) {
      return false;
    }

    // Check if any production building can be built (Ancient Empires)
    if (player.productions) {
      for (let i = 0; i < player.productions.length; i++) {
        if (!player.productions[i].built) {
          return false;
        }
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

  function tradeStone(amount) {
    setStoneToTradeForWorkers(amount);
  }

  function resetStone() {
    setStoneToTradeForWorkers(0);
  }

  /**
   * Calcule le nombre de bateaux pouvant être construits avec les ressources disponibles
   */
  function calculateMaxBoats(player) {
    // Vérifier si le joueur a le développement "shipping"
    const hasShipping = player.developments && player.developments.indexOf('shipping') !== -1;
    if (!hasShipping) return 0;

    const wood = player.goodsPositions.wood || 0;
    const cloth = player.goodsPositions.cloth || 0;
    const currentBoats = player.builtBoats || 0;
    const maxBoats = 5; // Maximum de 5 bateaux
    const remainingSlots = maxBoats - currentBoats;
    const maxFromResources = Math.min(wood, cloth);
    return Math.min(maxFromResources, remainingSlots);
  }

  /**
   * Construit des bateaux (chaque bateau coûte 1 Bois + 1 Tissu)
   */
  function buildBoats(player, count) {
    if (count <= 0) return;

    const maxBoats = calculateMaxBoats(player);
    const boatsToBuild = Math.min(count, maxBoats);

    if (boatsToBuild > 0) {
      player.goodsPositions.wood -= boatsToBuild;
      player.goodsPositions.cloth -= boatsToBuild;
      player.pendingBoats = (player.pendingBoats || 0) + boatsToBuild;
    }
  }

  /**
   * Annule la construction de bateaux pendant cette phase
   */
  function unbuildBoats(player, count) {
    if (count <= 0 || !player.pendingBoats) return;

    const boatsToUnbuild = Math.min(count, player.pendingBoats);

    if (boatsToUnbuild > 0) {
      player.goodsPositions.wood += boatsToUnbuild;
      player.goodsPositions.cloth += boatsToUnbuild;
      player.pendingBoats -= boatsToUnbuild;
    }
  }

  /**
   * Confirme la construction des bateaux en cours
   */
  function confirmBoats(player) {
    if (player.pendingBoats > 0) {
      player.builtBoats = (player.builtBoats || 0) + player.pendingBoats;
      player.pendingBoats = 0;
    }
  }

  function resetPhase() {
    setBuildPhaseInitialState(null);
    setStoneToTradeForWorkers(0);
  }

  return {
    buildPhaseInitialState,
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
    resetPhase
  };
}
