import { GOODS_TYPES, GOODS_VALUES } from '../constants/gameData';

export function getGoodsValue(goodsPositions) {
  let total = 0;
  for (let i = 0; i < GOODS_TYPES.length; i++) {
    const type = GOODS_TYPES[i];
    total += GOODS_VALUES[type][goodsPositions[type]];
  }
  return total;
}

export function getTotalGoodsCount(goodsPositions) {
  let total = 0;
  for (let i = 0; i < GOODS_TYPES.length; i++) {
    total += goodsPositions[GOODS_TYPES[i]];
  }
  return total;
}

export function addGoods(player, count) {
  // Pour chaque bien obtenu, on avance les marqueurs de bas en haut
  // dans l'ordre : wood -> stone -> pottery -> cloth -> spearheads
  // puis on recommence en bas

  let resourceIndex = 0; // Commence par le bois (index 0)
  let quarryingBonusApplied = false; // Suivi du bonus Carrière (max 1 par phase)
  let forestryBonusApplied = false; // Suivi du bonus Forestry (max 1 par phase)

  for (let i = 0; i < count; i++) {
    // Trouver la prochaine ressource qui n'est pas au maximum
    let attempts = 0;
    while (attempts < GOODS_TYPES.length) {
      const type = GOODS_TYPES[resourceIndex];
      const maxPos = GOODS_VALUES[type].length - 1;

      if (player.goodsPositions[type] < maxPos) {
        // On peut avancer ce marqueur
        player.goodsPositions[type]++;

        // Bonus Forestry : si on ajoute du bois ET que le bonus n'a pas encore été appliqué
        if (type === 'wood' && !forestryBonusApplied && player.developments.indexOf('forestry') !== -1) {
          if (player.goodsPositions.wood < GOODS_VALUES.wood.length - 1) {
            player.goodsPositions.wood++;
            forestryBonusApplied = true;
          }
        }

        // Bonus Carrière : si on ajoute de la pierre ET que le bonus n'a pas encore été appliqué
        if (type === 'stone' && !quarryingBonusApplied && player.developments.indexOf('quarrying') !== -1) {
          if (player.goodsPositions.stone < GOODS_VALUES.stone.length - 1) {
            player.goodsPositions.stone++;
            quarryingBonusApplied = true;
          }
        }

        // Passer à la ressource suivante pour le prochain bien
        resourceIndex = (resourceIndex + 1) % GOODS_TYPES.length;
        break;
      }

      // Cette ressource est au max, passer à la suivante
      resourceIndex = (resourceIndex + 1) % GOODS_TYPES.length;
      attempts++;
    }
  }
}

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
 * Helper function to apply disaster points with monument reduction
 * In Beri Revised: Sphinx gives -1 disaster
 * In other variants: Great Pyramid gives -1 disaster
 */
