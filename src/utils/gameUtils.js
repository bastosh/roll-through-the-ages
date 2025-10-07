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

  for (let i = 0; i < count; i++) {
    // Trouver la prochaine ressource qui n'est pas au maximum
    let attempts = 0;
    while (attempts < GOODS_TYPES.length) {
      const type = GOODS_TYPES[resourceIndex];
      const maxPos = GOODS_VALUES[type].length - 1;

      if (player.goodsPositions[type] < maxPos) {
        // On peut avancer ce marqueur
        player.goodsPositions[type]++;

        // Bonus Carrière : si on ajoute de la pierre, on ajoute une pierre supplémentaire
        if (type === 'stone' && player.developments.indexOf('quarrying') !== -1) {
          if (player.goodsPositions.stone < GOODS_VALUES.stone.length - 1) {
            player.goodsPositions.stone++;
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

export function handleDisasters(allPlayers, playerIdx, skulls) {
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
