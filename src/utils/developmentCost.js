/**
 * Calculate the actual cost of a development considering discounts from production buildings
 * @param {Object} dev - The development object
 * @param {Array} playerProductions - Array of player's production buildings
 * @param {Array} playerMonuments - Array of player's monuments
 * @param {number} playerCount - Number of players in the game
 * @returns {number} The actual cost after discount
 */
export function calculateDevelopmentCost(dev, playerProductions = [], playerMonuments = [], playerCount = 1) {
  let baseCost = dev.cost;

  // Variable cost for medicine
  if (dev.id === 'medicine' && typeof baseCost === 'string' && baseCost.includes('per player')) {
    baseCost = 10 * playerCount;
  }

  // Check if player has a discount (Ancient Empires Beri variant)
  let discount = 0;
  if (dev.discount && dev.discount !== 'none') {
    if (dev.discount === 'monument') {
      // Discount if a monument is completed
      const hasCompletedMonument = playerMonuments.some(m => m.completed);
      if (hasCompletedMonument) {
        discount = 5;
      }
    } else if (dev.discount === 'market' || dev.discount === 'mine' || dev.discount === 'village') {
      // Discount if the corresponding production building is built
      const prodIndex = playerProductions.findIndex(p => p.name === dev.discount && p.built);
      if (prodIndex !== -1) {
        discount = 5;
      }
    }
  }

  return Math.max(0, baseCost - discount);
}

/**
 * Check if a development's prerequisite is met
 * @param {Object} dev - The development object
 * @param {Array} playerProductions - Array of player's production buildings
 * @param {boolean} hasMetropolis - Whether player has built metropolis
 * @returns {boolean} True if prerequisite is met or no prerequisite exists
 */
export function checkDevelopmentPrerequisite(dev, playerProductions = [], hasMetropolis = false) {
  // If no prerequisite, it's always available
  if (!dev.prerequisite) return true;

  // Check for metropolis prerequisite
  if (dev.prerequisite === 'metropolis') {
    return hasMetropolis;
  }

  // Check for production building prerequisite (Ancient Empires Original variant)
  if (dev.prerequisite === 'market' || dev.prerequisite === 'mine' || dev.prerequisite === 'village') {
    const prodIndex = playerProductions.findIndex(p => p.name === dev.prerequisite && p.built);
    return prodIndex !== -1;
  }

  return true;
}
