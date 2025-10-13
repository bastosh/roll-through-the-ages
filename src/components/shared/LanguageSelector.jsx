import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  function changeLanguage(lng) {
    i18n.changeLanguage(lng);
  }

  return (
    <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-3 py-1 rounded transition cursor-pointer ${
          i18n.language === 'fr'
            ? 'bg-amber-600 text-white font-bold'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="Français"
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded transition cursor-pointer ${
          i18n.language === 'en'
            ? 'bg-amber-600 text-white font-bold'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
