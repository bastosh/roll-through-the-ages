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
    setBuildPhaseInitialState({ cities, monuments });
  }

  function buildCity(player, cityIndex, pendingWorkers) {
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

    if (monument && !monument.completed) {
      if (monument.progress > 0 && pendingWorkers === 0) {
        // Remove a worker from monument
        monument.progress--;
        newPendingWorkers++;
      } else if (pendingWorkers >= 1) {
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
    }

    return { newPendingWorkers, monumentCompleted };
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

  function resetPhase() {
    setBuildPhaseInitialState(null);
    setStoneToTradeForWorkers(0);
  }

  return {
    buildPhaseInitialState,
    stoneToTradeForWorkers,
    initializeBuildPhase,
    buildCity,
    buildMonument,
    checkAllMonumentsBuilt,
    resetBuild,
    canSkipBuild,
    tradeStone,
    resetStone,
    resetPhase
  };
}
