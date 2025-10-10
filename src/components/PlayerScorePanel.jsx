import { getGoodsValue } from '../utils/gameUtils';
import CityDisplay from './CityDisplay';
import DevelopmentsList from './DevelopmentsList';
import MonumentsGrid from './MonumentsGrid';
import DisastersDisplay from './DisastersDisplay';
import ResourcesDisplay from './ResourcesDisplay';

export default function PlayerScorePanel({
  player,
  onBuyDevelopment,
  canBuy,
  pendingCoins,
  onBuildCity,
  onBuildMonument,
  canBuild,
  pendingWorkers,
  selectedDevelopmentId,
  allPlayers,
  currentPlayerIndex,
  monuments,
  developments,
  previewFood,
  previewGoodsCount
}) {
  const goodsValue = getGoodsValue(player.goodsPositions);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col overflow-hidden">
      {/* Contenu principal en grille */}
      <div className="grid grid-cols-2 gap-12 flex-1 min-h-0">
        {/* Colonne de gauche */}
        <div className="flex flex-col overflow-y-auto">
          <CityDisplay
            cities={player.cities}
            onBuildCity={onBuildCity}
            canBuild={canBuild}
            pendingWorkers={pendingWorkers}
          />
          <MonumentsGrid
            playerMonuments={player.monuments}
            onBuildMonument={onBuildMonument}
            canBuild={canBuild}
            pendingWorkers={pendingWorkers}
            allPlayers={allPlayers}
            currentPlayerIndex={currentPlayerIndex}
            monuments={monuments}
          />
          <ResourcesDisplay
            goodsPositions={player.goodsPositions}
            food={player.food}
            previewFood={previewFood}
            previewGoodsCount={previewGoodsCount}
          />
        </div>

        {/* Colonne de droite */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <DevelopmentsList
            playerDevelopments={player.developments}
            onBuyDevelopment={onBuyDevelopment}
            canBuy={canBuy}
            playerGoodsValue={goodsValue}
            pendingCoins={pendingCoins}
            selectedDevelopmentId={selectedDevelopmentId}
            developments={developments}
          />
          <DisastersDisplay disasters={player.disasters} />
        </div>
      </div>
    </div>
  );
}
