import { useState } from 'react';
import { GOODS_TYPES, GOODS_VALUES } from '../constants/gameData';
import { getGoodsValue } from '../utils/gameUtils';
import { calculateDevelopmentCost } from '../utils/developmentCost';

/**
 * Hook pour gérer la phase d'achat de développements
 */
export function useBuyPhase() {
  const [selectedDevelopmentToBuy, setSelectedDevelopmentToBuy] = useState(null);
  const [selectedGoodsForPurchase, setSelectedGoodsForPurchase] = useState({
    wood: 0,
    stone: 0,
    pottery: 0,
    cloth: 0,
    spearheads: 0
  });
  const [coinsForPurchase, setCoinsForPurchase] = useState(0);
  const [originalGoodsPositions, setOriginalGoodsPositions] = useState(null);
  const [originalCoins, setOriginalCoins] = useState(0);
  const [originalDevelopments, setOriginalDevelopments] = useState(null);
  const [lastPurchasedDevelopment, setLastPurchasedDevelopment] = useState(null);
  const [foodToTradeForCoins, setFoodToTradeForCoins] = useState(0);

  function selectDevelopment(dev, player, pendingCoins, playerCount = 1) {
    const totalValue = getGoodsValue(player.goodsPositions) + pendingCoins;
    const actualCost = calculateDevelopmentCost(dev, player.productions, player.monuments, playerCount);

    if (totalValue >= actualCost && player.developments.indexOf(dev.id) === -1) {
      if (originalGoodsPositions) {
        return null; // Already purchased something this turn
      }

      // If total equals cost, auto-buy
      if (totalValue === actualCost) {
        return { autoBuy: true, dev, actualCost };
      } else {
        // Otherwise, ask player to choose resources
        setSelectedDevelopmentToBuy(dev);
        setSelectedGoodsForPurchase({
          wood: 0,
          stone: 0,
          pottery: 0,
          cloth: 0,
          spearheads: 0
        });
        setCoinsForPurchase(pendingCoins);
        return { autoBuy: false, actualCost };
      }
    }
    return null;
  }

  function autoBuyDevelopment(dev, player, pendingCoins, playerCount = 1) {
    // Save original state
    const savedState = {
      goodsPositions: { ...player.goodsPositions },
      coins: pendingCoins,
      developments: [...player.developments]
    };
    setOriginalGoodsPositions(savedState.goodsPositions);
    setOriginalCoins(savedState.coins);
    setOriginalDevelopments(savedState.developments);

    // Calculate actual cost with discount
    const actualCost = calculateDevelopmentCost(dev, player.productions, player.monuments, playerCount);

    // Use all coins first
    let remaining = actualCost - pendingCoins;
    let newCoins = 0;

    // Use goods from most expensive to least expensive
    if (remaining > 0) {
      const goodsOrder = ['spearheads', 'cloth', 'pottery', 'stone', 'wood'];
      for (let i = 0; i < goodsOrder.length; i++) {
        const type = goodsOrder[i];
        while (player.goodsPositions[type] > 0 && remaining > 0) {
          const currentValue = GOODS_VALUES[type][player.goodsPositions[type]];
          const previousValue = GOODS_VALUES[type][player.goodsPositions[type] - 1];
          const valueToDeduct = currentValue - previousValue;
          player.goodsPositions[type]--;
          remaining -= valueToDeduct;
        }
      }
    }

    player.developments.push(dev.id);
    setLastPurchasedDevelopment(dev);

    return { player, newCoins };
  }

  function toggleGoodForPurchase(type, player) {
    if (!selectedDevelopmentToBuy) return;

    const newSelected = { ...selectedGoodsForPurchase };

    if (newSelected[type] === 0) {
      // Click: use this resource
      newSelected[type] = player.goodsPositions[type];
    } else {
      // Click again: don't use this resource
      newSelected[type] = 0;
    }

    setSelectedGoodsForPurchase(newSelected);
  }

  function calculateSelectedValue() {
    let total = coinsForPurchase;
    for (const type of GOODS_TYPES) {
      const position = selectedGoodsForPurchase[type];
      if (position > 0) {
        total += GOODS_VALUES[type][position];
      }
    }
    return total;
  }

  function confirmPurchase(player, pendingCoins, playerCount = 1) {
    if (!selectedDevelopmentToBuy) return null;

    // Calculate actual cost with discount
    const actualCost = calculateDevelopmentCost(selectedDevelopmentToBuy, player.productions, player.monuments, playerCount);

    const selectedValue = calculateSelectedValue();
    if (selectedValue < actualCost) return null;

    // Save original state
    setOriginalGoodsPositions({ ...player.goodsPositions });
    setOriginalCoins(pendingCoins);
    setOriginalDevelopments([...player.developments]);

    // Apply the purchase
    for (const type of GOODS_TYPES) {
      player.goodsPositions[type] -= selectedGoodsForPurchase[type];
    }
    const newPendingCoins = pendingCoins - coinsForPurchase;

    player.developments.push(selectedDevelopmentToBuy.id);

    // Reset selection and state
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);
    setOriginalGoodsPositions(null);
    setOriginalCoins(0);
    setOriginalDevelopments(null);
    setLastPurchasedDevelopment(null);
    setFoodToTradeForCoins(0);

    return { player, newPendingCoins };
  }

  function cancelPurchaseSelection() {
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);
  }

  function resetBuy(player) {
    if (originalGoodsPositions) {
      player.goodsPositions = { ...originalGoodsPositions };
      player.developments = [...originalDevelopments];

      setOriginalGoodsPositions(null);
      setOriginalCoins(0);
      setOriginalDevelopments(null);
      setLastPurchasedDevelopment(null);

      return { player, coins: originalCoins };
    }
    return null;
  }

  function tradeFood(amount, player, granariesRate) {
    if (amount < 0) return null;

    const difference = amount - foodToTradeForCoins;
    const totalFoodAvailable = player.food + foodToTradeForCoins;

    if (amount <= totalFoodAvailable) {
      player.food -= difference;
      const coinsToAdd = difference * granariesRate;
      const newPendingCoins = coinsToAdd;
      setFoodToTradeForCoins(amount);

      return { player, newPendingCoins };
    }
    return null;
  }

  function resetTrade() {
    setFoodToTradeForCoins(0);
  }

  function resetPhase() {
    setSelectedDevelopmentToBuy(null);
    setSelectedGoodsForPurchase({ wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 });
    setCoinsForPurchase(0);
    setOriginalGoodsPositions(null);
    setOriginalCoins(0);
    setOriginalDevelopments(null);
    setLastPurchasedDevelopment(null);
    setFoodToTradeForCoins(0);
  }

  return {
    selectedDevelopmentToBuy,
    selectedGoodsForPurchase,
    coinsForPurchase,
    originalGoodsPositions,
    lastPurchasedDevelopment,
    foodToTradeForCoins,
    selectDevelopment,
    autoBuyDevelopment,
    toggleGoodForPurchase,
    calculateSelectedValue,
    confirmPurchase,
    cancelPurchaseSelection,
    resetBuy,
    tradeFood,
    resetTrade,
    resetPhase
  };
}
