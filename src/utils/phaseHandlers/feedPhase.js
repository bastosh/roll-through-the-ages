/**
 * Helper function to check if player has completed Great Pyramid
 */
function hasGreatPyramid(player) {
  for (let i = 0; i < player.monuments.length; i++) {
    if (player.monuments[i].id === 'great_pyramid' && player.monuments[i].completed) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function to check if player has Sphinx monument completed
 */
function hasSphinxCompleted(player) {
  for (let i = 0; i < player.monuments.length; i++) {
    if (player.monuments[i].id === 'sphinx' && player.monuments[i].completed) {
      return true;
    }
  }
  return false;
}

/**
 * Handle feeding cities
 * @param {Object} player - Player state
 * @param {number} pendingWorkers - Pending workers count
 * @param {boolean} useSphinx - Whether to use monument power (Sphinx in non-Revised, Great Pyramid in Revised)
 * @param {string} variantId - Current variant ID
 * @returns Updated player and whether to skip build phase
 */
export function feedCities(player, pendingWorkers, useSphinx = false, variantId = null) {
  const newPlayer = { ...player };
  const isBeriRevised = variantId === 'ancient_empires_beri_revised';

  let citiesToFeed = 3;
  for (let i = 0; i < newPlayer.cities.length; i++) {
    if (newPlayer.cities[i].built) citiesToFeed++;
  }

  let starvationPoints = 0;
  let canUseSphinx = false;

  if (newPlayer.food < citiesToFeed) {
    const unfedCities = citiesToFeed - newPlayer.food;
    starvationPoints = unfedCities;
    newPlayer.food = 0;

    // In Beri Revised: Great Pyramid avoids starvation once per game
    // In other variants: Sphinx avoids starvation once per game
    const monumentToCheck = isBeriRevised ? hasGreatPyramid : hasSphinxCompleted;

    // Check if monument power can be used (must be completed and power still available)
    if (newPlayer.sphinxPowerAvailable && monumentToCheck(newPlayer) && !useSphinx) {
      canUseSphinx = true;
    }

    // Apply starvation disaster (if not using monument power)
    if (useSphinx && newPlayer.sphinxPowerAvailable) {
      // Use monument power to ignore starvation
      newPlayer.sphinxPowerAvailable = false;
    } else {
      // Apply disaster points normally
      newPlayer.disasters += starvationPoints;

      // Apply monument -1 disaster effect
      // In Beri Revised: Sphinx gives -1 disaster
      // In other variants: Great Pyramid gives -1 disaster
      if (isBeriRevised) {
        if (hasSphinxCompleted(newPlayer) && starvationPoints >= 1) {
          newPlayer.disasters -= 1;
        }
      } else {
        if (hasGreatPyramid(newPlayer) && starvationPoints >= 1) {
          newPlayer.disasters -= 1;
        }
      }
    }
  } else {
    newPlayer.food -= citiesToFeed;
  }

  const shouldSkipBuild = pendingWorkers === 0;

  return {
    player: newPlayer,
    shouldSkipBuild: shouldSkipBuild,
    canUseSphinx: canUseSphinx,
    starvationPoints: starvationPoints
  };
}
