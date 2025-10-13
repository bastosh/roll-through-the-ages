import { useTranslation } from 'react-i18next';
import { VARIANTS } from '../../constants/variants';

export default function VariantSelector({
  selectedVariant,
  playerCount,
  isSoloMode,
  bronze2024DevCount,
  onSelectVariant,
  onSetBronze2024DevCount,
  onSetIsSoloMode
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Variante du jeu */}
      <div>
        <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-dark-text">
          {t('setup.variant')}
        </label>
        <div className="flex gap-4 flex-wrap">
          {VARIANTS.map(function(variant) {
            return (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant.id)}
                className={'flex-1 min-w-[200px] py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                  selectedVariant === variant.id
                    ? 'bg-amber-600 dark:bg-amber-dark-700 text-white'
                    : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
                )}
              >
                {variant.displayName}
              </button>
            );
          })}
        </div>
        {/* Option spécifique Bronze Age 2024, seulement pour 2 joueurs */}
        {selectedVariant === 'bronze_age_2024' && playerCount === 2 && (
          <div className="mt-4">
            <label className="block text-md font-semibold mb-2 text-gray-700 dark:text-dark-text">
              {t('setup.gameEndCondition')}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => onSetBronze2024DevCount(5)}
                className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (bronze2024DevCount === 5 ? 'bg-amber-600 dark:bg-amber-dark-700 text-white' : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border')}
              >
                {t('setup.developmentsPurchased', { count: 5 })}
              </button>
              <button
                onClick={() => onSetBronze2024DevCount(6)}
                className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (bronze2024DevCount === 6 ? 'bg-amber-600 dark:bg-amber-dark-700 text-white' : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border')}
              >
                {t('setup.developmentsPurchased', { count: 6 })}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">{t('setup.chooseEndCondition')}</p>
          </div>
        )}
      </div>

      {/* Mode de jeu pour solo */}
      {playerCount === 1 && (
        <div>
          <label className="block text-lg font-semibold mb-3 text-gray-700 dark:text-dark-text">
            {t('setup.gameMode')}
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => onSetIsSoloMode(true)}
              className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                isSoloMode
                  ? 'bg-amber-600 dark:bg-amber-dark-700 text-white'
                  : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
              )}
            >
              {t('setup.soloMode10Turns')}
            </button>
            <button
              onClick={() => onSetIsSoloMode(false)}
              className={'flex-1 py-3 rounded-lg font-semibold transition cursor-pointer ' + (
                !isSoloMode
                  ? 'bg-amber-600 dark:bg-amber-dark-700 text-white'
                  : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
              )}
            >
              {t('setup.freePlay')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
