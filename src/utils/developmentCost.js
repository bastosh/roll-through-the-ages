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

  // Check if player has a discount
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
