import { useTranslation } from 'react-i18next';
import { getTotalGoodsCount } from '../../utils/gameUtils';

/**
 * Composant pour l'écran de fin de partie avec les scores
 */
export default function GameEndScreen({ players, DEVELOPMENTS, MONUMENTS }) {
  const { t } = useTranslation();

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
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 transition-colors">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-800 dark:text-amber-400">
          {t('game.gameOver')}
        </h1>

        {sortedPlayers.map(function(playerDetail, i) {
          const player = playerDetail.player;
          const isWinner = winners.some(w => w.player.name === player.name);
          const showResources = isTie && winnersWithSameScore.some(w => w.player.name === player.name);

          return (
            <div key={i} className={'mb-4 p-6 rounded-lg transition-colors ' + (
              isWinner ? 'bg-yellow-100 dark:bg-yellow-900/30 border-4 border-yellow-400 dark:border-yellow-600' : 'bg-gray-100 dark:bg-dark-elevated'
            )}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold dark:text-dark-text">
                  {isWinner ? '👑 ' : ''}
                  {player.name}
                </h3>
                <div className="text-4xl font-bold text-amber-700 dark:text-amber-500">
                  {playerDetail.totalScore} pts
                </div>
              </div>
              <div className="bg-white dark:bg-dark-surface rounded-lg p-4 transition-colors">
                <table className="w-full text-base">
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                      <td className="py-2 text-gray-700 dark:text-dark-text">{t('gameEnd.developmentsScore')}</td>
                      <td className="py-2 text-right font-semibold text-gray-900 dark:text-dark-text">{playerDetail.developmentScore}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                      <td className="py-2 text-gray-700 dark:text-dark-text">{t('gameEnd.monumentsScore')}</td>
                      <td className="py-2 text-right font-semibold text-gray-900 dark:text-dark-text">+ {playerDetail.monumentScore}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                      <td className="py-2 text-gray-700 dark:text-dark-text">{t('gameEnd.bonusScore')}</td>
                      <td className="py-2 text-right font-semibold text-gray-900 dark:text-dark-text">+ {playerDetail.bonusScore}</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                      <td className="py-2 text-gray-700 dark:text-dark-text">{t('gameEnd.disastersScore')}</td>
                      <td className="py-2 text-right font-semibold text-red-600 dark:text-red-400">- {playerDetail.disasterScore}</td>
                    </tr>
                    <tr className="border-t-2 border-gray-400 dark:border-dark-border">
                      <td className="py-2 text-gray-900 dark:text-dark-text font-bold">{t('gameEnd.totalScore')}</td>
                      <td className="py-2 text-right font-bold text-amber-700 dark:text-amber-500 text-lg">= {playerDetail.totalScore}</td>
                    </tr>
                    {showResources && (
                      <tr className="border-t border-gray-200 dark:border-dark-border">
                        <td className="py-2 text-amber-700 dark:text-amber-500 font-semibold">{t('gameEnd.remainingResources')}</td>
                        <td className="py-2 text-right font-semibold text-amber-700 dark:text-amber-500">{playerDetail.totalResourcesCount}</td>
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
          className="w-full bg-amber-600 dark:bg-amber-dark-700 text-white py-4 rounded-lg font-bold text-xl hover:bg-amber-700 dark:hover:bg-amber-dark-600 transition mt-8 cursor-pointer"
        >
          {t('game.backToHome')}
        </button>
      </div>
    </div>
  );
}
