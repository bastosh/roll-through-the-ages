import { useState } from 'react';
import { GOODS_TYPES, GOODS_NAMES, GOODS_COLORS } from '../constants/gameData';

/**
 * Panneau pour échanger des ressources pendant la phase de commerce
 */
export default function TradeResourcesPanel({
  player,
  tradesUsed,
  onTrade,
  onReset,
  onSkip
}) {
  const [fromType, setFromType] = useState('');
  const [toType, setToType] = useState('');

  const maxTrades = player.builtBoats || 0;
  const remainingTrades = maxTrades - tradesUsed;

  const handleTrade = () => {
    if (fromType && toType && fromType !== toType) {
      const success = onTrade(fromType, toType);
      if (success) {
        // Réinitialiser la sélection après un échange réussi
        setFromType('');
        setToType('');
      }
    }
  };

  const canTrade = fromType && toType && fromType !== toType && remainingTrades > 0 && player.goodsPositions[fromType] > 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-blue-900">
          Phase de Commerce
        </h3>
        <div className="text-sm text-gray-700 bg-white px-3 py-1 rounded-full border border-blue-200">
          <span className="font-semibold text-blue-600">{remainingTrades}/{maxTrades}</span> échange{remainingTrades > 1 ? 's' : ''} disponible{remainingTrades > 1 ? 's' : ''}
        </div>
      </div>

      {/* Sélecteurs de ressources en ligne */}
      <div className="flex items-center gap-3 mb-3">
        {/* Échanger */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Échanger :</label>
          <div className="flex gap-1">
            {GOODS_TYPES.map((type) => {
              const count = player.goodsPositions[type] || 0;
              const isDisabled = count === 0;
              const isSelected = fromType === type;

              return (
                <button
                  key={type}
                  className={`flex-1 px-2 py-2 rounded border-2 transition-all ${
                    isSelected
                      ? `border-blue-500 ${GOODS_COLORS[type]} ring-2 ring-blue-300`
                      : isDisabled
                      ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-40'
                      : `border-gray-300 hover:border-blue-300 bg-white`
                  }`}
                  onClick={() => !isDisabled && setFromType(type)}
                  disabled={isDisabled}
                  title={GOODS_NAMES[type]}
                >
                  <div className="text-xs font-medium text-center truncate">{GOODS_NAMES[type]}</div>
                  <div className="text-xs text-gray-600 text-center mt-0.5">×{count}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Flèche */}
        <div className="text-2xl text-blue-500 font-bold mt-5">→</div>

        {/* Contre */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Contre :</label>
          <div className="flex gap-1">
            {GOODS_TYPES.map((type) => {
              const count = player.goodsPositions[type] || 0;
              const isDisabled = type === fromType;
              const isSelected = toType === type;

              return (
                <button
                  key={type}
                  className={`flex-1 px-2 py-2 rounded border-2 transition-all ${
                    isSelected
                      ? `border-blue-500 ${GOODS_COLORS[type]} ring-2 ring-blue-300`
                      : isDisabled
                      ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-40'
                      : `border-gray-300 hover:border-blue-300 bg-white`
                  }`}
                  onClick={() => !isDisabled && setToType(type)}
                  disabled={isDisabled}
                  title={GOODS_NAMES[type]}
                >
                  <div className="text-xs font-medium text-center truncate">{GOODS_NAMES[type]}</div>
                  <div className="text-xs text-gray-600 text-center mt-0.5">×{count}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          onClick={handleTrade}
          disabled={!canTrade}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            canTrade
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Échanger
        </button>

        {tradesUsed > 0 && (
          <button
            onClick={onReset}
            className="py-2 px-4 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
          >
            Annuler ({tradesUsed})
          </button>
        )}

        <button
          onClick={onSkip}
          className="py-2 px-4 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
        >
          Terminer
        </button>
      </div>
    </div>
  );
}
