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
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 h-full overflow-y-auto transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-amber-800 dark:text-amber-400">📜 {t('setup.rulesTitle', { variant: variant.displayName })}</h2>

      {/* Conditions de victoire */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-500 mb-2">🏆 {t('setup.victoryConditions')}</h3>
        <div className="bg-amber-50 dark:bg-dark-elevated rounded p-3 space-y-1 text-sm dark:text-dark-text">
          {isSoloMode ? (
            <p>{t('setup.playNTurns', { turns: variant.soloMaxRounds })}</p>
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
      {((playerCount === 1 && variantId === 'bronze_age') || variantId === 'late_bronze_age' || variantId === 'ancient_empires' || variantId === 'ancient_empires_beri' || variantId === 'ancient_empires_beri_revised') && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-500 mb-2">📜 {t('setup.specificRules')}</h3>
          <div className="bg-blue-50 dark:bg-dark-elevated rounded p-3 space-y-2 text-sm dark:text-dark-text">
            {playerCount === 1 && variantId === 'bronze_age' && (
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
            {(variantId === 'ancient_empires' || variantId === 'ancient_empires_beri' || variantId === 'ancient_empires_beri_revised') && (
              <>
                <div className="space-y-1.5">
                  <p>• <span className="font-semibold">{t('setup.metropolis')}</span> : {t('setup.metropolisRule')}</p>
                  <p>• <span className="font-semibold">{t('setup.productionBuildings')}</span> : {t('setup.productionBuildingsRule')}</p>
                  <p>• <span className="font-semibold">{t('setup.cultures')}</span> : {t('setup.culturesRule')}</p>
                  <div className="ml-4 space-y-1 text-xs">
                    <p>- <span className="font-semibold">{t('cultures.celtic')}</span> : {t('setup.cultureBonus', { first: 8, second: 4 })}</p>
                    <p>- <span className="font-semibold">{t('cultures.babylonian')}</span> : {t('setup.cultureBonus', { first: 6, second: 3 })}</p>
                    <p>- <span className="font-semibold">{t('cultures.greek')}</span> : {t('setup.cultureBonus', { first: 4, second: 2 })}</p>
                    <p>- <span className="font-semibold">{t('cultures.chinese')}</span> : {t('setup.cultureBonus', { first: 4, second: 2 })}</p>
                    <p>- <span className="font-semibold">{t('cultures.egyptian')}</span> : {t('setup.cultureBonus', { first: 2, second: 1 })}</p>
                  </div>
                  {(function() {
                    const economyDev = variant.developments.find(d => d.id === 'economy');
                    const empireDev = variant.developments.find(d => d.id === 'ancientEmpire');
                    return (
                      <>
                        {economyDev && <p>• <span className="font-semibold">{economyDev.name}</span> : {economyDev.effect}</p>}
                        {empireDev && <p>• <span className="font-semibold">{empireDev.name}</span> : {empireDev.effect}</p>}
                      </>
                    );
                  })()}
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
          className="w-full flex items-center justify-between text-lg font-semibold text-amber-700 dark:text-amber-500 mb-2 p-3 bg-amber-50 dark:bg-dark-elevated rounded-lg hover:bg-amber-100 dark:hover:bg-dark-border transition cursor-pointer"
        >
          <span>🏛️ {t('setup.monuments')} ({availableMonuments.length}/{variant.monuments.length})</span>
          <span className="text-2xl">{monumentsOpen ? '▼' : '▶'}</span>
        </button>
        {monumentsOpen && (
          <div className="space-y-2 mt-2">
            {availableMonuments.map(function(monument) {
              return (
                <div key={monument.id} className="bg-gray-50 dark:bg-dark-elevated rounded p-2 text-sm flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-dark-text">{monument.name}</div>
                    {monument.effect && (
                      <div className="text-xs text-gray-600 dark:text-dark-text-muted mt-1">{monument.effect}</div>
                    )}
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-xs text-gray-600 dark:text-dark-text-muted">⚒️ {monument.workers} {t('setup.workersShort')}</div>
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-500">
                      {monument.points[0]}/{monument.points[1]} {t('setup.pointsShort')}
                    </div>
                  </div>
                </div>
              );
            })}
            {excludedMonuments.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-muted italic">
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
          className="w-full flex items-center justify-between text-lg font-semibold text-amber-700 dark:text-amber-500 mb-2 p-3 bg-amber-50 dark:bg-dark-elevated rounded-lg hover:bg-amber-100 dark:hover:bg-dark-border transition cursor-pointer"
        >
          <span>🔬 {t('setup.developments')} ({variant.developments.length})</span>
          <span className="text-2xl">{developmentsOpen ? '▼' : '▶'}</span>
        </button>
        {developmentsOpen && (
          <div className="space-y-2 mt-2">
            {variant.developments.map(function(dev) {
              return (
                <div key={dev.id} className="bg-gray-50 dark:bg-dark-elevated rounded p-2 text-sm flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-dark-text">{dev.name}</div>
                    <div className="text-xs text-gray-600 dark:text-dark-text-muted mt-1">{dev.effect}</div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-xs text-gray-600 dark:text-dark-text-muted">💰 {dev.cost}</div>
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-500">{dev.points} {t('setup.pointsShort')}</div>
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
