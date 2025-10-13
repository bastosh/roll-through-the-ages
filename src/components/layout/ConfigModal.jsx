import { useTranslation } from 'react-i18next';
import PlayerHistoryList from './PlayerHistoryList';

export default function ConfigModal({
  isOpen,
  onClose,
  onResetGame,
  playerHistory,
  onDeletePlayer,
  onUpdatePlayer
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-800">⚙️ {t('common.configuration')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <button
              onClick={onResetGame}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition cursor-pointer"
            >
              {t('common.resetGameButton')}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              {t('common.resetGameDescription')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-gray-800">{t('common.registeredPlayers')}</h3>
            <PlayerHistoryList
              playerHistory={playerHistory}
              onDeletePlayer={onDeletePlayer}
              onUpdatePlayer={onUpdatePlayer}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
