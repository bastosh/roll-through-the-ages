import { getTotalGoodsCount } from '../gameUtils';
import { GOODS_TYPES } from '../../constants/gameData';

/**
 * Discard excess goods (down to 6 unless player has Caravans)
 */
export function discardExcessGoods(player) {
  const newPlayer = { ...player, goodsPositions: { ...player.goodsPositions } };

  // Skip if player has Caravans development
  if (newPlayer.developments.indexOf('caravans') !== -1) {
    return newPlayer;
  }

  let totalGoods = getTotalGoodsCount(newPlayer.goodsPositions);

  // Discard from most expensive to least expensive
  while (totalGoods > 6) {
    for (let i = GOODS_TYPES.length - 1; i >= 0; i--) {
      const type = GOODS_TYPES[i];
      if (newPlayer.goodsPositions[type] > 0) {
        newPlayer.goodsPositions[type]--;
        totalGoods--;
        break;
      }
    }
  }

  return newPlayer;
}
