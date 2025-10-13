import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getVariantById } from '../../constants/variants';

export default function VariantDetails({ variantId, playerCount, isSoloMode }) {
  const { t } = useTranslation();
  const variant = getVariantById(variantId);
  const [monumentsOpen, setMonumentsOpen] = useState(false);
  const [developmentsOpen, setDevelopmentsOpen] = useState(false);

  if (!variant) return null;

  // Filtrer les monuments disponibles selon le nombre de joueurs
  const excludedMonuments = variant.monumentRestrictions[playerCount] || [];
  const availableMonuments = variant.monuments.filter(m => excludedMonuments.indexOf(m.id) === -1);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-amber-800">📜 {t('setup.rulesTitle', { variant: variant.displayName })}</h2>

      {/* Conditions de victoire */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-amber-700 mb-2">🏆 {t('setup.victoryConditions')}</h3>
        <div className="bg-amber-50 rounded p-3 space-y-1 text-sm">
          {isSoloMode ? (
            <p>{t('setup.play10Turns')}</p>
          ) : playerCount === 1 ? (
            <p>{t('setup.noEndCondition')}</p>
          ) : (
            <>
              <p>• {t('setup.buyDevelopments', { count: variant.endGameConditions.developmentCount })}</p>
              {variant.endGameConditions.allMonumentsBuilt && (
                <p>• {t('setup.orBuildAllMonuments')}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Règles spécifiques */}
      {(playerCount === 1 || variantId === 'late_bronze_age') && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-amber-700 mb-2">📜 {t('setup.specificRules')}</h3>
          <div className="bg-blue-50 rounded p-3 space-y-2 text-sm">
            {playerCount === 1 && (
              <p>• ☠️ {variant.soloSkullsLocked ? t('setup.skullsCannotBeRerolled') : t('setup.skullsCanBeRerolled')}</p>
            )}
            {variantId === 'late_bronze_age' && (
              <>
                <div className="space-y-1.5">
                  <p>• <span className="font-semibold">{t('developments.preservation')}</span> : {t('developmentEffects.preservation')}</p>
                  <p>• <span className="font-semibold">{t('developments.smithing')}</span> : {t('developmentEffects.smithing')}</p>
                  <p>• <span className="font-semibold">{t('developments.shipping')}</span> : {t('developmentEffects.shipping')}</p>
                  <p>• <span className="font-semibold">{t('developments.commerce')}</span> : {t('developmentEffects.commerce')}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Monuments disponibles - Accordéon */}
      <div className="mb-6">
        <button
          onClick={() => setMonumentsOpen(!monumentsOpen)}
          className="w-full flex items-center justify-between text-lg font-semibold text-amber-700 mb-2 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition cursor-pointer"
        >
          <span>🏛️ {t('setup.monuments')} ({availableMonuments.length}/{variant.monuments.length})</span>
          <span className="text-2xl">{monumentsOpen ? '▼' : '▶'}</span>
        </button>
        {monumentsOpen && (
          <div className="space-y-2 mt-2">
            {availableMonuments.map(function(monument) {
              return (
                <div key={monument.id} className="bg-gray-50 rounded p-2 text-sm flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{monument.name}</div>
                    {monument.effect && (
                      <div className="text-xs text-gray-600 mt-1">{monument.effect}</div>
                    )}
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-xs text-gray-600">⚒️ {monument.workers} {t('setup.workersShort')}</div>
                    <div className="text-xs font-bold text-amber-700">
                      {monument.points[0]}/{monument.points[1]} {t('setup.pointsShort')}
                    </div>
                  </div>
                </div>
              );
            })}
            {excludedMonuments.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 italic">
                {excludedMonuments.length} monument(s) non disponible(s) avec {playerCount} {playerCount === 1 ? t('setup.onePlayer') : t('setup.multiplePlayers')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Développements disponibles - Accordéon */}
      <div>
        <button
          onClick={() => setDevelopmentsOpen(!developmentsOpen)}
          className="w-full flex items-center justify-between text-lg font-semibold text-amber-700 mb-2 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition cursor-pointer"
        >
          <span>🔬 {t('setup.developments')} ({variant.developments.length})</span>
          <span className="text-2xl">{developmentsOpen ? '▼' : '▶'}</span>
        </button>
        {developmentsOpen && (
          <div className="space-y-2 mt-2">
            {variant.developments.map(function(dev) {
              return (
                <div key={dev.id} className="bg-gray-50 rounded p-2 text-sm flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{dev.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{dev.effect}</div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-xs text-gray-600">💰 {dev.cost}</div>
                    <div className="text-xs font-bold text-amber-700">{dev.points} {t('setup.pointsShort')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
