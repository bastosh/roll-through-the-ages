import { useState, useEffect } from 'react';
import { VARIANTS } from '../constants/variants';
import { getScoreHistory, formatDate, clearScoreHistory } from '../utils/scoreHistory';
import { getPlayerHistory, addPlayer, removePlayer, updatePlayerName, clearPlayerHistory } from '../utils/playerHistory';
import VariantDetails from './VariantDetails';

export default function GameSetup({ onStart, savedGameState, onResume, onClearSavedGame }) {
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(['']);
  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0].id);
  const [isSoloMode, setIsSoloMode] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [scoreHistory, setScoreHistory] = useState({});
  const [playerHistory, setPlayerHistory] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editedName, setEditedName] = useState('');
  // Option pour Bronze Age 2024 : fin à 5 ou 6 développements
  const [bronze2024DevCount, setBronze2024DevCount] = useState(5);

  useEffect(function() {
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
      alert('Veuillez saisir au moins un nom de joueur');
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
    if (confirm('Êtes-vous sûr de vouloir réinitialiser complètement le jeu ? Toutes les données (scores, joueurs, parties sauvegardées) seront supprimées.')) {
      clearScoreHistory();
      clearPlayerHistory();
      if (onClearSavedGame) {
        onClearSavedGame();
      }
      setScoreHistory({});
      setPlayerHistory([]);
      setShowConfig(false);
      alert('Le jeu a été réinitialisé avec succès.');
    }
  }

  function handleDeletePlayer(playerName) {
    if (confirm('Supprimer le joueur "' + playerName + '" de l\'historique ?')) {
      removePlayer(playerName);
      setPlayerHistory(getPlayerHistory());
    }
  }

  function handleStartEdit(playerName) {
    setEditingPlayer(playerName);
    setEditedName(playerName);
  }

  function handleSaveEdit() {
    if (editedName && editedName.trim() !== '') {
      updatePlayerName(editingPlayer, editedName.trim());
      setPlayerHistory(getPlayerHistory());
      setEditingPlayer(null);
      setEditedName('');
    }
  }

  function handleCancelEdit() {
    setEditingPlayer(null);
    setEditedName('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-8">
      {/* Config Button */}
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="fixed top-4 right-4 bg-gray-600 text-white p-3 rounded-lg shadow-lg hover:bg-gray-700 transition cursor-pointer"
        title="Configuration"
      >
        ⚙️
      </button>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-800">⚙️ Configuration</h2>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <button
                  onClick={handleResetGame}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition cursor-pointer"
                >
                  Réinitialiser complètement le jeu
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Supprime tous les scores, joueurs et parties sauvegardées
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-800">Joueurs enregistrés</h3>
                {playerHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun joueur enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {playerHistory.map(function(player) {
                      const isEditing = editingPlayer === player.name;

                      return (
                        <div key={player.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="flex-1 px-2 py-1 border-2 border-amber-500 rounded"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer"
                              >
                                ✓
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 cursor-pointer"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 font-semibold">{player.name}</span>
                              <button
                                onClick={() => handleStartEdit(player.name)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeletePlayer(player.name)}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowConfig(false)}
              className="w-full mt-6 bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-800 bg-white rounded-xl shadow-lg p-6">
          Roll Through the Ages
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Colonne de gauche : Configuration */}
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-amber-800">⚙️ Configuration</h2>

          {savedGameState && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-800">💾 Partie sauvegardée détectée</h3>
                  <p className="text-sm text-gray-600">
                    {savedGameState.playerNames.join(', ')} - Tour {savedGameState.round}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onClearSavedGame}
                    className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 cursor-pointer"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={onResume}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 cursor-pointer"
                  >
                    Reprendre
                  </button>
                </div>
              </div>
            </div>
          )}


          <div className="space-y-6">

            {/* Nombre de joueurs en premier */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-gray-700">
                Nombre de joueurs
              </label>
              <div className="flex gap-4">
                {[1, 2].map(function(num) {
                  return (
                    <button
                      key={num}
                      onClick={() => updatePlayerCount(num)}
                      className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                        playerCount === num
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      )}
                    >
                      {num} {num === 1 ? 'joueur' : 'joueurs'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nom(s) des joueurs juste après le nombre de joueurs */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-gray-700">
                {playerCount === 1 ? 'Nom du joueur' : 'Noms des joueurs'}
              </label>
              {playerNames.map(function(name, i) {
                return (
                  <div key={i} className="mb-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updatePlayerName(i, e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder={'Joueur ' + (i + 1)}
                      list={'player-history-' + i}
                    />
                    {playerHistory.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {playerHistory.slice(0, 5).map(function(player) {
                          return (
                            <button
                              key={player.name}
                              onClick={() => selectPlayerFromHistory(i, player.name)}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              {player.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Variante du jeu */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-gray-700">
                Variante du jeu
              </label>
              <div className="flex gap-4 flex-wrap">
                {VARIANTS.map(function(variant) {
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={'flex-1 min-w-[200px] py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                        selectedVariant === variant.id
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      )}
                    >
                      {variant.displayName}
                    </button>
                  );
                })}
              </div>
              {/* Option spécifique Bronze Age 2024, seulement pour 2 joueurs */}
              {selectedVariant === 'bronze_age_2024' && playerCount === 2 && (
                <div className="mt-4">
                  <label className="block text-md font-semibold mb-2 text-gray-700">
                    Fin de partie :
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setBronze2024DevCount(5)}
                      className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (bronze2024DevCount === 5 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}
                    >
                      5 développements achetés
                    </button>
                    <button
                      onClick={() => setBronze2024DevCount(6)}
                      className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (bronze2024DevCount === 6 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}
                    >
                      6 développements achetés
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Choisissez à combien de développements la partie se termine.</p>
                </div>
              )}
            </div>

            {playerCount === 1 && (
              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">
                  Mode de jeu
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsSoloMode(true)}
                    className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                      isSoloMode
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                  >
                    Mode solo (10 tours)
                  </button>
                  <button
                    onClick={() => setIsSoloMode(false)}
                    className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                      !isSoloMode
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                  >
                    Partie libre
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-lg font-semibold mb-3 text-gray-700">
                {playerCount === 1 ? 'Nom du joueur' : 'Noms des joueurs'}
              </label>
              {playerNames.map(function(name, i) {
                return (
                  <div key={i} className="mb-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updatePlayerName(i, e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder={'Joueur ' + (i + 1)}
                      list={'player-history-' + i}
                    />
                    {playerHistory.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {playerHistory.slice(0, 5).map(function(player) {
                          return (
                            <button
                              key={player.name}
                              onClick={() => selectPlayerFromHistory(i, player.name)}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              {player.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-amber-700 transition cursor-pointer"
            >
              Commencer la partie
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

        {/* Score History */}
        {(function() {
          const variantScores = scoreHistory[selectedVariant];
          if (!variantScores) return false;

          const hasSoloScores = variantScores.solo && variantScores.solo.length > 0;
          const hasMultiScores = variantScores.multi && variantScores.multi.length > 0;

          if (!hasSoloScores && !hasMultiScores) return false;

          const selectedVariantConfig = VARIANTS.find(v => v.id === selectedVariant);

          return (
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-amber-800 text-center">
                🏆 Meilleurs scores - {selectedVariantConfig ? selectedVariantConfig.displayName : ''}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasSoloScores && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-gray-700">Mode Solo</h3>
                    <div className="space-y-2">
                      {variantScores.solo.map(function(entry, i) {
                        return (
                          <div
                            key={i}
                            className={'flex items-center justify-between p-2 rounded ' + (
                              i === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-600">{i + 1}.</span>
                              <span className="font-semibold">{entry.playerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-700">{entry.score} pts</span>
                              <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {hasMultiScores && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-gray-700">Mode Multijoueur</h3>
                    <div className="space-y-2">
                      {variantScores.multi.map(function(entry, i) {
                        return (
                          <div
                            key={i}
                            className={'flex items-center justify-between p-2 rounded ' + (
                              i === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-600">{i + 1}.</span>
                              <span className="font-semibold">{entry.playerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-700">{entry.score} pts</span>
                              <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
