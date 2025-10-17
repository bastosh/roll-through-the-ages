import { useTranslation } from 'react-i18next';
import { GOODS_NAMES } from '../../constants/gameData';

/**
 * Panneau pour gérer l'invasion de la Forge (dépenser des Lances)
 */
export default function SmithingInvasionPanel({
  currentPlayer,
  allPlayers,
  currentPlayerIndex,
  spearheadsToSpend,
  onIncrementSpearheads,
  onDecrementSpearheads,
  onConfirm,
  onSkip,
  isSoloMode = false
}) {
  const { t } = useTranslation();
  const maxSpearheads = currentPlayer.goodsPositions.spearheads || 0;
  const baseDamage = 4;
  const bonusDamage = spearheadsToSpend * 2;
  const totalDamage = baseDamage + bonusDamage;

  // Calculer quels adversaires seront affectés
  const affectedOpponents = [];
  const protectedOpponents = [];

  for (let i = 0; i < allPlayers.length; i++) {
    if (i !== currentPlayerIndex) {
      let hasGreatWall = false;
      for (let j = 0; j < allPlayers[i].monuments.length; j++) {
        if (allPlayers[i].monuments[j].id === 'great_wall' && allPlayers[i].monuments[j].completed) {
          hasGreatWall = true;
          break;
        }
      }

      if (hasGreatWall) {
        protectedOpponents.push(allPlayers[i].name);
      } else {
        affectedOpponents.push(allPlayers[i].name);
      }
    }
  }

  return (
    <div className={`bg-gradient-to-r ${isSoloMode ? 'from-green-50 to-blue-50 border-blue-400' : 'from-orange-50 to-red-50 border-orange-400'} border-2 rounded-lg p-4 mb-3`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-xl font-bold ${isSoloMode ? 'text-blue-900' : 'text-orange-900'}`}>
          {isSoloMode ? '🏆 Bonus Forge' : '⚔️ Invasion (Forge)'}
        </h3>
        <div className="text-sm text-gray-700 bg-white px-3 py-1 rounded-full border border-orange-200">
          <span className="font-semibold text-orange-600">{maxSpearheads}</span> {t(GOODS_NAMES.spearheads)} disponible{maxSpearheads > 1 ? 's' : ''}
        </div>
      </div>

      {/* Explication */}
      <div className="bg-white rounded-lg p-3 mb-3 text-sm text-gray-700">
        {isSoloMode ? (
          <>
            <p className="mb-2">
              Grâce à votre <strong>Forge</strong>, l'invasion vous rapporte des points bonus !
            </p>
            <p>
              Vous pouvez dépenser des <strong>{t(GOODS_NAMES.spearheads)}</strong> pour augmenter le bonus :
            </p>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>Bonus de base : <strong className="text-green-600">+4 points</strong></li>
              <li>Bonus par Lance : <strong className="text-green-600">+2 points</strong></li>
            </ul>
          </>
        ) : (
          <>
            <p className="mb-2">
              Grâce à votre <strong>Forge</strong>, vous retournez l'invasion contre vos adversaires !
            </p>
            <p>
              Vous pouvez dépenser des <strong>{t(GOODS_NAMES.spearheads)}</strong> pour augmenter les dégâts infligés :
            </p>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>Dégâts de base : <strong className="text-red-600">4 points</strong></li>
              <li>Bonus par Lance : <strong className="text-red-600">+2 points</strong></li>
            </ul>
          </>
        )}
      </div>

      {/* Sélecteur de Lances */}
      {maxSpearheads > 0 && (
        <div className="bg-white rounded-lg p-3 mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre de {t(GOODS_NAMES.spearheads)} à dépenser :
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={onDecrementSpearheads}
              disabled={spearheadsToSpend === 0}
              className={`w-10 h-10 rounded-lg font-bold text-xl ${
                spearheadsToSpend === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 transition cursor-pointer'
              }`}
            >
              −
            </button>
            <div className="flex-1 text-center">
              <div className="text-3xl font-bold text-orange-600">{spearheadsToSpend}</div>
              <div className="text-xs text-gray-500">Lance{spearheadsToSpend > 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={() => onIncrementSpearheads(maxSpearheads)}
              disabled={spearheadsToSpend >= maxSpearheads}
              className={`w-10 h-10 rounded-lg font-bold text-xl ${
                spearheadsToSpend >= maxSpearheads
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 transition cursor-pointer'
              }`}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Résumé des dégâts/bonus */}
      {isSoloMode ? (
        <div className="bg-green-100 rounded-lg p-3 mb-3 border border-green-300">
          <div className="text-center">
            <div className="text-sm text-gray-700 mb-1">Bonus total :</div>
            <div className="text-4xl font-bold text-green-600">+{totalDamage}</div>
            <div className="text-xs text-gray-600">
              ({baseDamage} base {bonusDamage > 0 ? `+ ${bonusDamage} bonus` : ''})
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-100 rounded-lg p-3 mb-3 border border-red-300">
          <div className="text-center mb-2">
            <div className="text-sm text-gray-700 mb-1">Dégâts totaux infligés :</div>
            <div className="text-4xl font-bold text-red-600">{totalDamage}</div>
            <div className="text-xs text-gray-600">
              ({baseDamage} base {bonusDamage > 0 ? `+ ${bonusDamage} bonus` : ''})
            </div>
          </div>

          {affectedOpponents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="text-xs font-semibold text-gray-700 mb-1">Adversaires touchés :</div>
              <div className="flex flex-wrap gap-1">
                {affectedOpponents.map(function(name) {
                  return (
                    <span key={name} className="bg-white px-2 py-1 rounded text-xs font-medium text-red-700 border border-red-300">
                      {name} (-{totalDamage} pts)
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {protectedOpponents.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-semibold text-gray-700 mb-1">Adversaires protégés (Grande Muraille) :</div>
              <div className="flex flex-wrap gap-1">
                {protectedOpponents.map(function(name) {
                  return (
                    <span key={name} className="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-700 border border-green-300">
                      🛡️ {name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2">
        {maxSpearheads > 0 && spearheadsToSpend > 0 ? (
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg ${isSoloMode ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white transition shadow-md hover:shadow-lg cursor-pointer`}
          >
            {isSoloMode
              ? `Obtenir +${totalDamage} points (${spearheadsToSpend} Lance${spearheadsToSpend > 1 ? 's' : ''})`
              : `Dépenser ${spearheadsToSpend} Lance${spearheadsToSpend > 1 ? 's' : ''} (${totalDamage} pts de dégâts)`
            }
          </button>
        ) : (
          <button
            onClick={onSkip}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg ${isSoloMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'} text-white transition shadow-md hover:shadow-lg cursor-pointer`}
          >
            {isSoloMode
              ? `Obtenir +${baseDamage} points (sans bonus)`
              : `Envahir sans bonus (${baseDamage} pts de dégâts)`
            }
          </button>
        )}
      </div>
    </div>
  );
}
