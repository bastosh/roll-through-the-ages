/**
 * Handle feeding cities
 * @returns Updated player and whether to skip build phase
 */
export function feedCities(player, pendingWorkers) {
  const newPlayer = { ...player };

  let citiesToFeed = 3;
  for (let i = 0; i < newPlayer.cities.length; i++) {
    if (newPlayer.cities[i].built) citiesToFeed++;
  }

  if (newPlayer.food < citiesToFeed) {
    const unfedCities = citiesToFeed - newPlayer.food;
    newPlayer.disasters += unfedCities;
    newPlayer.food = 0;
  } else {
    newPlayer.food -= citiesToFeed;
  }

  const shouldSkipBuild = pendingWorkers === 0;

  return {
    player: newPlayer,
    shouldSkipBuild: shouldSkipBuild
  };
}
