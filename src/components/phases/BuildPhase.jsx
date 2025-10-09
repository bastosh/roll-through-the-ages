export default function BuildPhase({
  currentPlayer,
  pendingWorkers,
  onReset,
  onSkip,
  stoneToTradeForWorkers,
  onTradeStone,
  onResetStone
}) {
  const hasWorkersRemaining = pendingWorkers > 0;
  const hasEngineering = currentPlayer.developments.indexOf('engineering') !== -1;
  const totalStoneAvailable = currentPlayer.goodsPositions.stone + stoneToTradeForWorkers;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-amber-800">Construire</h3>

      {hasEngineering && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-4">
          <div className="text-center mb-3">
            <div className="text-sm font-bold text-blue-700 mb-2">🏗️ Ingénierie</div>
            <div className="text-xs text-gray-600 mb-2">
              Échangez de la pierre contre 3 ouvriers/unité
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-sm">
                Pierre: <span className="font-bold">{totalStoneAvailable}</span>
              </div>
              <input
                type="number"
                min="0"
                max={totalStoneAvailable}
                value={stoneToTradeForWorkers}
                onChange={(e) => onTradeStone(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border-2 border-blue-400 rounded text-center font-bold"
              />
              <div className="text-sm">
                → <span className="font-bold text-purple-600">{stoneToTradeForWorkers * 3} ⚒️</span>
              </div>
            </div>
            {stoneToTradeForWorkers > 0 && (
              <button
                onClick={onResetStone}
                className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 cursor-pointer"
              >
                Annuler l'échange
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-center mb-6">
        Ouvriers disponibles: <span className="font-bold text-2xl">{pendingWorkers}</span>
        <span className="text-sm text-gray-500 block mt-1">
          Cliquez sur les cités et monuments dans le panneau de gauche
        </span>
      </p>

      {hasWorkersRemaining && (
        <p className="text-center mb-4 text-amber-600 font-semibold">
          ⚠️ Vous devez utiliser tous vos ouvriers
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onReset}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 cursor-pointer"
        >
          Annuler toutes les sélections
        </button>

        <button
          onClick={onSkip}
          disabled={hasWorkersRemaining}
          className={`w-full py-3 rounded-lg font-bold ${
            hasWorkersRemaining
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer'
          }`}
        >
          Terminer la construction
        </button>
      </div>
    </div>
  );
}
