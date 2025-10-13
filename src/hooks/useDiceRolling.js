import { useState, useRef, useEffect } from 'react';
import { DICE_FACES } from '../constants/gameData';

export function useDiceRolling(numDice, isSoloMode, variantConfig, currentPlayer, onAutoValidate, savedState) {
  const [diceResults, setDiceResults] = useState(savedState?.diceResults ?? null);
  const [rollCount, setRollCount] = useState(savedState?.rollCount ?? 0);
  const [lockedDice, setLockedDice] = useState(savedState?.lockedDice ?? []);
  const [leadershipUsed, setLeadershipUsed] = useState(savedState?.leadershipUsed ?? false);
  const [leadershipMode, setLeadershipMode] = useState(false);

  // Ref to store timeout ID for auto-validate
  const autoValidateTimeoutRef = useRef(null);

  // Clean up timeout on unmount
  useEffect(function() {
    return function() {
      if (autoValidateTimeoutRef.current) {
        clearTimeout(autoValidateTimeoutRef.current);
      }
    };
  }, []);

  function rollDice(initial, currentRollCount) {
    // Clear any existing auto-validate timeout to avoid race conditions
    if (autoValidateTimeoutRef.current) {
      clearTimeout(autoValidateTimeoutRef.current);
      autoValidateTimeoutRef.current = null;
    }

    let diceToRoll = [];

    if (initial) {
      for (let i = 0; i < numDice; i++) {
        diceToRoll.push(i);
      }
    } else {
      for (let i = 0; i < diceResults.length; i++) {
        if (lockedDice.indexOf(i) === -1) {
          diceToRoll.push(i);
        }
      }
    }

    // Generate new results immediately
    const newResults = [...diceResults || []];
    for (let i = 0; i < diceToRoll.length; i++) {
      const idx = diceToRoll[i];
      newResults[idx] = DICE_FACES[Math.floor(Math.random() * 6)];
    }
    setDiceResults(newResults);

    // Skulls auto-locked unless in solo mode AND variant allows rerolling skulls
    const shouldLockSkulls = !isSoloMode || variantConfig.soloSkullsLocked;
    let newLockedDice = [...lockedDice];
    if (shouldLockSkulls) {
      for (let i = 0; i < newResults.length; i++) {
        const result = newResults[i];
        if (result && result.skulls > 0 && newLockedDice.indexOf(i) === -1) {
          newLockedDice.push(i);
        }
      }
      setLockedDice(newLockedDice);
    }

    // Auto-validate if:
    // 1. No more rerolls available (currentRollCount will be 2 after the 3rd roll)
    // 2. OR all dice are locked
    // BUT only if Leadership is not available (doesn't have it OR already used it)
    const hasLeadership = newResults.length > 0 && currentPlayer.developments.indexOf('leadership') !== -1;
    const canUseLeadership = hasLeadership && !leadershipUsed;
    const allDiceLocked = newLockedDice.length >= newResults.length;

    // Check if we can reroll after this roll (rollCount starts at 0, after 3rd roll currentRollCount is 2)
    const noMoreRerolls = currentRollCount >= 2;

    if ((noMoreRerolls || allDiceLocked) && !leadershipMode && !canUseLeadership) {
      // Auto-validate after a short delay
      autoValidateTimeoutRef.current = setTimeout(function() {
        autoValidateTimeoutRef.current = null;
        onAutoValidate(newResults);
      }, 300);
    }
  }

  function toggleLock(index) {
    // Skulls cannot be unlocked unless in solo mode AND variant allows rerolling skulls
    const skullsAreLocked = !isSoloMode || variantConfig.soloSkullsLocked;
    if (skullsAreLocked && diceResults[index] && diceResults[index].skulls > 0) return;

    const currentIndex = lockedDice.indexOf(index);
    if (currentIndex === -1) {
      setLockedDice([...lockedDice, index]);
    } else {
      const newLocked = [...lockedDice];
      newLocked.splice(currentIndex, 1);
      setLockedDice(newLocked);
    }
  }

  function handleReroll() {
    if (rollCount < 2 && lockedDice.length < diceResults.length) {
      const newRollCount = rollCount + 1;
      setRollCount(newRollCount);
      rollDice(false, newRollCount);
    }
  }

  function handleUseLeadership() {
    // When entering leadership mode, lock all dice (user will unlock the one they want to reroll)
    const allLocked = [];
    for (let i = 0; i < diceResults.length; i++) {
      allLocked.push(i);
    }
    setLockedDice(allLocked);
    setLeadershipMode(true);
    setLeadershipUsed(true);
  }

  function handleLeadershipReroll() {
    // Count how many dice are unlocked in leadership mode (skulls allowed)
    let unlockedCount = 0;
    for (let i = 0; i < diceResults.length; i++) {
      const isLocked = lockedDice.indexOf(i) !== -1;
      if (!isLocked) {
        unlockedCount++;
      }
    }

    // Only allow if exactly 1 die is unlocked
    if (unlockedCount === 1) {
      rollDice(false, rollCount);
      // On sort du mode leadership, ce qui permet à nouveau l'affichage du bouton Valider
      setLeadershipMode(false);
      // On ne valide pas automatiquement, l'utilisateur doit cliquer sur Valider (handleKeep)
    }
  }

  function handleCancelLeadership() {
    // Reset locks to only skull dice (or all dice if in multiplayer/variant that locks skulls)
    setLeadershipMode(false);
    const skullsAreLocked = !isSoloMode || variantConfig.soloSkullsLocked;
    const newLocked = [];
    for (let i = 0; i < diceResults.length; i++) {
      const result = diceResults[i];
      if (skullsAreLocked && result && result.skulls > 0) {
        newLocked.push(i);
      }
    }
    setLockedDice(newLocked);
  }

  function resetForNewTurn() {
    setDiceResults(null);
    setRollCount(0);
    setLockedDice([]);
    setLeadershipUsed(false);
    setLeadershipMode(false);
  }

  return {
    // État
    diceResults,
    rollCount,
    lockedDice,
    leadershipUsed,
    leadershipMode,
    // Actions
    rollDice,
    toggleLock,
    handleReroll,
    handleUseLeadership,
    handleLeadershipReroll,
    handleCancelLeadership,
    resetForNewTurn,
    // Setters pour les cas spéciaux
    setDiceResults,
    setLockedDice,
    setRollCount
  };
}
