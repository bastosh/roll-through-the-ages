/**
 * Affiche les bateaux construits par un joueur (max 5).
 * @param {number} builtBoats - Nombre de bateaux construits (0-5)
 * @param {number} pendingBoats - Nombre de bateaux en cours de construction (0-5)
 * @param {boolean} canBuild - Si le joueur peut construire (phase de build)
 * @param {number} maxBoats - Nombre maximum de bateaux constructibles avec les ressources actuelles
 * @param {boolean} hasShipping - Si le joueur a le développement Navigation
 * @param {Function} onBuildBoat - Callback pour construire un bateau
 * @param {Function} onUnbuildBoat - Callback pour annuler la construction d'un bateau
 */
const BoatDisplay = ({
  builtBoats = 0,
  pendingBoats = 0,
  canBuild = false,
  maxBoats = 0,
  hasShipping = false,
  onBuildBoat = null,
  onUnbuildBoat = null
}) => {
  const totalBoats = builtBoats + pendingBoats;
  const boats = Array.from({ length: 5 }, (_, i) => {
    if (i < builtBoats) return 'built';
    if (i < totalBoats) return 'pending';
    return 'empty';
  });

  const handleBoatClick = () => {
    if (!canBuild || !hasShipping) return;

    if (pendingBoats > 0 && onUnbuildBoat) {
      // Si on a des bateaux en construction, cliquer annule la construction
      onUnbuildBoat();
    } else if (maxBoats > 0 && onBuildBoat) {
      // Sinon, si on peut construire, on construit un bateau
      onBuildBoat();
    }
  };

  const canInteract = canBuild && hasShipping && maxBoats > 0;

  return (
    <div className="flex flex-col items-end ml-6 min-w-[180px]">
      <div className="text-sm font-bold mb-1 text-gray-800">Bateaux</div>
      <div
        className={`flex flex-row gap-1 mb-1 bg-gray-50 border-2 rounded-lg px-4 py-3 ${
          canInteract
            ? 'border-amber-400 cursor-pointer hover:bg-amber-50'
            : 'border-gray-300'
        }`}
        onClick={handleBoatClick}
      >
        {boats.map((status, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 border rounded ${
              status === 'built'
                ? 'bg-blue-500 border-blue-700'
                : status === 'pending'
                ? 'bg-amber-300 border-amber-500'
                : 'bg-white border-gray-400'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-right text-gray-700">
        {!hasShipping ? (
          <>
            <span className="text-red-600 font-semibold">Nécessite le développement Navigation.</span><br />
            <span>Coût : 1 Bois & 1 Tissu par bateau.</span>
          </>
        ) : (
          <>
            <span>Coût : 1 Bois & 1 Tissu par bateau.</span>
            {canInteract && (
              <>
                <br />
                <span className="text-amber-600 font-semibold">
                  {pendingBoats > 0
                    ? `Cliquez pour annuler (${pendingBoats} en cours)`
                    : `Cliquez pour construire (${maxBoats} possible${maxBoats > 1 ? 's' : ''})`
                  }
                </span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BoatDisplay;
