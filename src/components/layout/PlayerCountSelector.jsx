import { useTranslation } from 'react-i18next';

export default function PlayerCountSelector({ playerCount, onUpdatePlayerCount }) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-dark-text">
        {t('setup.playerCount')}
      </label>
      <div className="flex gap-4">
        {[1, 2].map(function(num) {
          return (
            <button
              key={num}
              onClick={() => onUpdatePlayerCount(num)}
              className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                playerCount === num
                  ? 'bg-amber-600 dark:bg-amber-dark-700 text-white'
                  : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
              )}
            >
              {num} {num === 1 ? t('setup.onePlayer') : t('setup.multiplePlayers')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
