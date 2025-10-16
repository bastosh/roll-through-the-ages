import { getTotalGoodsCount } from './gameUtils';

/**
 * Count the number of completed cultures for Ancient Empire bonus
 * @param {Object} player - The player object
 * @param {Array} MONUMENTS - Array of all monuments in the variant
 * @param {Object} variantConfig - The variant configuration
 * @returns {number} Number of cultures that are fully completed
 */
function getCompletedCulturesCount(player, MONUMENTS, variantConfig) {
  if (!variantConfig || !variantConfig.cultures) {
    return 0;
  }

  let completedCulturesCount = 0;

  for (let i = 0; i < variantConfig.cultures.length; i++) {
    const culture = variantConfig.cultures[i];
    const cultureMonuments = [];

    // Trouver tous les monuments de cette culture
    for (let j = 0; j < MONUMENTS.length; j++) {
      if (MONUMENTS[j].origin === culture.name) {
        cultureMonuments.push(MONUMENTS[j]);
      }
    }

    // Déterminer quels monuments le joueur doit avoir complété
    // Gérer les groupes de monuments (ex: Stonehenge 1 et 2)
    const requiredMonumentGroups = new Set();
    const requiredMonumentIds = new Set();

    for (let j = 0; j < cultureMonuments.length; j++) {
      const monument = cultureMonuments[j];
      if (monument.monumentGroup) {
        requiredMonumentGroups.add(monument.monumentGroup);
      } else {
        requiredMonumentIds.add(monument.id);
      }
    }

    // Vérifier que le joueur a complété tous les monuments requis
    let allCompleted = true;

    // Vérifier les monuments individuels
    for (const monumentId of requiredMonumentIds) {
      let found = false;
      for (let j = 0; j < player.monuments.length; j++) {
        if (player.monuments[j].id === monumentId && player.monuments[j].completed) {
          found = true;
          break;
        }
      }
      if (!found) {
        allCompleted = false;
        break;
      }
    }

    // Vérifier les groupes de monuments (TOUS les monuments du groupe doivent être complétés)
    if (allCompleted) {
      for (const groupName of requiredMonumentGroups) {
        // Trouver tous les monuments de ce groupe
        const monumentsInGroup = [];
        for (let k = 0; k < MONUMENTS.length; k++) {
          if (MONUMENTS[k].monumentGroup === groupName) {
            monumentsInGroup.push(MONUMENTS[k].id);
          }
        }

        // Vérifier que TOUS les monuments du groupe sont complétés
        let allMonumentsInGroupCompleted = true;
        for (let m = 0; m < monumentsInGroup.length; m++) {
          const monumentId = monumentsInGroup[m];
          let found = false;
          for (let j = 0; j < player.monuments.length; j++) {
            if (player.monuments[j].id === monumentId && player.monuments[j].completed) {
              found = true;
              break;
            }
          }
          if (!found) {
            allMonumentsInGroupCompleted = false;
            break;
          }
        }

        if (!allMonumentsInGroupCompleted) {
          allCompleted = false;
          break;
        }
      }
    }

    if (allCompleted) {
      completedCulturesCount++;
    }
  }

  return completedCulturesCount;
}

/**
 * Calculate the total score for a player
 * @param {Object} player - The player object
 * @param {Array} DEVELOPMENTS - Array of all developments in the variant
 * @param {Array} MONUMENTS - Array of all monuments in the variant
 * @param {Object} variantConfig - The variant configuration (optional, for Ancient Empire bonus)
 * @returns {number} The calculated score
 */
