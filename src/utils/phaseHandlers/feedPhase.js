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
 * Handle feeding cities
 * @returns Updated player and whether to skip build phase
 */
export function feedCities(player, pendingWorkers, useSphinx = false) {
  const newPlayer = { ...player };

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

    // Check if Sphinx can be used
    if (newPlayer.sphinxPowerAvailable && !useSphinx) {
      canUseSphinx = true;
    }

    // Apply starvation disaster (if not using Sphinx)
    if (useSphinx && newPlayer.sphinxPowerAvailable) {
      // Use Sphinx power to ignore starvation
      newPlayer.sphinxPowerAvailable = false;
    } else {
      // Apply disaster points normally
      newPlayer.disasters += starvationPoints;

      // Apply Great Pyramid effect: -1 disaster if at least 1 was added
      if (hasGreatPyramid(newPlayer) && starvationPoints >= 1) {
        newPlayer.disasters -= 1;
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
