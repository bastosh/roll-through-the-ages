import { useTranslation } from 'react-i18next';

/**
 * Composant pour la modal qui annonce le tour d'un joueur
 */
export default function PlayerTurnModal({
  show,
  playerName,
  round,
  gameEndTriggered,
  onStart
}) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-amber-100 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center z-50 transition-colors">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 max-w-md mx-4 transition-colors">
        <h2 className="text-3xl font-bold text-center mb-4 text-amber-800 dark:text-amber-400">
          {t('game.turnOf')} {playerName}
        </h2>
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎲</div>
          <p className="text-gray-600 dark:text-dark-text-muted">
            {gameEndTriggered ? t('game.lastTurn') : `${t('common.round')} ${round}`}
          </p>
        </div>
        <button
          onClick={onStart}
          className="w-full bg-amber-600 dark:bg-amber-dark-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-amber-700 dark:hover:bg-amber-dark-600 transition cursor-pointer"
        >
          {t('game.startMyTurn')}
        </button>
      </div>
    </div>
  );
}
