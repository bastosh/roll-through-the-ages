import { useState } from 'react';
import GameSetup from './components/GameSetup';
import Game from './components/Game';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
  const [variantId, setVariantId] = useState('bronze_age');
  const [isSoloMode, setIsSoloMode] = useState(false);

  function handleStart(names, selectedVariantId, soloMode) {
    setPlayerNames(names);
    setVariantId(selectedVariantId);
    setIsSoloMode(soloMode);
    setGameStarted(true);
  }

  if (!gameStarted) {
    return <GameSetup onStart={handleStart} />;
  }

  return <Game playerNames={playerNames} variantId={variantId} isSoloMode={isSoloMode} />;
}
