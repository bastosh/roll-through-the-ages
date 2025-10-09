import { useState, useEffect } from 'react';
import GameSetup from './components/GameSetup';
import Game from './components/Game';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
  const [variantId, setVariantId] = useState('bronze_age');
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [savedGameState, setSavedGameState] = useState(null);

  // Check for saved game on mount
  useEffect(function() {
    try {
      const saved = window.localStorage.getItem('rtta_game_state');
      if (saved) {
        const gameState = JSON.parse(saved);
        // Check if saved game is less than 7 days old
        const savedDate = new Date(gameState.timestamp);
        const now = new Date();
        const daysDiff = (now - savedDate) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          setSavedGameState(gameState);
        } else {
          // Remove old saved game
          window.localStorage.removeItem('rtta_game_state');
        }
      }
    } catch (error) {
      console.error('Error loading saved game:', error);
    }
  }, []);

  function handleStart(names, selectedVariantId, soloMode) {
    setPlayerNames(names);
    setVariantId(selectedVariantId);
    setIsSoloMode(soloMode);
    setGameStarted(true);
    setSavedGameState(null);
  }

  function handleResume() {
    if (savedGameState) {
      setPlayerNames(savedGameState.playerNames);
      setVariantId(savedGameState.variantId);
      setIsSoloMode(savedGameState.isSoloMode);
      setGameStarted(true);
    }
  }

  function handleClearSavedGame() {
    try {
      window.localStorage.removeItem('rtta_game_state');
      setSavedGameState(null);
    } catch (error) {
      console.error('Error clearing saved game:', error);
    }
  }

  if (!gameStarted) {
    return (
      <GameSetup
        onStart={handleStart}
        savedGameState={savedGameState}
        onResume={handleResume}
        onClearSavedGame={handleClearSavedGame}
      />
    );
  }

  return (
    <Game
      playerNames={playerNames}
      variantId={variantId}
      isSoloMode={isSoloMode}
      savedGameState={savedGameState}
    />
  );
}
