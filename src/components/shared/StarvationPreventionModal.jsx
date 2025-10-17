import { useTranslation } from 'react-i18next';

export default function StarvationPreventionModal({ show, starvationPoints, monumentName, onUseMonument, onDecline }) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full p-6 transition-colors">
        <h2 className="text-xl font-bold mb-4 text-amber-900 dark:text-amber-200 transition-colors">
          {t('starvationPrevention.title', {
            defaultValue: 'Utiliser le pouvoir de {{monument}} ?',
            monument: monumentName
          })}
        </h2>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3 transition-colors">
            {t('starvationPrevention.message', {
              defaultValue: 'Vous allez subir {{points}} point(s) de Catastrophe dus à la famine.',
              points: starvationPoints
            })}
          </p>
          <p className="text-amber-700 dark:text-amber-300 font-semibold transition-colors">
            {t('starvationPrevention.question', {
              defaultValue: 'Voulez-vous utiliser le pouvoir de {{monument}} pour les ignorer ?',
              monument: monumentName
            })}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic transition-colors">
            {t('starvationPrevention.warning', '(Ce pouvoir ne peut être utilisé qu\'une seule fois dans la partie)')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onUseMonument}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
          >
            {t('starvationPrevention.use', {
              defaultValue: 'Utiliser {{monument}}',
              monument: monumentName
            })}
          </button>
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            {t('starvationPrevention.decline', 'Subir la catastrophe')}
          </button>
        </div>
      </div>
    </div>
  );
}
