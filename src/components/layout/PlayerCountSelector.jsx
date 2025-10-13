export default function PlayerCountSelector({ playerCount, onUpdatePlayerCount }) {
  return (
    <div>
      <label className="block text-lg font-semibold mb-3 text-gray-700">
        Nombre de joueurs
      </label>
      <div className="flex gap-4">
        {[1, 2].map(function(num) {
          return (
            <button
              key={num}
              onClick={() => onUpdatePlayerCount(num)}
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
  );
}
