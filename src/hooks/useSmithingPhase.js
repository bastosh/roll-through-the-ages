import { useState } from 'react';

/**
 * Hook pour gérer la phase Forge (invasion avec dépense de Lances)
 */
export function useSmithingPhase() {
  const [spearheadsToSpend, setSpearheadsToSpend] = useState(0);

  /**
   * Initialise la phase Forge
   */
  function initializeSmithingPhase() {
    setSpearheadsToSpend(0);
  }

  /**
   * Définir le nombre de Lances à dépenser
   * @param {number} amount - Nombre de Lances à dépenser
   */
  function setSpearheads(amount) {
    setSpearheadsToSpend(Math.max(0, amount));
  }

  /**
   * Incrémenter le nombre de Lances à dépenser
   * @param {number} maxSpearheads - Nombre maximum de Lances disponibles
   */
  function incrementSpearheads(maxSpearheads) {
    setSpearheadsToSpend(function(current) {
      return Math.min(current + 1, maxSpearheads);
    });
  }

  /**
   * Décrémenter le nombre de Lances à dépenser
   */
  function decrementSpearheads() {
    setSpearheadsToSpend(function(current) {
      return Math.max(current - 1, 0);
    });
  }

  /**
   * Réinitialise complètement la phase
   */
  function resetPhase() {
    setSpearheadsToSpend(0);
  }

  return {
    spearheadsToSpend,
    initializeSmithingPhase,
    setSpearheads,
    incrementSpearheads,
    decrementSpearheads,
    resetPhase
  };
}
