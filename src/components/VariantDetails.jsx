import { getVariantById } from '../constants/variants';

export default function VariantDetails({ variantId, playerCount, isSoloMode }) {
  const variant = getVariantById(variantId);

  if (!variant) return null;

  // Filtrer les monuments disponibles selon le nombre de joueurs
  const excludedMonuments = variant.monumentRestrictions[playerCount] || [];
  const availableMonuments = variant.monuments.filter(m => excludedMonuments.indexOf(m.id) === -1);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-amber-800">📜 Règles - {variant.displayName}</h2>

      {/* Conditions de victoire */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-amber-700 mb-2">🏆 Conditions de victoire</h3>
        <div className="bg-amber-50 rounded p-3 space-y-1 text-sm">
          {isSoloMode ? (
            <p>• Mode solo : Jouez 10 tours et maximisez votre score</p>
          ) : (
            <>
              <p>• Achetez {variant.endGameConditions.developmentCount} développements</p>
              {variant.endGameConditions.allMonumentsBuilt && (
                <p>• Ou construisez tous les monuments collectivement</p>
              )}
              <p>• Le joueur avec le plus de points gagne</p>
            </>
          )}
        </div>
      </div>

      {/* Règles spécifiques */}
      {isSoloMode && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-amber-700 mb-2">📜 Règles spécifiques</h3>
          <div className="bg-blue-50 rounded p-3 space-y-1 text-sm">
            <p>• {variant.soloSkullsLocked ? '☠️ Les crânes sont verrouillés' : '☠️ Les crânes peuvent être relancés'}</p>
            <p>• Durée : 10 tours maximum</p>
          </div>
        </div>
      )}

      {/* Monuments disponibles */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-amber-700 mb-2">
          🏛️ Monuments ({availableMonuments.length}/{variant.monuments.length})
        </h3>
        <div className="space-y-2">
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
                  <div className="text-xs text-gray-600">⚒️ {monument.workers}</div>
                  <div className="text-xs font-bold text-amber-700">
                    {monument.points[0]}/{monument.points[1]} pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {excludedMonuments.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 italic">
            {excludedMonuments.length} monument(s) non disponible(s) avec {playerCount} joueur(s)
          </div>
        )}
      </div>

      {/* Développements disponibles */}
      <div>
        <h3 className="text-lg font-semibold text-amber-700 mb-2">
          🔬 Développements ({variant.developments.length})
        </h3>
        <div className="space-y-2">
          {variant.developments.map(function(dev) {
            return (
              <div key={dev.id} className="bg-gray-50 rounded p-2 text-sm flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{dev.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{dev.effect}</div>
                </div>
                <div className="text-right ml-2">
                  <div className="text-xs text-gray-600">💰 {dev.cost}</div>
                  <div className="text-xs font-bold text-amber-700">{dev.points} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
