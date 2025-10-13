import { useTranslation } from 'react-i18next';

export default function DisastersDisplay({ disasters }) {
  const { t } = useTranslation();

  if (disasters === 0) return null;

  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800 dark:text-dark-text">{t('disasters.catastrophes')}</h3>
      <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 rounded-lg p-2 transition-colors">
        <div className="flex gap-0.5 flex-wrap mb-1">
          {Array(disasters).fill(0).map(function (_, i) {
            return (
              <div
                key={i}
                className="w-5 h-5 bg-red-600 dark:bg-red-700 border-2 border-red-700 dark:border-red-800 rounded flex items-center justify-center text-white text-xs"
              >
                ☠
              </div>
            );
          })}
        </div>
        <div className="text-center text-red-700 dark:text-red-400 font-bold text-sm">{t('disasters.disasterPoints', { count: disasters })}</div>
      </div>
    </div>
  );
}
