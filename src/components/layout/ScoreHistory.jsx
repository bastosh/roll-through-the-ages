import { useTranslation } from 'react-i18next';
import { VARIANTS } from '../../constants/variants';
import { formatDate } from '../../utils/scoreHistory';

function ScoreModeSection({ title, scores }) {
  const { t } = useTranslation();
  if (!scores || scores.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold mb-3 text-gray-700">{title}</h3>
      <div className="space-y-2">
        {scores.map(function(entry, i) {
          return (
            <div
              key={i}
              className={'flex items-center justify-between p-2 rounded ' + (
                i === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">{i + 1}.</span>
                <span className="font-semibold">{entry.playerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-700">{entry.score} {t('setup.pointsShort')}</span>
                <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
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
    <div className="bg-white rounded-xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-amber-800 text-center">
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
