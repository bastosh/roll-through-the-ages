import { useTranslation } from 'react-i18next';

export default function Credits({ isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-100 to-orange-200 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-amber-800">{t('credits.title')}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none cursor-pointer"
              title={t('common.close')}
            >
              ×
            </button>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-xl font-bold text-amber-700 mb-2">{t('credits.originalGame')}</h3>
              <p className="mb-2">
                <strong>Roll Through the Ages: The Bronze Age</strong>
              </p>
              <p className="mb-1">{t('credits.designedBy')} <strong>Matt Leacock</strong></p>
              <p className="mb-1">{t('credits.publishedBy')} <strong>Gryphon Games</strong> (2008)</p>
              <p className="text-sm">
                {t('credits.description')}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-amber-700 mb-2">{t('credits.variants')}</h3>

              <div className="mb-4">
                <p className="mb-2">
                  <strong>Roll Through the Ages: The Late Bronze Age</strong>
                </p>
                <p className="mb-1">{t('credits.designedBy')} <strong>Matt Leacock</strong></p>
                <p className="mb-1">{t('credits.publishedBy')} <strong>Pegasus Spiele</strong> (2009)</p>
                <p className="text-sm">
                  {t('credits.lateBronzeAge')}
                </p>
              </div>

              <div className="mb-4">
                <p className="mb-2">
                  <strong>Roll Through the Ages: The Iron Age</strong>
                </p>
                <p className="mb-1">{t('credits.designedBy')} <strong>Wei-Hwa Huang</strong></p>
                <p className="mb-1">{t('credits.publishedBy')} <strong>Gryphon Games</strong> (2013)</p>
                <p className="text-sm">
                  {t('credits.ironAge')}
                </p>
              </div>

              <div>
                <p className="mb-2">
                  <strong>Roll Through the Ages: The Bronze Age 2024</strong>
                </p>
                <p className="text-sm">
                  {t('credits.bronzeAge2024')}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-amber-700 mb-2">{t('credits.digitalImplementation')}</h3>
              <p className="text-sm mb-2">
                {t('credits.digitalDescription')}
              </p>
              <p className="text-sm">
                {t('credits.disclaimer')}
              </p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                {t('credits.moreInfo')}
              </p>
              <a
                href="https://boardgamegeek.com/boardgame/37380/roll-through-the-ages-the-bronze-age"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium underline"
              >
                {t('credits.bggLink')}
                <span className="text-xs">↗</span>
              </a>
            </section>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
