import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleDarkMode}
      className="bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text rounded-lg shadow-lg p-3 hover:bg-gray-100 dark:hover:bg-dark-elevated transition cursor-pointer z-10"
      title={isDarkMode ? t('common.lightMode') : t('common.darkMode')}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}
