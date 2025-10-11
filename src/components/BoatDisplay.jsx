/**
 * Affiche les bateaux construits par un joueur (max 5).
 * @param {number} builtBoats - Nombre de bateaux construits (0-5)
 */
const BoatDisplay = ({ builtBoats = 0 }) => {
  const boats = Array.from({ length: 5 }, (_, i) => i < builtBoats);
  return (
    <div className="flex flex-col items-end ml-6 min-w-[180px]">
      <div className="text-sm font-bold mb-1 text-gray-800">Bateaux</div>
      <div className="flex flex-row gap-1 mb-1 bg-gray-50 border-2 rounded-lg px-4 py-3 border-gray-300">
        {boats.map((idx) => (
          <div
            key={idx}
            className='w-4 h-4 border border-gray-400 rounded bg-white'
        />
        ))}
      </div>
      <div className="text-xs text-right text-gray-700">
        <span>Nécessite la navigation.</span><br />
        <span>Coût : 1 Bois & 1 Tissu par bateau.</span>
      </div>
    </div>
  );
};

export default BoatDisplay;
