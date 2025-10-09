export default function ScoreDisplay({ players, currentPlayerIndex }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 mb-4">
      <div className="flex items-center justify-around gap-2">
        {players.map(function(player, idx) {
          const isCurrentPlayer = idx === currentPlayerIndex;
          return (
            <div
              key={idx}
              className={'flex items-center gap-2 px-4 py-2 rounded-lg ' + (
                isCurrentPlayer ? 'bg-amber-100 border-2 border-amber-400' : 'bg-gray-50'
              )}
            >
              <span className="font-semibold text-gray-700">{player.name}</span>
              <span className="text-xl font-bold text-amber-700">{player.score} pts</span>
              {player.disasters > 0 && (
                <span className="text-sm text-red-600">💀 {player.disasters}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
