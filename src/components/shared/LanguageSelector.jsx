import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  function changeLanguage(lng) {
    i18n.changeLanguage(lng);
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-2 flex gap-2 z-50 transition-colors">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-3 py-1 rounded transition cursor-pointer ${
          i18n.language === 'fr'
            ? 'bg-amber-600 dark:bg-amber-dark-700 text-white font-bold'
            : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
        }`}
        title="Français"
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded transition cursor-pointer ${
          i18n.language === 'en'
            ? 'bg-amber-600 dark:bg-amber-dark-700 text-white font-bold'
            : 'bg-gray-200 dark:bg-dark-elevated text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
