import { useTranslation } from 'react-i18next';

export default function PlayerNameInputs({
  playerCount,
  playerNames,
  playerHistory,
  onUpdatePlayerName,
  onSelectPlayerFromHistory
}) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-dark-text">
        {playerCount === 1 ? t('setup.playerNameSingular') : t('setup.playerNames')}
      </label>
      {playerNames.map(function(name, i) {
        return (
          <div key={i} className="mb-2">
            <input
              type="text"
              value={name}
              onChange={(e) => onUpdatePlayerName(i, e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-dark-border dark:bg-dark-elevated dark:text-dark-text rounded-lg focus:border-amber-500 dark:focus:border-amber-dark-600 focus:outline-none transition-colors"
              placeholder={t('setup.playerNamePlaceholder', { number: i + 1 })}
              list={'player-history-' + i}
            />
            {playerHistory.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {playerHistory.slice(0, 5).map(function(player) {
                  return (
                    <button
                      key={player.name}
                      onClick={() => onSelectPlayerFromHistory(i, player.name)}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-elevated text-gray-700 dark:text-dark-text rounded hover:bg-gray-200 dark:hover:bg-dark-border cursor-pointer transition-colors"
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