function applyDisasterPoints(player, points, variantId = null) {
  if (points <= 0) return;

  player.disasters += points;

  // Determine which monument gives -1 disaster based on variant
  const isBeriRevised = variantId === 'ancient_empires_beri_revised';

  if (isBeriRevised) {
    // Beri Revised: Sphinx gives -1 disaster point
    if (hasSphinxCompleted(player) && points >= 1) {
      player.disasters -= 1;
    }
  } else {
    // Other variants: Great Pyramid gives -1 disaster point
    if (hasGreatPyramid(player) && points >= 1) {
      player.disasters -= 1;
    }
  }
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

export function handleDisasters(allPlayers, playerIdx, skulls, spearheadsToSpend = 0, variantId = null) {
  const player = allPlayers[playerIdx];
  const isBeriRevised = variantId === 'ancient_empires_beri_revised';

  if (skulls === 2) {
    if (player.developments.indexOf('irrigation') === -1) {
      applyDisasterPoints(player, 2, variantId);
    }
  } else if (skulls === 3) {
    for (let i = 0; i < allPlayers.length; i++) {
      if (i !== playerIdx && allPlayers[i].developments.indexOf('medicine') === -1) {
        applyDisasterPoints(allPlayers[i], 3, variantId);
      }
    }
  } else if (skulls === 4) {
    const hasSmithing = player.developments.indexOf('smithing') !== -1;

    if (hasSmithing) {
      // Le joueur avec la Forge envahit les adversaires
      const baseDamage = 4;
      const bonusDamage = spearheadsToSpend * 2;
      const totalDamage = baseDamage + bonusDamage;

      // Appliquer les dégâts aux adversaires (sauf ceux avec la Grande Muraille)
      for (let i = 0; i < allPlayers.length; i++) {
        if (i !== playerIdx) {
          let hasGreatWall = false;
          for (let j = 0; j < allPlayers[i].monuments.length; j++) {
            if (allPlayers[i].monuments[j].id === 'great_wall' && allPlayers[i].monuments[j].completed) {
              hasGreatWall = true;
              break;
            }
          }
          if (!hasGreatWall) {
            applyDisasterPoints(allPlayers[i], totalDamage, variantId);
          }
        }
      }
    } else {
      // Comportement normal : le joueur subit l'invasion (sauf s'il a la Grande Muraille)
      let hasGreatWall = false;
      for (let i = 0; i < player.monuments.length; i++) {
        if (player.monuments[i].id === 'great_wall' && player.monuments[i].completed) {
          hasGreatWall = true;
          break;
        }
      }
      if (!hasGreatWall) {
        applyDisasterPoints(player, 4, variantId);
      }
    }
  } else if (skulls >= 5) {
    if (player.developments.indexOf('religion') !== -1) {
      for (let i = 0; i < allPlayers.length; i++) {
        if (i !== playerIdx && allPlayers[i].developments.indexOf('religion') === -1) {
          // Check if target has Sphinx power available (not for Beri Revised)
          // In Beri Revised, Sphinx gives -1 disaster instead of keeping 1 resource
          if (!isBeriRevised && allPlayers[i].sphinxPowerAvailable && hasSphinxCompleted(allPlayers[i])) {
            // Keep the highest value resource (spearheads first, then cloth, pottery, stone, wood)
            const goodsOrder = ['spearheads', 'cloth', 'pottery', 'stone', 'wood'];
            let keptResource = null;
            for (let k = 0; k < goodsOrder.length; k++) {
              const type = goodsOrder[k];
              if (allPlayers[i].goodsPositions[type] > 0) {
                keptResource = { type, position: allPlayers[i].goodsPositions[type] };
                break;
              }
            }
            // Clear all resources
            allPlayers[i].goodsPositions = { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 };
            // Restore the kept resource
            if (keptResource) {
              allPlayers[i].goodsPositions[keptResource.type] = keptResource.position;
            }
            // Use up the Sphinx power
            allPlayers[i].sphinxPowerAvailable = false;
          } else {
            allPlayers[i].goodsPositions = { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 };
          }
        }
      }
    } else {
      // Check if player has Sphinx power available (not for Beri Revised)
      // In Beri Revised, Sphinx gives -1 disaster instead of keeping 1 resource
      if (!isBeriRevised && player.sphinxPowerAvailable && hasSphinxCompleted(player)) {
        // Keep the highest value resource (spearheads first, then cloth, pottery, stone, wood)
        const goodsOrder = ['spearheads', 'cloth', 'pottery', 'stone', 'wood'];
        let keptResource = null;
        for (let k = 0; k < goodsOrder.length; k++) {
          const type = goodsOrder[k];
          if (player.goodsPositions[type] > 0) {
            keptResource = { type, position: player.goodsPositions[type] };
            break;
          }
        }
        // Clear all resources
        player.goodsPositions = { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 };
        // Restore the kept resource
        if (keptResource) {
          player.goodsPositions[keptResource.type] = keptResource.position;
        }
        // Use up the Sphinx power
        player.sphinxPowerAvailable = false;
      } else {
        player.goodsPositions = { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 };
      }
    }
  }
}
