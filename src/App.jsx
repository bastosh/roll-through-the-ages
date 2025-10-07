import { useState } from 'react';
import GameSetup from './components/GameSetup';
import Game from './components/Game';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);

  function handleStart(names) {
    setPlayerNames(names);
    setGameStarted(true);
  }

  if (!gameStarted) {
    return <GameSetup onStart={handleStart} />;
  }

  return <Game playerNames={playerNames} />;
}
