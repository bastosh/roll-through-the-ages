export default function SavedGameBanner({ savedGameState, onResume, onClearSavedGame }) {
  if (!savedGameState) return null;

  return (
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
  );
}
