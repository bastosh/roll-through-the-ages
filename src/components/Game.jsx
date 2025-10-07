import { useState } from 'react';
import { MONUMENTS, DEVELOPMENTS, GOODS_TYPES, GOODS_VALUES } from '../constants/gameData';
import { addGoods, handleDisasters, getGoodsValue, getTotalGoodsCount } from '../utils/gameUtils';
import DiceRoll from './DiceRoll';
import PlayerBoard from './PlayerBoard';
import BuildPhase from './BuildPhase';
import BuyPhase from './BuyPhase';
import DiscardPhase from './DiscardPhase';

export default function Game({ playerNames }) {
  const [players, setPlayers] = useState(function() {
    return playerNames.map(function(name, i) {
      const monuments = [];
      for (let j = 0; j < MONUMENTS.length; j++) {
        monuments.push({ id: MONUMENTS[j].id, progress: 0, completed: false, firstToComplete: false });
      }

      const cities = [];
      for (let j = 0; j < 4; j++) {
        const cityWorkers = [3, 4, 5, 6];
        cities.push({ built: false, progress: 0, requiredWorkers: cityWorkers[j] });
      }

      return {
        name: name,
        isStartPlayer: i === 0,
        food: 3,
        goodsPositions: { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 },
        cities: cities,
        monuments: monuments,
        developments: [],
        disasters: 0,
        score: 0
      };
    });
  });

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState('roll');
  const [diceResults, setDiceResults] = useState(null);
  const [showDiceRoll, setShowDiceRoll] = useState(true);
  const [pendingWorkers, setPendingWorkers] = useState(0);
  const [pendingFoodOrWorkers, setPendingFoodOrWorkers] = useState(0);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(true);

  const currentPlayer = players[currentPlayerIndex];
  let numDice = 3;
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) numDice++;
  }

  function handleDiceRollComplete(results) {
    setDiceResults(results);
    setShowDiceRoll(false);
    processResults(results);
  }

  function processResults(results) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    let skulls = 0;
    for (let i = 0; i < results.length; i++) {
      skulls += results[i].skulls;
    }

    let foodToAdd = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.type === 'food') {
        foodToAdd += r.value;
        if (player.developments.indexOf('agriculture') !== -1) {
          foodToAdd += 1;
        }
      }
    }
    player.food = Math.min(player.food + foodToAdd, 12);

    let goodsToAdd = 0;
    for (let i = 0; i < results.length; i++) {
      if (results[i].type === 'goods') {
        goodsToAdd += results[i].value;
      }
    }
    addGoods(player, goodsToAdd);

    let workers = 0;
    let foodOrWorkers = 0;
    let coins = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.type === 'workers') {
        workers += r.value;
        if (player.developments.indexOf('masonry') !== -1) {
          workers += 1;
        }
      }
      if (r.type === 'food_or_workers') {
        foodOrWorkers += r.value;
      }
      if (r.type === 'coins') {
        coins += r.value;
        if (player.developments.indexOf('coinage') !== -1) {
          coins += 5;
        }
      }
    }

    setPendingWorkers(workers);
    setPendingFoodOrWorkers(foodOrWorkers);
    setPendingCoins(coins);

    handleDisasters(newPlayers, currentPlayerIndex, skulls);

    setPlayers(newPlayers);

    if (foodOrWorkers > 0) {
      setPhase('choose_food_or_workers');
    } else {
      setPhase('feed');
    }
  }

  function handleUseFoodOrWorkers(asFood) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    if (asFood) {
      let foodToAdd = pendingFoodOrWorkers;
      if (player.developments.indexOf('agriculture') !== -1) {
        foodToAdd += pendingFoodOrWorkers;
      }
      player.food = Math.min(player.food + foodToAdd, 12);
    } else {
      let workersToAdd = pendingFoodOrWorkers;
      if (player.developments.indexOf('masonry') !== -1) {
        workersToAdd += pendingFoodOrWorkers;
      }
      setPendingWorkers(pendingWorkers + workersToAdd);
    }

    setPendingFoodOrWorkers(0);
    setPlayers(newPlayers);
    setPhase('feed');
  }

  function handleFeed() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    let citiesToFeed = 3;
    for (let i = 0; i < player.cities.length; i++) {
      if (player.cities[i].built) citiesToFeed++;
    }

    if (player.food < citiesToFeed) {
      const unfedCities = citiesToFeed - player.food;
      player.disasters += unfedCities;
      player.food = 0;
    } else {
      player.food -= citiesToFeed;
    }

    setPlayers(newPlayers);
    setPhase('build');
  }

  function handleBuildCity(cityIndex) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const city = player.cities[cityIndex];

    if (!city.built) {
      if (city.progress > 0 && pendingWorkers === 0) {
        city.progress--;
        setPendingWorkers(pendingWorkers + 1);
      } else if (pendingWorkers >= 1) {
        city.progress++;
        if (city.progress >= city.requiredWorkers) {
          city.built = true;
        }
        setPendingWorkers(pendingWorkers - 1);
      }
      setPlayers(newPlayers);
    }
  }

  function handleBuildMonument(monumentId) {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    let monument = null;
    for (let i = 0; i < player.monuments.length; i++) {
      if (player.monuments[i].id === monumentId) {
        monument = player.monuments[i];
        break;
      }
    }

    let monumentDef = null;
    for (let i = 0; i < MONUMENTS.length; i++) {
      if (MONUMENTS[i].id === monumentId) {
        monumentDef = MONUMENTS[i];
        break;
      }
    }

    if (monument && !monument.completed) {
      if (monument.progress > 0 && pendingWorkers === 0) {
        monument.progress--;
        setPendingWorkers(pendingWorkers + 1);
      } else if (pendingWorkers >= 1) {
        monument.progress++;
        if (monument.progress >= monumentDef.workers) {
          monument.completed = true;

          let anyoneElseCompleted = false;
          for (let i = 0; i < newPlayers.length; i++) {
            if (i !== currentPlayerIndex) {
              for (let j = 0; j < newPlayers[i].monuments.length; j++) {
                if (newPlayers[i].monuments[j].id === monumentId && newPlayers[i].monuments[j].completed) {
                  anyoneElseCompleted = true;
                  break;
                }
              }
            }
          }

          if (!anyoneElseCompleted) {
            monument.firstToComplete = true;
          }
        }
        setPendingWorkers(pendingWorkers - 1);
      }
      setPlayers(newPlayers);
    }
  }

  function handleSkipBuild() {
    setPendingWorkers(0);
    setPendingFoodOrWorkers(0);
    setShowBuildModal(true);
    setPhase('buy');
  }

  function handleBuyDevelopment(devId) {
    let dev = null;
    for (let i = 0; i < DEVELOPMENTS.length; i++) {
      if (DEVELOPMENTS[i].id === devId) {
        dev = DEVELOPMENTS[i];
        break;
      }
    }

    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const totalValue = getGoodsValue(player.goodsPositions) + pendingCoins;

    if (totalValue >= dev.cost && player.developments.indexOf(devId) === -1) {
      let remaining = dev.cost;

      if (pendingCoins > 0) {
        const coinsUsed = Math.min(pendingCoins, remaining);
        remaining -= coinsUsed;
        setPendingCoins(pendingCoins - coinsUsed);
      }

      if (remaining > 0) {
        const goodsOrder = ['spearheads', 'cloth', 'pottery', 'stone', 'wood'];
        for (let i = 0; i < goodsOrder.length; i++) {
          const type = goodsOrder[i];
          while (player.goodsPositions[type] > 0 && remaining > 0) {
            const currentValue = GOODS_VALUES[type][player.goodsPositions[type]];
            const previousValue = GOODS_VALUES[type][player.goodsPositions[type] - 1];
            const valueToDeduct = currentValue - previousValue;
            player.goodsPositions[type]--;
            remaining -= valueToDeduct;
          }
        }
      }

      player.developments.push(devId);
      setPlayers(newPlayers);

      if (player.developments.length >= 5) {
        endGame();
        return;
      }
    }

    setPendingCoins(0);
    setShowBuyModal(true);
    setPhase('discard');
  }

  function handleSkipBuy() {
    setPendingCoins(0);
    setShowBuyModal(true);
    setPhase('discard');
  }

  function handleDiscard() {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    if (player.developments.indexOf('caravans') === -1) {
      let totalGoods = getTotalGoodsCount(player.goodsPositions);

      while (totalGoods > 6) {
        for (let i = GOODS_TYPES.length - 1; i >= 0; i--) {
          const type = GOODS_TYPES[i];
          if (player.goodsPositions[type] > 0) {
            player.goodsPositions[type]--;
            totalGoods--;
            break;
          }
        }
      }
    }

    setPlayers(newPlayers);
    nextTurn();
  }

  function nextTurn() {
    if (currentPlayerIndex === players.length - 1) {
      setRound(round + 1);
      setCurrentPlayerIndex(0);
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }

    setPhase('roll');
    setShowDiceRoll(true);
    setShowBuildModal(true);
    setShowBuyModal(true);
    setPendingCoins(0);
    setDiceResults(null);
  }

  function endGame() {
    const newPlayers = [...players];

    for (let i = 0; i < newPlayers.length; i++) {
      const player = newPlayers[i];
      let score = 0;

      for (let j = 0; j < player.developments.length; j++) {
        const devId = player.developments[j];
        for (let k = 0; k < DEVELOPMENTS.length; k++) {
          if (DEVELOPMENTS[k].id === devId) {
            score += DEVELOPMENTS[k].points;
            break;
          }
        }
      }

      for (let j = 0; j < player.monuments.length; j++) {
        const m = player.monuments[j];
        if (m.completed) {
          for (let k = 0; k < MONUMENTS.length; k++) {
            if (MONUMENTS[k].id === m.id) {
              const monument = MONUMENTS[k];
              score += m.firstToComplete ? monument.points[0] : monument.points[1];
              break;
            }
          }
        }
      }

      if (player.developments.indexOf('architecture') !== -1) {
        let completedCount = 0;
        for (let j = 0; j < player.monuments.length; j++) {
          if (player.monuments[j].completed) completedCount++;
        }
        score += completedCount * 2;
      }

      if (player.developments.indexOf('empire') !== -1) {
        let cityCount = 3;
        for (let j = 0; j < player.cities.length; j++) {
          if (player.cities[j].built) cityCount++;
        }
        score += cityCount;
      }

      score -= player.disasters;

      player.score = score;
    }

    setPlayers(newPlayers);
    setGameEnded(true);
  }

  if (gameEnded) {
    const sortedPlayers = [...players].sort(function(a, b) {
      return b.score - a.score;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-amber-800">
            🏆 Partie terminée !
          </h1>

          {sortedPlayers.map(function(player, i) {
            let completedMonuments = 0;
            for (let j = 0; j < player.monuments.length; j++) {
              if (player.monuments[j].completed) completedMonuments++;
            }

            return (
              <div key={i} className={'mb-4 p-6 rounded-lg ' + (
                i === 0 ? 'bg-yellow-100 border-4 border-yellow-400' : 'bg-gray-100'
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {i === 0 ? '👑 ' : ''}
                      {player.name}
                    </h3>
                    <p className="text-gray-600">
                      Développements: {player.developments.length} |
                      Monuments: {completedMonuments}
                    </p>
                  </div>
                  <div className="text-4xl font-bold text-amber-700">
                    {player.score} pts
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-amber-700 transition mt-8"
          >
            Nouvelle partie
          </button>
        </div>
      </div>
    );
  }

  let citiesToFeed = 3;
  for (let i = 0; i < currentPlayer.cities.length; i++) {
    if (currentPlayer.cities[i].built) citiesToFeed++;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-amber-800">
              Roll Through the Ages - Manche {round}
            </h1>
            <div className="text-lg font-semibold text-gray-700">
              Tour de {currentPlayer.name}
            </div>
          </div>
        </div>

        {showDiceRoll && phase === 'roll' && (
          <DiceRoll
            dice={numDice}
            onRollComplete={handleDiceRollComplete}
            currentPlayer={currentPlayerIndex}
            players={players}
          />
        )}

        {phase === 'choose_food_or_workers' && (
          <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-center">Choisir nourriture ou ouvriers</h2>
              <p className="text-center mb-6 font-semibold">
                Vous avez obtenu {pendingFoodOrWorkers} dé(s) nourriture/ouvriers.
                <br />
                Que souhaitez-vous en faire ?
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleUseFoodOrWorkers(true)}
                  className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold hover:bg-amber-700 text-lg"
                >
                  🌾 Convertir en {pendingFoodOrWorkers * (currentPlayer.developments.indexOf('agriculture') !== -1 ? 2 : 1)} nourriture
                  {currentPlayer.developments.indexOf('agriculture') !== -1 && (
                    <div className="text-sm mt-1 opacity-90">(+Agriculture)</div>
                  )}
                </button>
                <button
                  onClick={() => handleUseFoodOrWorkers(false)}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 text-lg"
                >
                  👷 Convertir en {pendingFoodOrWorkers * (currentPlayer.developments.indexOf('masonry') !== -1 ? 2 : 1)} ouvriers
                  {currentPlayer.developments.indexOf('masonry') !== -1 && (
                    <div className="text-sm mt-1 opacity-90">(+Maçonnerie)</div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'feed' && (
          <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-center">Nourrir les cités</h2>
              <p className="text-center mb-6">
                Vous devez nourrir {citiesToFeed} cités.
                <br />
                Nourriture disponible: {currentPlayer.food}
              </p>
              {currentPlayer.food < citiesToFeed && (
                <p className="text-red-600 text-center mb-4 font-semibold">
                  ⚠️ Famine ! Vous perdrez {citiesToFeed - currentPlayer.food} point(s)
                </p>
              )}
              <button
                onClick={handleFeed}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {phase === 'build' && (
          <BuildPhase
            player={currentPlayer}
            pendingWorkers={pendingWorkers}
            showBuildModal={showBuildModal}
            setShowBuildModal={setShowBuildModal}
            handleBuildCity={handleBuildCity}
            handleBuildMonument={handleBuildMonument}
            handleSkipBuild={handleSkipBuild}
          />
        )}

        {phase === 'buy' && (
          <BuyPhase
            player={currentPlayer}
            pendingCoins={pendingCoins}
            showBuyModal={showBuyModal}
            setShowBuyModal={setShowBuyModal}
            handleBuyDevelopment={handleBuyDevelopment}
            handleSkipBuy={handleSkipBuy}
          />
        )}

        {phase === 'discard' && (
          <DiscardPhase
            player={currentPlayer}
            handleDiscard={handleDiscard}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map(function(player, i) {
            return (
              <PlayerBoard
                key={i}
                player={player}
                isActive={i === currentPlayerIndex}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
