import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getScoreHistory, clearScoreHistory } from '../../utils/scoreHistory';
import { getPlayerHistory, addPlayer, removePlayer, clearPlayerHistory } from '../../utils/playerHistory';
import { VARIANTS } from '../../constants/variants';
import VariantDetails from '../info/VariantDetails';
import Credits from '../info/Credits';
import ConfigModal from './ConfigModal';
import SavedGameBanner from './SavedGameBanner';
import PlayerCountSelector from './PlayerCountSelector';
import PlayerNameInputs from './PlayerNameInputs';
import VariantSelector from './VariantSelector';
import ScoreHistory from './ScoreHistory';
import LanguageSelector from '../shared/LanguageSelector';
import ThemeToggle from '../shared/ThemeToggle';

export default function GameSetup({ onStart, savedGameState, onResume, onClearSavedGame }) {
  const { t } = useTranslation();
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(['']);
  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0].id);
  const [isSoloMode, setIsSoloMode] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [scoreHistory, setScoreHistory] = useState({});
  const [playerHistory, setPlayerHistory] = useState([]);
  const [bronze2024DevCount, setBronze2024DevCount] = useState(5);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(function () {
    setScoreHistory(getScoreHistory());
    setPlayerHistory(getPlayerHistory());
  }, []);

  function updatePlayerCount(count) {
    setPlayerCount(count);
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push(playerNames[i] || '');
    }
    setPlayerNames(names);

    // Solo mode only available for 1 player
    if (count > 1) {
      setIsSoloMode(false);
    }
  }

  function updatePlayerName(index, name) {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  }

  function selectPlayerFromHistory(index, playerName) {
    const newNames = [...playerNames];
    newNames[index] = playerName;
    setPlayerNames(newNames);
  }

  function handleStart() {
    // Filter out empty names
    const filteredNames = playerNames.filter(n => n && n.trim() !== '');

    if (filteredNames.length === 0) {
      alert(t('setup.atLeastOnePlayer'));
      return;
    }

    // Add players to history
    for (let i = 0; i < filteredNames.length; i++) {
      addPlayer(filteredNames[i]);
    }

    // Passe l'option bronze2024DevCount si la variante 2024 est sélectionnée
    onStart(filteredNames, selectedVariant, isSoloMode, selectedVariant === 'bronze_age_2024' ? bronze2024DevCount : undefined);
  }

  function handleResetGame() {
    if (confirm(t('setup.resetGameConfirm'))) {
      clearScoreHistory();
      clearPlayerHistory();
      if (onClearSavedGame) {
        onClearSavedGame();
      }
      setScoreHistory({});
      setPlayerHistory([]);
      setShowConfig(false);
      alert(t('setup.resetSuccess'));
    }
  }

  function handleDeletePlayer(playerName) {
    if (confirm(t('setup.deletePlayerConfirm', { name: playerName }))) {
      removePlayer(playerName);
      setPlayerHistory(getPlayerHistory());
    }
  }

  function handleUpdatePlayer(oldName, newName) {
    // Note: cette fonction n'est pas encore implémentée dans playerHistory
    // Pour l'instant, on ne fait rien
    console.log('Update player:', oldName, 'to', newName);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface shadow-lg transition-colors">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 w-64">
            <LanguageSelector />
          </div>

          <h1 className="text-center text-4xl font-bold text-amber-800 dark:text-amber-400">
            Roll Through the Ages
          </h1>

          <div className="flex items-center gap-3 w-64 justify-end">
            <ThemeToggle />

            {/* Credits Button */}
            <button
              onClick={() => setShowCredits(!showCredits)}
              className="h-12 w-12 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text rounded-lg shadow-lg p-3 hover:bg-gray-100 dark:hover:bg-dark-elevated transition cursor-pointer z-10"
              title={t('common.credits')}
            >
              ℹ️
            </button>

            {/* Config Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="h-12 w-12 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text rounded-lg shadow-lg p-3 hover:bg-gray-100 dark:hover:bg-dark-elevated transition cursor-pointer z-10"
              title={t('common.configuration')}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onResetGame={handleResetGame}
        playerHistory={playerHistory}
        onDeletePlayer={handleDeletePlayer}
        onUpdatePlayer={handleUpdatePlayer}
      />

      <Credits
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
      />

      <div className="max-w-7xl mx-auto p-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Colonne de gauche : Configuration */}
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 transition-colors">
            <h2 className="text-2xl font-bold mb-6 text-amber-800 dark:text-amber-400">⚙️ {t('common.configuration')}</h2>

            <SavedGameBanner
              savedGameState={savedGameState}
              onResume={onResume}
              onClearSavedGame={onClearSavedGame}
            />


            <div className="space-y-6">
              <PlayerCountSelector
                playerCount={playerCount}
                onUpdatePlayerCount={updatePlayerCount}
              />

              <PlayerNameInputs
                playerCount={playerCount}
                playerNames={playerNames}
                playerHistory={playerHistory}
                onUpdatePlayerName={updatePlayerName}
                onSelectPlayerFromHistory={selectPlayerFromHistory}
              />

              <VariantSelector
                selectedVariant={selectedVariant}
                playerCount={playerCount}
                isSoloMode={isSoloMode}
                bronze2024DevCount={bronze2024DevCount}
                onSelectVariant={setSelectedVariant}
                onSetBronze2024DevCount={setBronze2024DevCount}
                onSetIsSoloMode={setIsSoloMode}
              />

              <button
                onClick={handleStart}
                className="w-full bg-amber-600 dark:bg-amber-dark-700 text-white py-4 rounded-lg font-bold text-xl hover:bg-amber-700 dark:hover:bg-amber-dark-600 transition cursor-pointer"
              >
                {t('setup.startGameButton')}
              </button>
            </div>
          </div>

          {/* Colonne de droite : Détails du variant */}
          <VariantDetails
            variantId={selectedVariant}
            playerCount={playerCount}
            isSoloMode={isSoloMode}
          />
        </div>

        <ScoreHistory
          scoreHistory={scoreHistory}
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  );
}
