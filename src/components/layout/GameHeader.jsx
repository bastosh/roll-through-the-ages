import { useTranslation } from 'react-i18next';
import ThemeToggle from '../shared/ThemeToggle';

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
  onToggleTestMode,
  soloMaxRounds
}) {
  const { t } = useTranslation();

  return (
    <header className="bg-white dark:bg-dark-surface shadow-lg transition-colors">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Gauche : Tour et Score */}
        <div className="flex items-center gap-3 flex-1">
          {isSoloMode && (
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-lg whitespace-nowrap">
              {t('game.turn')} {soloTurn}/{soloMaxRounds}
            </div>
          )}
          {isMultiplayer && (
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-lg whitespace-nowrap">
              {t('common.round')} {round}
            </div>
          )}
          <div className="text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-lg whitespace-nowrap">
            {playerScore} pts
          </div>
        </div>

        {/* Centre : Titre */}
        <h1 className="text-center text-4xl font-bold text-amber-800 dark:text-amber-400 flex-shrink-0">
          Roll Through the Ages
        </h1>

        {/* Droite : Mode test et nom du joueur */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {showTestMode && (
            <button
              onClick={onToggleTestMode}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition cursor-pointer whitespace-nowrap ${
                testMode
                  ? 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800'
                  : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
              }`}
            >
              {testMode ? '🧪 Test' : 'Test'}
            </button>
          )}
          <div className="text-base font-semibold text-gray-700 dark:text-dark-text whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={playerName}>
            {isMultiplayer ? playerName : playerName}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
