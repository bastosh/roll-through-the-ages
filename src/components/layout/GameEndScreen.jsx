import { getTotalGoodsCount } from '../../utils/gameUtils';

/**
 * Composant pour l'écran de fin de partie avec les scores
 */
export default function GameEndScreen({ players, DEVELOPMENTS, MONUMENTS }) {
  // Calculate score breakdown and resources for each player
  const playersWithDetails = players.map(function(player) {
    let developmentScore = 0;
    for (let j = 0; j < player.developments.length; j++) {
      const devId = player.developments[j];
      for (let k = 0; k < DEVELOPMENTS.length; k++) {
        if (DEVELOPMENTS[k].id === devId) {
          developmentScore += DEVELOPMENTS[k].points;
          break;
        }
      }
    }

    let monumentScore = 0;
    for (let j = 0; j < player.monuments.length; j++) {
      const m = player.monuments[j];
      if (m.completed) {
        for (let k = 0; k < MONUMENTS.length; k++) {
          if (MONUMENTS[k].id === m.id) {
            const monument = MONUMENTS[k];
            monumentScore += m.firstToComplete ? monument.points[0] : monument.points[1];
            break;
          }
        }
      }
    }

    let bonusScore = 0;

    if (player.developments.indexOf('architecture') !== -1) {
      let completedCount = 0;
      for (let j = 0; j < player.monuments.length; j++) {
        if (player.monuments[j].completed) completedCount++;
      }
      let architectureDev = null;
      for (let k = 0; k < DEVELOPMENTS.length; k++) {
        if (DEVELOPMENTS[k].id === 'architecture') {
          architectureDev = DEVELOPMENTS[k];
          break;
        }
      }
      const multiplier = architectureDev && architectureDev.cost >= 60 ? 2 : 1;
      bonusScore += completedCount * multiplier;
    }

    if (player.developments.indexOf('empire') !== -1) {
      let cityCount = 3;
      for (let j = 0; j < player.cities.length; j++) {
        if (player.cities[j].built) cityCount++;
      }
      bonusScore += cityCount;
    }

    if (player.developments.indexOf('commerce') !== -1) {
      const totalGoodsCount = getTotalGoodsCount(player.goodsPositions);
      bonusScore += totalGoodsCount;
    }

    const totalResourcesCount = getTotalGoodsCount(player.goodsPositions) + player.food;

    return {
      player: player,
      developmentScore: developmentScore,
      monumentScore: monumentScore,
      bonusScore: bonusScore,
      disasterScore: player.disasters,
      totalScore: player.score,
      totalResourcesCount: totalResourcesCount
    };
  });

  // Sort by score, then by resources for tie-breaking
  const sortedPlayers = [...playersWithDetails].sort(function(a, b) {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // Tie-break by total resources
    return b.totalResourcesCount - a.totalResourcesCount;
  });

  // Determine winners (handle ties)
  const winnerScore = sortedPlayers[0].totalScore;
  const winnersWithSameScore = sortedPlayers.filter(p => p.totalScore === winnerScore);
  const isTie = winnersWithSameScore.length > 1;

  let winners = [];
  if (isTie) {
    const maxResources = Math.max(...winnersWithSameScore.map(p => p.totalResourcesCount));
    winners = winnersWithSameScore.filter(p => p.totalResourcesCount === maxResources);
  } else {
    winners = [sortedPlayers[0]];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-800">
          🏆 Partie terminée !
        </h1>

        {sortedPlayers.map(function(playerDetail, i) {
          const player = playerDetail.player;
          const isWinner = winners.some(w => w.player.name === player.name);
          const showResources = isTie && winnersWithSameScore.some(w => w.player.name === player.name);

          return (
            <div key={i} className={'mb-4 p-6 rounded-lg ' + (
              isWinner ? 'bg-yellow-100 border-4 border-yellow-400' : 'bg-gray-100'
            )}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold">
                  {isWinner ? '👑 ' : ''}
                  {player.name}
                </h3>
                <div className="text-4xl font-bold text-amber-700">
                  {playerDetail.totalScore} pts
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <table className="w-full text-base">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-700">Développements</td>
                      <td className="py-2 text-right font-semibold text-gray-900">{playerDetail.developmentScore}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-700">Monuments</td>
                      <td className="py-2 text-right font-semibold text-gray-900">+ {playerDetail.monumentScore}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-700">Bonus</td>
                      <td className="py-2 text-right font-semibold text-gray-900">+ {playerDetail.bonusScore}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-700">Catastrophes</td>
                      <td className="py-2 text-right font-semibold text-red-600">- {playerDetail.disasterScore}</td>
                    </tr>
                    <tr className="border-t-2 border-gray-400">
                      <td className="py-2 text-gray-900 font-bold">Total</td>
                      <td className="py-2 text-right font-bold text-amber-700 text-lg">= {playerDetail.totalScore}</td>
                    </tr>
                    {showResources && (
                      <tr className="border-t border-gray-200">
                        <td className="py-2 text-amber-700 font-semibold">Ressources restantes</td>
                        <td className="py-2 text-right font-semibold text-amber-700">{playerDetail.totalResourcesCount}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-amber-700 transition mt-8 cursor-pointer"
        >
          Nouvelle partie
        </button>
      </div>
    </div>
  );
}
