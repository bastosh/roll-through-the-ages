import { useState } from 'react';

/**
 * Hook pour gérer la phase de défausse des ressources
 */
export function useDiscardPhase() {
  const [tempGoodsPositions, setTempGoodsPositions] = useState(null);

  function initializeDiscard(goodsPositions) {
    setTempGoodsPositions({ ...goodsPositions });
  }

  function discardGood(type) {
    if (tempGoodsPositions && tempGoodsPositions[type] > 0) {
      setTempGoodsPositions({
        ...tempGoodsPositions,
        [type]: tempGoodsPositions[type] - 1
      });
    }
  }

  function confirmDiscard() {
    const finalPositions = tempGoodsPositions;
    setTempGoodsPositions(null);
    return finalPositions;
  }

  function resetPhase() {
    setTempGoodsPositions(null);
  }

  return {
    tempGoodsPositions,
    initializeDiscard,
    discardGood,
    confirmDiscard,
    resetPhase
  };
}
