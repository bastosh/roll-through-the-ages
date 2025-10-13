import { useState } from 'react';

/**
 * Hook pour gérer la phase de commerce (échanges avec les bateaux)
 */
export function useTradePhase() {
  const [tradePhaseInitialGoods, setTradePhaseInitialGoods] = useState(null);
  const [tradesUsed, setTradesUsed] = useState(0);

  /**
   * Initialise la phase de commerce
   */
  function initializeTradePhase(player) {
    setTradePhaseInitialGoods({ ...player.goodsPositions });
    setTradesUsed(0);
  }

  /**
   * Échange une ressource contre une autre (1 bateau = 1 échange)
   * @param {Object} player - Le joueur
   * @param {string} fromType - Type de ressource à échanger (wood, stone, pottery, cloth, spearheads)
   * @param {string} toType - Type de ressource à recevoir
   * @returns {boolean} - true si l'échange a réussi
   */
  function tradeResource(player, fromType, toType) {
    // Vérifier que les types sont différents
    if (fromType === toType) return false;

    // Vérifier que le joueur a la ressource à échanger
    if (!player.goodsPositions[fromType] || player.goodsPositions[fromType] <= 0) {
      return false;
    }

    // Vérifier qu'il reste des échanges disponibles
    const maxTrades = player.builtBoats || 0;
    if (tradesUsed >= maxTrades) {
      return false;
    }

    // Effectuer l'échange
    player.goodsPositions[fromType]--;
    player.goodsPositions[toType]++;
    setTradesUsed(tradesUsed + 1);

    return true;
  }

  /**
   * Annule le dernier échange
   * @param {Object} player - Le joueur
   * @param {string} fromType - Type de ressource qui a été échangée
   * @param {string} toType - Type de ressource qui a été reçue
   * @returns {boolean} - true si l'annulation a réussi
   */
  function undoTrade(player, fromType, toType) {
    if (tradesUsed <= 0) return false;

    // Vérifier que le joueur a la ressource à rendre
    if (!player.goodsPositions[toType] || player.goodsPositions[toType] <= 0) {
      return false;
    }

    // Annuler l'échange
    player.goodsPositions[toType]--;
    player.goodsPositions[fromType]++;
    setTradesUsed(tradesUsed - 1);

    return true;
  }

  /**
   * Réinitialise tous les échanges de cette phase
   */
  function resetTrades(player) {
    if (!tradePhaseInitialGoods) return;

    player.goodsPositions = { ...tradePhaseInitialGoods };
    setTradesUsed(0);
  }

  /**
   * Réinitialise complètement la phase
   */
  function resetPhase() {
    setTradePhaseInitialGoods(null);
    setTradesUsed(0);
  }

  /**
   * Vérifie si le joueur peut passer la phase de commerce
   */
  function canSkipTrade(player) {
    // On peut toujours passer la phase de commerce, même si on n'a pas utilisé tous les échanges
    return true;
  }

  return {
    tradePhaseInitialGoods,
    tradesUsed,
    initializeTradePhase,
    tradeResource,
    undoTrade,
    resetTrades,
    canSkipTrade,
    resetPhase
  };
}
