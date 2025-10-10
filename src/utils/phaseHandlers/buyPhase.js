import { getGoodsValue } from '../gameUtils';
import { GOODS_TYPES, GOODS_VALUES } from '../../constants/gameData';

/**
 * Select a development for purchase
 */
export function selectDevelopmentToBuy(dev, player, pendingCoins, alreadyPurchased) {
  const totalValue = getGoodsValue(player.goodsPositions) + pendingCoins;

  if (totalValue >= dev.cost && player.developments.indexOf(dev.id) === -1) {
    if (alreadyPurchased) {
      return null; // Already purchased something this turn
    }

    // If total equals cost, can auto-buy
    const shouldAutoBuy = totalValue === dev.cost;

    return { shouldAutoBuy, dev };
  }
  return null;
}

/**
 * Auto-buy a development when value exactly matches cost
 */
export function autoBuyDevelopment(dev, player, pendingCoins) {
  const newPlayer = { ...player, goodsPositions: { ...player.goodsPositions } };

  // Use all coins first
  let remaining = dev.cost - pendingCoins;
  let newCoins = 0;

  // Use goods from most expensive to least expensive
  if (remaining > 0) {
    const goodsOrder = ['spearheads', 'cloth', 'pottery', 'stone', 'wood'];
    for (let i = 0; i < goodsOrder.length; i++) {
      const type = goodsOrder[i];
      while (newPlayer.goodsPositions[type] > 0 && remaining > 0) {
        const currentValue = GOODS_VALUES[type][newPlayer.goodsPositions[type]];
        const previousValue = GOODS_VALUES[type][newPlayer.goodsPositions[type] - 1];
        const valueToDeduct = currentValue - previousValue;
        newPlayer.goodsPositions[type]--;
        remaining -= valueToDeduct;
      }
    }
  }

  newPlayer.developments.push(dev.id);

  return { player: newPlayer, newCoins };
}

/**
 * Toggle a good for purchase
 */
export function toggleGood(type, player, selectedGoodsForPurchase) {
  const newSelected = { ...selectedGoodsForPurchase };

  if (newSelected[type] === 0) {
    // Click: use this resource (set to max position to add its value)
    newSelected[type] = player.goodsPositions[type];
  } else {
    // Click again: don't use this resource (set to 0 to remove its value)
    newSelected[type] = 0;
  }

  return newSelected;
}

/**
 * Calculate selected value for purchase
 */
export function calculatePurchaseValue(selectedGoodsForPurchase, coinsForPurchase) {
  let total = coinsForPurchase;
  for (const type of GOODS_TYPES) {
    const position = selectedGoodsForPurchase[type];
    if (position > 0) {
      total += GOODS_VALUES[type][position];
    }
  }
  return total;
}

/**
 * Confirm purchase with selected goods
 */
export function confirmDevelopmentPurchase(dev, player, selectedGoodsForPurchase, coinsForPurchase, pendingCoins) {
  const newPlayer = { ...player, goodsPositions: { ...player.goodsPositions } };

  // Apply the purchase
  for (const type of GOODS_TYPES) {
    newPlayer.goodsPositions[type] -= selectedGoodsForPurchase[type];
  }
  const newPendingCoins = pendingCoins - coinsForPurchase;

  newPlayer.developments.push(dev.id);

  return { player: newPlayer, newPendingCoins };
}

/**
 * Reset purchase (undo)
 */
export function resetPurchase(player, originalGoodsPositions, originalDevelopments) {
  if (!originalGoodsPositions) return null;

  const newPlayer = { ...player };
  newPlayer.goodsPositions = { ...originalGoodsPositions };
  newPlayer.developments = [...originalDevelopments];

  return newPlayer;
}

/**
 * Trade food for coins (Granaries development)
 */
export function tradeFoodForCoins(player, amount, currentTradeAmount, granariesRate) {
  if (amount < 0) return null;

  const newPlayer = { ...player };
  const difference = amount - currentTradeAmount;
  const totalFoodAvailable = newPlayer.food + currentTradeAmount;

  if (amount <= totalFoodAvailable) {
    // Update food and coins based on the difference
    newPlayer.food -= difference;
    const coinsToAdd = difference * granariesRate;

    return { player: newPlayer, coinsToAdd, newTradeAmount: amount };
  }

  return null;
}
