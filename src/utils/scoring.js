import { getTotalGoodsCount } from './gameUtils';

/**
 * Calculate the total score for a player
 * @param {Object} player - The player object
 * @param {Array} DEVELOPMENTS - Array of all developments in the variant
 * @param {Array} MONUMENTS - Array of all monuments in the variant
 * @returns {number} The calculated score
 */
export function calculatePlayerScore(player, DEVELOPMENTS, MONUMENTS) {
  let score = 0;

  // Score from developments
  for (let j = 0; j < player.developments.length; j++) {
    const devId = player.developments[j];
    for (let k = 0; k < DEVELOPMENTS.length; k++) {
      if (DEVELOPMENTS[k].id === devId) {
        score += DEVELOPMENTS[k].points;
        break;
      }
    }
  }

  // Score from monuments
  for (let j = 0; j < player.monuments.length; j++) {
    const m = player.monuments[j];
    if (m.completed) {
      for (let k = 0; k < MONUMENTS.length; k++) {
        if (MONUMENTS[k].id === m.id) {
          const monument = MONUMENTS[k];
          score += m.firstToComplete ? monument.points[0] : monument.points[1];
          break;
        }
      }
    }
  }

  // Architecture development bonus
  if (player.developments.indexOf('architecture') !== -1) {
    let completedCount = 0;
    for (let j = 0; j < player.monuments.length; j++) {
      if (player.monuments[j].completed) completedCount++;
    }
    // Find the architecture development to get the correct multiplier for this variant
    let architectureDev = null;
    for (let k = 0; k < DEVELOPMENTS.length; k++) {
      if (DEVELOPMENTS[k].id === 'architecture') {
        architectureDev = DEVELOPMENTS[k];
        break;
      }
    }
    // Late Bronze Age: 2 points per monument, Bronze Age: 1 point per monument
    const multiplier = architectureDev && architectureDev.cost >= 60 ? 2 : 1;
    score += completedCount * multiplier;
  }

  // Empire development bonus
  if (player.developments.indexOf('empire') !== -1) {
    let cityCount = 3;
    for (let j = 0; j < player.cities.length; j++) {
      if (player.cities[j].built) cityCount++;
    }
    score += cityCount;
  }

  // Commerce development bonus (Late Bronze Age only)
  if (player.developments.indexOf('commerce') !== -1) {
    const totalGoodsCount = getTotalGoodsCount(player.goodsPositions);
    score += totalGoodsCount;
  }

  // Economy development bonus (Ancient Empires only)
  if (player.developments.indexOf('economy') !== -1) {
    if (player.productions) {
      let completedProductionsCount = 0;
      for (let j = 0; j < player.productions.length; j++) {
        if (player.productions[j].built) completedProductionsCount++;
      }
      score += completedProductionsCount * 2;
    }
  }

  // Subtract disasters
  score -= player.disasters;

  return score;
}

/**
 * Calculate detailed score breakdown for end game display
 * @param {Object} player - The player object
 * @param {Array} DEVELOPMENTS - Array of all developments in the variant
 * @param {Array} MONUMENTS - Array of all monuments in the variant
 * @returns {Object} Object with score breakdown
 */
export function calculateScoreBreakdown(player, DEVELOPMENTS, MONUMENTS) {
  let developmentsScore = 0;
  let monumentsScore = 0;
  let bonusScore = 0;

  // Score from developments
  for (let j = 0; j < player.developments.length; j++) {
    const devId = player.developments[j];
    for (let k = 0; k < DEVELOPMENTS.length; k++) {
      if (DEVELOPMENTS[k].id === devId) {
        developmentsScore += DEVELOPMENTS[k].points;
        break;
      }
    }
  }

  // Score from monuments
  for (let j = 0; j < player.monuments.length; j++) {
    const m = player.monuments[j];
    if (m.completed) {
      for (let k = 0; k < MONUMENTS.length; k++) {
        if (MONUMENTS[k].id === m.id) {
          const monument = MONUMENTS[k];
          monumentsScore += m.firstToComplete ? monument.points[0] : monument.points[1];
          break;
        }
      }
    }
  }

  // Architecture development bonus
  if (player.developments.indexOf('architecture') !== -1) {
    let completedCount = 0;
    for (let j = 0; j < player.monuments.length; j++) {
      if (player.monuments[j].completed) completedCount++;
    }
    let architectureDev = null;
    for (let k = 0; k < DEVELOPMENTS.length; k++) {
      if (DEVELOPMENTS[k].id === 'architecture') {
        architectureDev = DEVELOPMENTS[k];
        break;
      }
    }
    const multiplier = architectureDev && architectureDev.cost >= 60 ? 2 : 1;
    bonusScore += completedCount * multiplier;
  }

  // Empire development bonus
  if (player.developments.indexOf('empire') !== -1) {
    let cityCount = 3;
    for (let j = 0; j < player.cities.length; j++) {
      if (player.cities[j].built) cityCount++;
    }
    bonusScore += cityCount;
  }

  // Commerce development bonus (Late Bronze Age only)
  if (player.developments.indexOf('commerce') !== -1) {
    const totalGoodsCount = getTotalGoodsCount(player.goodsPositions);
    bonusScore += totalGoodsCount;
  }

  // Economy development bonus (Ancient Empires only)
  if (player.developments.indexOf('economy') !== -1) {
    if (player.productions) {
      let completedProductionsCount = 0;
      for (let j = 0; j < player.productions.length; j++) {
        if (player.productions[j].built) completedProductionsCount++;
      }
      bonusScore += completedProductionsCount * 2;
    }
  }

  const total = developmentsScore + monumentsScore + bonusScore - player.disasters;

  return {
    developments: developmentsScore,
    monuments: monumentsScore,
    bonus: bonusScore,
    disasters: player.disasters,
    total: total
  };
}
