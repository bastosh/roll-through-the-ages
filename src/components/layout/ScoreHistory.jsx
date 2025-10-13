import { useTranslation } from 'react-i18next';
import { VARIANTS } from '../../constants/variants';
import { formatDate } from '../../utils/scoreHistory';

function ScoreModeSection({ title, scores }) {
  const { t } = useTranslation();
  if (!scores || scores.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-dark-text">{title}</h3>
      <div className="space-y-2">
        {scores.map(function(entry, i) {
          return (
            <div
              key={i}
              className={'flex items-center justify-between p-2 rounded transition-colors ' + (
                i === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600' : 'bg-gray-50 dark:bg-dark-elevated'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600 dark:text-dark-text-muted">{i + 1}.</span>
                <span className="font-semibold dark:text-dark-text">{entry.playerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-700 dark:text-amber-500">{entry.score} {t('setup.pointsShort')}</span>
                <span className="text-xs text-gray-500 dark:text-dark-text-muted">{formatDate(entry.date)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ScoreHistory({ scoreHistory, selectedVariant }) {
  const { t } = useTranslation();
  const variantScores = scoreHistory[selectedVariant];
  if (!variantScores) return null;

  const hasSoloScores = variantScores.solo && variantScores.solo.length > 0;
  const hasMultiScores = variantScores.multi && variantScores.multi.length > 0;

  if (!hasSoloScores && !hasMultiScores) return null;

  const selectedVariantConfig = VARIANTS.find(v => v.id === selectedVariant);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 transition-colors">
      <h2 className="text-2xl font-bold mb-4 text-amber-800 dark:text-amber-400 text-center">
        🏆 {t('setup.bestScores')} - {selectedVariantConfig ? selectedVariantConfig.displayName : ''}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreModeSection
          title={t('setup.soloModeLabel')}
          scores={variantScores.solo}
        />
        <ScoreModeSection
          title={t('setup.multiplayerMode')}
          scores={variantScores.multi}
        />
      </div>
    </div>
  );
}
