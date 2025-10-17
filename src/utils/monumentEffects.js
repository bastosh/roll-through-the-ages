/**
 * Utility functions to handle monument effects based on variant configuration
 * This allows different variants to assign different effects to different monuments
 */

/**
 * Get the monument ID that prevents starvation once per game
 * @param {Object} variantConfig - Variant configuration
 * @returns {string|null} Monument ID or null if not defined
 */
export function getStarvationPreventionMonument(variantConfig) {
  return variantConfig.monumentEffects?.starvationPrevention || null;
}

/**
 * Get the monument ID that reduces disaster points by 1
 * @param {Object} variantConfig - Variant configuration
 * @returns {string|null} Monument ID or null if not defined
 */
export function getDisasterReductionMonument(variantConfig) {
  return variantConfig.monumentEffects?.disasterReduction || null;
}

/**
 * Get the monument ID that protects 1 resource during revolt (5+ skulls)
 * @param {Object} variantConfig - Variant configuration
 * @returns {string|null} Monument ID or null if not defined
 */
export function getResourceProtectionMonument(variantConfig) {
  return variantConfig.monumentEffects?.resourceProtection || null;
}

/**
 * Check if player has a specific monument completed
 * @param {Object} player - Player state
 * @param {string} monumentId - Monument ID to check
 * @returns {boolean} True if player has completed the monument
 */
export function hasMonumentCompleted(player, monumentId) {
  if (!monumentId) return false;

  for (let i = 0; i < player.monuments.length; i++) {
    if (player.monuments[i].id === monumentId && player.monuments[i].completed) {
      return true;
    }
  }
  return false;
}

/**
 * Check if player has the monument that prevents starvation
 * @param {Object} player - Player state
 * @param {Object} variantConfig - Variant configuration
 * @returns {boolean} True if player has the starvation prevention monument completed
 */
export function hasStarvationPreventionMonument(player, variantConfig) {
  const monumentId = getStarvationPreventionMonument(variantConfig);
  return hasMonumentCompleted(player, monumentId);
}

/**
 * Check if player has the monument that reduces disasters
 * @param {Object} player - Player state
 * @param {Object} variantConfig - Variant configuration
 * @returns {boolean} True if player has the disaster reduction monument completed
 */
export function hasDisasterReductionMonument(player, variantConfig) {
  const monumentId = getDisasterReductionMonument(variantConfig);
  return hasMonumentCompleted(player, monumentId);
}

/**
 * Check if player has the monument that protects resources
 * @param {Object} player - Player state
 * @param {Object} variantConfig - Variant configuration
 * @returns {boolean} True if player has the resource protection monument completed
 */
export function hasResourceProtectionMonument(player, variantConfig) {
  const monumentId = getResourceProtectionMonument(variantConfig);
  return hasMonumentCompleted(player, monumentId);
}
