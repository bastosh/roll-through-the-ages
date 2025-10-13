export default function Credits({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-100 to-orange-200 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-amber-800">Crédits</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl leading-none cursor-pointer"
              title="Fermer"
            >
              ×
            </button>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-xl font-bold text-amber-700 mb-2">Le jeu original</h3>
              <p className="mb-2">
                <strong>Roll Through the Ages: The Bronze Age</strong>
              </p>
              <p className="mb-1">Conçu par <strong>Matt Leacock</strong></p>
              <p className="mb-1">Publié par <strong>Gryphon Games</strong> (2008)</p>
              <p className="text-sm">
                Un jeu de dés et de civilisation où les joueurs construisent des villes,
                érigent des monuments et développent leur civilisation pour marquer le plus de points de victoire.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-amber-700 mb-2">Variantes</h3>

              <div className="mb-4">
                <p className="mb-2">
                  <strong>Roll Through the Ages: The Late Bronze Age</strong>
                </p>
                <p className="mb-1">Conçu par <strong>Matt Leacock</strong></p>
                <p className="mb-1">Publié par <strong>Pegasus Spiele</strong> (2009)</p>
                <p className="text-sm">
                  Extension officielle print-and-play qui ajoute 4 nouveaux développements
                  (Conservation, Forge, Navigation, Commerce) et modifie 5 développements existants.
                  Introduit la construction de navires pour la conversion de ressources.
                </p>
              </div>

              <div className="mb-4">
                <p className="mb-2">
                  <strong>Roll Through the Ages: The Iron Age</strong>
                </p>
                <p className="mb-1">Conçu par <strong>Wei-Hwa Huang</strong></p>
                <p className="mb-1">Publié par <strong>Gryphon Games</strong> (2013)</p>
                <p className="text-sm">
                  Extension standalone qui étend le jeu avec de nouvelles mécaniques.
                </p>
              </div>

              <div>
                <p className="mb-2">
                  <strong>Roll Through the Ages: The Bronze Age 2024</strong>
                </p>
                <p className="text-sm">
                  Version actualisée avec des ajustements d’équilibrage.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-amber-700 mb-2">Cette implémentation numérique</h3>
              <p className="text-sm mb-2">
                Application web créée avec React, Vite et Tailwind CSS.
              </p>
              <p className="text-sm">
                Cette version numérique est une implémentation non officielle créée à des fins
                éducatives et ludiques. Tous les droits sur le jeu original appartiennent à leurs
                propriétaires respectifs.
              </p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Pour plus d'informations sur le jeu original :
              </p>
              <a
                href="https://boardgamegeek.com/boardgame/37380/roll-through-the-ages-the-bronze-age"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium underline"
              >
                Fiche BoardGameGeek
                <span className="text-xs">↗</span>
              </a>
            </section>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
