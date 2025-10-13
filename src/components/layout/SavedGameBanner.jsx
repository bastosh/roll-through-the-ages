export default function SavedGameBanner({ savedGameState, onResume, onClearSavedGame }) {
  if (!savedGameState) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-lg transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-blue-800 dark:text-blue-400">💾 Partie sauvegardée détectée</h3>
          <p className="text-sm text-gray-600 dark:text-dark-text-muted">
            {savedGameState.playerNames.join(', ')} - Tour {savedGameState.round}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClearSavedGame}
            className="px-3 py-2 bg-red-500 dark:bg-red-600 text-white text-sm rounded hover:bg-red-600 dark:hover:bg-red-700 cursor-pointer transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={onResume}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded hover:bg-blue-700 dark:hover:bg-blue-800 cursor-pointer transition-colors"
          >
            Reprendre
          </button>
        </div>
      </div>
    </div>
  );
}