export function calculatePlayerScore(player, DEVELOPMENTS, MONUMENTS, variantConfig = null) {
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

  // Score from metropolis (Ancient Empires only)
  if (player.metropolis && player.metropolis.built) {
    if (variantConfig && variantConfig.metropolis) {
      score += variantConfig.metropolis.points;
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
    // Use explicit scoringMultiplier if defined, otherwise fallback to heuristic
    const multiplier = architectureDev && architectureDev.scoringMultiplier !== undefined
      ? architectureDev.scoringMultiplier
      : (architectureDev && architectureDev.cost >= 60 ? 2 : 1);
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

  // Kingdom development bonus (Ancient Empires only)
  if (player.developments.indexOf('kingdom') !== -1) {
    let cityCount = 3;
    for (let j = 0; j < player.cities.length; j++) {
      if (player.cities[j].built) cityCount++;
    }
    // Add metropolis to city count if built
    if (player.metropolis && player.metropolis.built) {
      cityCount++;
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
      // Find the economy development to get the correct multiplier for this variant
      let economyDev = null;
      for (let k = 0; k < DEVELOPMENTS.length; k++) {
        if (DEVELOPMENTS[k].id === 'economy') {
          economyDev = DEVELOPMENTS[k];
          break;
        }
      }
      // Use explicit scoringMultiplier if defined, otherwise default to 2
      const multiplier = economyDev && economyDev.scoringMultiplier !== undefined
        ? economyDev.scoringMultiplier
        : 2;
      score += completedProductionsCount * multiplier;
    }
  }

  // Ancient Empire development bonus (Ancient Empires only)
  if (player.developments.indexOf('ancientEmpire') !== -1) {
    const completedCulturesCount = getCompletedCulturesCount(player, MONUMENTS, variantConfig);
    // Find the ancientEmpire development to get the correct multiplier for this variant
    let ancientEmpireDev = null;
    for (let k = 0; k < DEVELOPMENTS.length; k++) {
      if (DEVELOPMENTS[k].id === 'ancientEmpire') {
        ancientEmpireDev = DEVELOPMENTS[k];
        break;
      }
    }
    // Use explicit scoringMultiplier if defined, otherwise default to 9
    const multiplier = ancientEmpireDev && ancientEmpireDev.scoringMultiplier !== undefined
      ? ancientEmpireDev.scoringMultiplier
      : 9;
    score += completedCulturesCount * multiplier;
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
 * @param {Object} variantConfig - The variant configuration (optional, for Ancient Empire bonus)
 * @returns {Object} Object with score breakdown
 */
export function calculateScoreBreakdown(player, DEVELOPMENTS, MONUMENTS, variantConfig = null) {
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

  // Score from metropolis (Ancient Empires only)
  if (player.metropolis && player.metropolis.built) {
    if (variantConfig && variantConfig.metropolis) {
      monumentsScore += variantConfig.metropolis.points;
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
    // Use explicit scoringMultiplier if defined, otherwise fallback to heuristic
    const multiplier = architectureDev && architectureDev.scoringMultiplier !== undefined
      ? architectureDev.scoringMultiplier
      : (architectureDev && architectureDev.cost >= 60 ? 2 : 1);
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

  // Kingdom development bonus (Ancient Empires only)
  if (player.developments.indexOf('kingdom') !== -1) {
    let cityCount = 3;
    for (let j = 0; j < player.cities.length; j++) {
      if (player.cities[j].built) cityCount++;
    }
    // Add metropolis to city count if built
    if (player.metropolis && player.metropolis.built) {
      cityCount++;
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
      // Find the economy development to get the correct multiplier for this variant
      let economyDev = null;
      for (let k = 0; k < DEVELOPMENTS.length; k++) {
        if (DEVELOPMENTS[k].id === 'economy') {
          economyDev = DEVELOPMENTS[k];
          break;
        }
      }
      // Use explicit scoringMultiplier if defined, otherwise default to 2
      const multiplier = economyDev && economyDev.scoringMultiplier !== undefined
        ? economyDev.scoringMultiplier
        : 2;
      bonusScore += completedProductionsCount * multiplier;
    }
  }

  // Ancient Empire development bonus (Ancient Empires only)
  if (player.developments.indexOf('ancientEmpire') !== -1) {
    const completedCulturesCount = getCompletedCulturesCount(player, MONUMENTS, variantConfig);
    // Find the ancientEmpire development to get the correct multiplier for this variant
    let ancientEmpireDev = null;
    for (let k = 0; k < DEVELOPMENTS.length; k++) {
      if (DEVELOPMENTS[k].id === 'ancientEmpire') {
        ancientEmpireDev = DEVELOPMENTS[k];
        break;
      }
    }
    // Use explicit scoringMultiplier if defined, otherwise default to 9
    const multiplier = ancientEmpireDev && ancientEmpireDev.scoringMultiplier !== undefined
      ? ancientEmpireDev.scoringMultiplier
      : 9;
    bonusScore += completedCulturesCount * multiplier;
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
