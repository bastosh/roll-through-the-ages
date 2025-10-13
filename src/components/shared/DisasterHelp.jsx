import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DisasterHelp({ currentPlayer }) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [hasProtection, setHasProtection] = useState(false);

  const hasIrrigation = currentPlayer.developments.indexOf('irrigation') !== -1;
  const hasMedicine = currentPlayer.developments.indexOf('medicine') !== -1;
  const hasReligion = currentPlayer.developments.indexOf('religion') !== -1;
  const hasSmithing = currentPlayer.developments.indexOf('smithing') !== -1;

  // Find Great Wall monument
  let hasGreatWall = false;
  for (let i = 0; i < currentPlayer.monuments.length; i++) {
    if (currentPlayer.monuments[i].id === 'great_wall' && currentPlayer.monuments[i].completed) {
      hasGreatWall = true;
      break;
    }
  }

  const disasters = [
    {
      skulls: 2,
      name: t('disasters.drought'),
      effect: t('disasters.droughtEffect'),
      protected: hasIrrigation,
      protectionName: t('disasters.protectionIrrigation')
    },
    {
      skulls: 3,
      name: t('disasters.plague'),
      effect: t('disasters.plagueEffect'),
      protected: hasMedicine,
      protectionName: t('disasters.protectionMedicine')
    },
    {
      skulls: 4,
      name: t('disasters.invasion'),
      effect: hasSmithing
        ? t('disasters.invasionSmithingEffect')
        : t('disasters.invasionEffect'),
      protected: hasGreatWall || hasSmithing,
      protectionName: hasSmithing
        ? t('disasters.protectionSmithy')
        : t('disasters.protectionGreatWall')
    },
    {
      skulls: 5,
      name: t('disasters.revolt'),
      effect: t('disasters.revoltEffect'),
      protected: hasReligion,
      protectionName: t('disasters.protectionReligion')
    }
  ];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed h-12 w-12 bottom-4 right-4 bg-gray-300 rounded-full shadow-lg hover:bg-gray-400 transition cursor-pointer text-2xl"
        title={t('disasters.helpTitle')}
      >
        ?
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-800">
                ☠️ {t('disasters.catastrophes')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={hasProtection}
                  onChange={(e) => setHasProtection(e.target.checked)}
                  className="cursor-pointer"
                />
                {t('disasters.showOnlyUnprotected')}
              </label>
            </div>

            <div className="space-y-3">
              {disasters.map(function(disaster) {
                if (hasProtection && disaster.protected) return null;

                return (
                  <div
                    key={disaster.skulls}
                    className={'rounded-lg p-4 border-2 ' + (
                      disaster.protected
                        ? 'bg-green-50 border-green-400'
                        : 'bg-red-50 border-red-400'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">
                            {'☠️'.repeat(disaster.skulls)}{disaster.skulls === 5 ? '+' : ''}
                          </span>
                          <span className="font-bold text-gray-800">
                            {disaster.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {disaster.effect}
                        </p>
                        {disaster.protected && (
                          <div className="mt-2 text-xs font-semibold text-green-700 bg-green-100 inline-block px-2 py-1 rounded">
                            ✓ {t('disasters.protectedBy', { protection: disaster.protectionName })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-1">ℹ️ {t('disasters.importantRule')}</p>
              <p>
                {t('disasters.ruleDescription')}
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
