/**
 * Composant pour l'en-tête du jeu avec titre, score et informations joueur
 */
export default function GameHeader({
  playerName,
  playerScore,
  round,
  soloTurn,
  isSoloMode,
  isMultiplayer,
  testMode,
  showTestMode,
  onToggleTestMode
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg py-2 px-2 sm:px-4 mb-4 flex-shrink-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-lg sm:text-2xl font-bold text-amber-800">
          Roll Through the Ages{isMultiplayer ? ' - Manche ' + round : ''}
        </h1>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {showTestMode && (
            <button
              onClick={onToggleTestMode}
              className={'px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ' + (
                testMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              {testMode ? '🧪 Mode Test ON' : '🧪 Mode Test'}
            </button>
          )}
          {isSoloMode && (
            <div className="text-sm sm:text-xl font-bold text-amber-700 bg-amber-100 px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
              Tour {soloTurn}/10
            </div>
          )}
          <div className="text-sm sm:text-xl font-bold text-amber-700 bg-amber-100 px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
            Score : {playerScore}
          </div>
          <div className="text-sm sm:text-lg font-semibold text-gray-700">
            {isMultiplayer ? 'Tour de ' + playerName : playerName}
          </div>
        </div>
      </div>
    </div>
  );
}
