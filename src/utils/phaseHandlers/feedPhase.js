import {
  hasStarvationPreventionMonument,
  hasDisasterReductionMonument,
  getStarvationPreventionMonument
} from '../monumentEffects';

/**
 * Handle feeding cities
 * @param {Object} player - Player state
 * @param {number} pendingWorkers - Pending workers count
 * @param {boolean} useStarvationPrevention - Whether to use starvation prevention monument power
 * @param {Object} variantConfig - Variant configuration (required for monument effects)
 * @returns Updated player and whether to skip build phase, and monument ID to use
 */
export function feedCities(player, pendingWorkers, useStarvationPrevention = false, variantConfig = null) {
  const newPlayer = { ...player };

  let citiesToFeed = 3;
  for (let i = 0; i < newPlayer.cities.length; i++) {
    if (newPlayer.cities[i].built) citiesToFeed++;
  }

  let starvationPoints = 0;
  let canUseStarvationPrevention = false;
  let starvationPreventionMonumentId = null;

  if (newPlayer.food < citiesToFeed) {
    const unfedCities = citiesToFeed - newPlayer.food;
    starvationPoints = unfedCities;
    newPlayer.food = 0;

    // Check if starvation prevention monument power can be used
    if (variantConfig && newPlayer.starvationPreventionAvailable && !useStarvationPrevention) {
      if (hasStarvationPreventionMonument(newPlayer, variantConfig)) {
        canUseStarvationPrevention = true;
        starvationPreventionMonumentId = getStarvationPreventionMonument(variantConfig);
      }
    }

    // Apply starvation disaster (if not using monument power)
    if (useStarvationPrevention && newPlayer.starvationPreventionAvailable) {
      // Use monument power to ignore starvation
      newPlayer.starvationPreventionAvailable = false;
    } else {
      // Apply disaster points normally
      newPlayer.disasters += starvationPoints;

      // Apply disaster reduction monument effect (-1 disaster)
      if (variantConfig && starvationPoints >= 1) {
        if (hasDisasterReductionMonument(newPlayer, variantConfig)) {
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
    canUseStarvationPrevention: canUseStarvationPrevention,
    starvationPreventionMonumentId: starvationPreventionMonumentId,
    starvationPoints: starvationPoints
  };
}
