export default function PlayerNameInputs({
  playerCount,
  playerNames,
  playerHistory,
  onUpdatePlayerName,
  onSelectPlayerFromHistory
}) {
  return (
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
              onChange={(e) => onUpdatePlayerName(i, e.target.value)}
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
                      onClick={() => onSelectPlayerFromHistory(i, player.name)}
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
  );
}
