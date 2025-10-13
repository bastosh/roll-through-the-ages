import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg py-2 px-2 sm:px-4 mb-4 flex-shrink-0 transition-colors relative z-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-lg sm:text-2xl font-bold text-amber-800 dark:text-amber-400">
          {t('setup.title')}{isMultiplayer ? ' - ' + t('common.round') + ' ' + round : ''}
        </h1>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {showTestMode && (
            <button
              onClick={onToggleTestMode}
              className={'px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ' + (
                testMode
                  ? 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800'
                  : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
              )}
            >
              {testMode ? t('game.testModeOn') : t('game.testModeOff')}
            </button>
          )}
          {isSoloMode && (
            <div className="text-sm sm:text-xl font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
              {t('game.turn')} {soloTurn}/10
            </div>
          )}
          <div className="text-sm sm:text-xl font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
            {t('game.score')} : {playerScore}
          </div>
          <div className="text-sm sm:text-lg font-semibold text-gray-700 dark:text-dark-text">
            {isMultiplayer ? t('game.turnOf') + ' ' + playerName : playerName}
          </div>
        </div>
      </div>
    </div>
  );
}
