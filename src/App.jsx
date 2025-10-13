import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import GameSetup from './components/layout/GameSetup';
import Game from './components/Game';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
  const [variantId, setVariantId] = useState('bronze_age');
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [bronze2024DevCount, setBronze2024DevCount] = useState(5);
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

  function handleStart(names, selectedVariantId, soloMode, devCount) {
    setPlayerNames(names);
    setVariantId(selectedVariantId);
    setIsSoloMode(soloMode);
    if (selectedVariantId === 'bronze_age_2024' && devCount) {
      setBronze2024DevCount(devCount);
    } else {
      setBronze2024DevCount(5);
    }
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
      <ThemeProvider>
        <GameSetup
          onStart={handleStart}
          savedGameState={savedGameState}
          onResume={handleResume}
          onClearSavedGame={handleClearSavedGame}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Game
        playerNames={playerNames}
        variantId={variantId}
        isSoloMode={isSoloMode}
        bronze2024DevCount={bronze2024DevCount}
        savedGameState={savedGameState}
      />
    </ThemeProvider>
  );
}
