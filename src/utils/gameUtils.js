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

export function handleDisasters(allPlayers, playerIdx, skulls, spearheadsToSpend = 0) {
  const player = allPlayers[playerIdx];

  if (skulls === 2) {
    if (player.developments.indexOf('irrigation') === -1) {
      player.disasters += 2;
    }
  } else if (skulls === 3) {
    for (let i = 0; i < allPlayers.length; i++) {
      if (i !== playerIdx && allPlayers[i].developments.indexOf('medicine') === -1) {
        allPlayers[i].disasters += 3;
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
            allPlayers[i].disasters += totalDamage;
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
        player.disasters += 4;
      }
    }
  } else if (skulls >= 5) {
    if (player.developments.indexOf('religion') !== -1) {
      for (let i = 0; i < allPlayers.length; i++) {
        if (i !== playerIdx && allPlayers[i].developments.indexOf('religion') === -1) {
          allPlayers[i].goodsPositions = { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 };
        }
      }
    } else {
      player.goodsPositions = { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 };
    }
  }
}
