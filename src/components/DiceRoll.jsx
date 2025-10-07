import { useState, useEffect } from 'react';
import { DICE_FACES } from '../constants/gameData';

export default function DiceRoll({ dice, onRollComplete, currentPlayer, players }) {
  const [diceResults, setDiceResults] = useState([]);
  const [rollCount, setRollCount] = useState(0);
  const [lockedDice, setLockedDice] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(function() {
    rollDice(true);
  }, []);

  function rollDice(initial) {
    setIsRolling(true);
    let diceToRoll = [];

    if (initial) {
      for (let i = 0; i < dice; i++) {
        diceToRoll.push(i);
      }
    } else {
      for (let i = 0; i < diceResults.length; i++) {
        if (lockedDice.indexOf(i) === -1) {
          diceToRoll.push(i);
        }
      }
    }

    setTimeout(function() {
      const newResults = [...diceResults];
      for (let i = 0; i < diceToRoll.length; i++) {
        const idx = diceToRoll[i];
        newResults[idx] = DICE_FACES[Math.floor(Math.random() * 6)];
      }
      setDiceResults(newResults);
      setIsRolling(false);

      const newLocked = [...lockedDice];
      for (let i = 0; i < newResults.length; i++) {
        const result = newResults[i];
        if (result && result.skulls > 0 && newLocked.indexOf(i) === -1) {
          newLocked.push(i);
        }
      }
      setLockedDice(newLocked);
    }, 600);
  }

  function toggleLock(index) {
    if (diceResults[index] && diceResults[index].skulls > 0) return;

    const currentIndex = lockedDice.indexOf(index);
    if (currentIndex === -1) {
      setLockedDice([...lockedDice, index]);
    } else {
      const newLocked = [...lockedDice];
      newLocked.splice(currentIndex, 1);
      setLockedDice(newLocked);
    }
  }

  const canReroll = rollCount < 2 && lockedDice.length < diceResults.length;

  function handleReroll() {
    if (canReroll) {
      setRollCount(rollCount + 1);
      rollDice(false);
    }
  }

  function handleKeep() {
    onRollComplete(diceResults);
  }

  function getDiceIcon(result) {
    if (!result) return '?';
    if (result.type === 'food') return '🌾';
    if (result.type === 'goods') return '📦';
    if (result.type === 'workers') return '👷';
    if (result.type === 'food_or_workers') return '🌾/👷';
    if (result.type === 'coins') return '💰';
    return '?';
  }

  function getDiceText(result) {
    if (!result) return '';
    let text = result.value.toString();
    if (result.type === 'food') text = result.value + ' nourriture';
    if (result.type === 'goods') text = result.value + ' bien' + (result.value > 1 ? 's' : '');
    if (result.type === 'workers') text = result.value + ' ouvrier' + (result.value > 1 ? 's' : '');
    if (result.type === 'food_or_workers') text = result.value + ' nourriture OU ouvriers';
    if (result.type === 'coins') text = result.value + ' pièces';
    if (result.skulls > 0) text += ' ☠️';
    return text;
  }

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-700 shadow-lg z-50"
        >
          Afficher les dés
        </button>
      )}

      {isVisible && (
        <div className="bg-white rounded-xl p-8 max-w-4xl w-full relative">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Masquer
          </button>

          <h2 className="text-3xl font-bold text-center mb-6 text-amber-800">
            {players[currentPlayer].name} - Lancer de dés
          </h2>

          <div className="mb-6 text-center">
            <p className="text-lg text-gray-600">
              Lancer {rollCount + 1}/3
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Cliquez sur un dé pour le verrouiller/déverrouiller
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {diceResults.map(function(result, i) {
              const isLocked = lockedDice.indexOf(i) !== -1;
              const hasSkulls = result && result.skulls > 0;

              let buttonClass = 'aspect-square rounded-lg flex flex-col items-center justify-center text-4xl font-bold transition-all ';
              if (isRolling) buttonClass += 'animate-pulse ';
              if (isLocked) {
                if (hasSkulls) {
                  buttonClass += 'bg-red-200 border-4 border-red-400 cursor-not-allowed';
                } else {
                  buttonClass += 'bg-amber-200 border-4 border-amber-500';
                }
              } else {
                buttonClass += 'bg-gray-100 border-4 border-gray-300 hover:border-amber-300';
              }

              return (
                <button
                  key={i}
                  onClick={() => toggleLock(i)}
                  disabled={hasSkulls}
                  className={buttonClass}
                >
                  <div className="text-5xl mb-2">{getDiceIcon(result)}</div>
                  <div className="text-xs text-gray-600 text-center px-2">
                    {getDiceText(result)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            {canReroll && (
              <button
                onClick={handleReroll}
                disabled={isRolling}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                Relancer les dés non verrouillés
              </button>
            )}
            <button
              onClick={handleKeep}
              disabled={isRolling}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              Conserver et continuer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
