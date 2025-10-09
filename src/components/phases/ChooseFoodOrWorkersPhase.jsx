export default function ChooseFoodOrWorkersPhase({
  pendingFoodOrWorkers,
  currentPlayer,
  onChoose,
  foodSelected,
  setFoodSelected,
  pendingWorkers
}) {
  const hasAgriculture = currentPlayer.developments.indexOf('agriculture') !== -1;
  const hasMasonry = currentPlayer.developments.indexOf('masonry') !== -1;

  // Chaque dé donne 2 de base
  const totalFood = foodSelected * 2 + (hasAgriculture ? foodSelected : 0);
  const totalWorkers = (pendingFoodOrWorkers - foodSelected) * 2 + (hasMasonry ? (pendingFoodOrWorkers - foodSelected) : 0);

  // Calculate cities to feed
  let citiesToFeed = 3; // Base 3 cities
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) citiesToFeed++;
  }

  const currentFood = currentPlayer.food;
  const futureFood = Math.min(currentFood + totalFood, 15);
  const foodAfterFeeding = Math.max(0, futureFood - citiesToFeed);
  const foodShortage = Math.max(0, citiesToFeed - futureFood);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Choisir nourriture ou ouvriers</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold">⚒️ Ouvriers</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Dés ouvriers:</span>
              <span className="font-bold">{pendingWorkers}</span>
            </div>
            <div className="flex justify-between">
              <span>Dés à répartir:</span>
              <span className="font-bold">+{totalWorkers}</span>
            </div>
            <div className="flex justify-between border-t border-purple-200 pt-1 mt-1 font-bold text-purple-700">
              <span>Total:</span>
              <span className="text-lg">{pendingWorkers + totalWorkers}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold">🌾 Nourriture</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Actuelle:</span>
              <span className="font-bold">{currentFood}</span>
            </div>
            <div className="flex justify-between">
              <span>Après récolte:</span>
              <span className="font-bold">{futureFood}</span>
            </div>
            <div className="flex justify-between">
              <span>Cités à nourrir:</span>
              <span className="font-bold">-{citiesToFeed}</span>
            </div>
            <div className={`flex justify-between border-t border-amber-200 pt-1 mt-1 font-bold ${foodShortage > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <span>Après nourrissage:</span>
              <span className="text-lg">{foodAfterFeeding}</span>
            </div>
            {foodShortage > 0 && (
              <div className="text-center text-red-600 font-semibold text-xs">
                ⚠️ Famine: -{foodShortage} pt(s)
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center mb-6 font-semibold">
        Vous avez {pendingFoodOrWorkers} dé(s) à répartir
        <span className="text-sm text-gray-600 block mt-1">(chaque dé donne 2 ressources de base)</span>
      </p>

      <div className="mb-6">
        <div className="text-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-1">⚒️</div>
              <div className="text-2xl font-bold text-purple-700">{totalWorkers}</div>
              {hasMasonry && (pendingFoodOrWorkers - foodSelected) > 0 && (
                <span className="text-xs text-gray-600">(+Maçonnerie)</span>
              )}
            </div>
            <input
              type="range"
              min="0"
              max={pendingFoodOrWorkers}
              value={foodSelected}
              onChange={(e) => setFoodSelected(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-1">🌾</div>
              <div className="text-2xl font-bold text-amber-700">{totalFood}</div>
              {hasAgriculture && foodSelected > 0 && (
                <span className="text-xs text-gray-600">(+Agriculture)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onChoose(foodSelected)}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 text-lg cursor-pointer"
      >
        Valider
      </button>
    </div>
  );
}
