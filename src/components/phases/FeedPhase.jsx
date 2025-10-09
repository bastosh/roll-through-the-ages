export default function FeedPhase({ currentPlayer, citiesToFeed, onContinue }) {
  const foodAvailable = currentPlayer.food;
  const foodNeeded = citiesToFeed;
  const foodShortage = Math.max(0, foodNeeded - foodAvailable);
  const foodRemaining = Math.max(0, foodAvailable - foodNeeded);
  const hasFamine = foodShortage > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Titre en haut à gauche */}
      <h3 className="text-xl font-bold mb-4 text-amber-800">Nourrir les cités</h3>

      {/* Contenu principal centré */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-amber-50 rounded-lg p-6">
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-5xl mb-2">🌾</div>
              <div className="text-sm text-gray-600">Nourriture disponible</div>
              <div className="text-3xl font-bold text-amber-700">{foodAvailable}</div>
            </div>

            <div className="flex items-center text-3xl text-gray-400">→</div>

            <div className="text-center">
              <div className="text-5xl mb-2">🏛️</div>
              <div className="text-sm text-gray-600">Cités à nourrir</div>
              <div className="text-3xl font-bold text-gray-700">{foodNeeded}</div>
            </div>
          </div>

          <div className={`text-center p-4 rounded-lg ${hasFamine ? 'bg-red-100 border-2 border-red-400' : 'bg-green-100 border-2 border-green-400'}`}>
            {hasFamine ? (
              <>
                <div className="text-4xl mb-2">⚠️</div>
                <div className="text-red-700 font-bold text-xl mb-2">Famine !</div>
                <div className="text-red-600 font-semibold">
                  Vous perdrez {foodShortage} point{foodShortage > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Nourriture restante: 0
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">✅</div>
                <div className="text-green-700 font-bold text-xl mb-2">Cités nourries avec succès</div>
                <div className="text-green-600 font-semibold">
                  Nourriture restante: {foodRemaining}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bouton valider h-24 en bas à droite */}
      <div className="mt-auto">
        <div className="grid grid-cols-2 gap-4">
          <div></div>
          <button
            onClick={onContinue}
            className="h-16 rounded-lg font-bold text-xl text-white transition flex items-center justify-center bg-green-600 hover:bg-green-700 cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
