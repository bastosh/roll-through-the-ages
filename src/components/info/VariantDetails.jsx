import { useState } from 'react';
import { getVariantById } from '../../constants/variants';

export default function VariantDetails({ variantId, playerCount, isSoloMode }) {
  const variant = getVariantById(variantId);
  const [monumentsOpen, setMonumentsOpen] = useState(false);
  const [developmentsOpen, setDevelopmentsOpen] = useState(false);

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
            <p>Jouez 10 tours et maximisez votre score</p>
          ) : playerCount === 1 ? (
            <p>Aucune condition de fin, jouez librement</p>
          ) : (
            <>
              <p>• Achetez {variant.endGameConditions.developmentCount} développements</p>
              {variant.endGameConditions.allMonumentsBuilt && (
                <p>• Ou construisez tous les monuments collectivement</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Règles spécifiques */}
      {(playerCount === 1 || variantId === 'late_bronze_age') && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-amber-700 mb-2">📜 Règles spécifiques</h3>
          <div className="bg-blue-50 rounded p-3 space-y-2 text-sm">
            {playerCount === 1 && (
              <p>• {variant.soloSkullsLocked ? '☠️ Les crânes ne peuvent pas être relancés (sauf Leadership)' : '☠️ Les crânes peuvent toujours être relancés'}</p>
            )}
            {variantId === 'late_bronze_age' && (
              <>
                <div className="space-y-1.5">
                  <p>• <span className="font-semibold">Conservation</span> : Avant le lancer de dés, dépensez 1 Poterie pour doubler votre nourriture</p>
                  <p>• <span className="font-semibold">Forge</span> : Invasion: -4 pts aux adversaires. Dépensez des Lances pour -2 pts/lance</p>
                  <p>• <span className="font-semibold">Navigation</span> : Construisez des navires (1 Bois + 1 Tissu). Échangez des ressources</p>
                  <p>• <span className="font-semibold">Commerce</span> : + 1 point par ressource en fin de partie</p>
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
          <span>🏛️ Monuments ({availableMonuments.length}/{variant.monuments.length})</span>
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
                    <div className="text-xs text-gray-600">⚒️ {monument.workers}</div>
                    <div className="text-xs font-bold text-amber-700">
                      {monument.points[0]}/{monument.points[1]} pts
                    </div>
                  </div>
                </div>
              );
            })}
            {excludedMonuments.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 italic">
                {excludedMonuments.length} monument(s) non disponible(s) avec {playerCount} joueur(s)
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
          <span>🔬 Développements ({variant.developments.length})</span>
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
                    <div className="text-xs font-bold text-amber-700">{dev.points} pts</div>
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
