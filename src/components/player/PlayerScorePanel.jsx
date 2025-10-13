import { getGoodsValue } from '../../utils/gameUtils';
import CityDisplay from './CityDisplay';
import DevelopmentsList from './DevelopmentsList';
import MonumentsGrid from './MonumentsGrid';
import DisastersDisplay from './DisastersDisplay';
import ResourcesDisplay from './ResourcesDisplay';
import BoatDisplay from './BoatDisplay';
import TradeResourcesPanel from '../phases/TradeResourcesPanel';
import SmithingInvasionPanel from '../phases/SmithingInvasionPanel';

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
  previewGoodsCount,
  interactionMode = null,
  tempGoodsPositions = null,
  selectedGoodsForPurchase = null,
  onDiscardGood = null,
  onToggleGoodForPurchase = null,
  variantId = null,
  maxBoats = 0,
  onBuildBoat = null,
  onUnbuildBoat = null,
  // Trade phase props
  isTradePhase = false,
  tradesUsed = 0,
  onTrade = null,
  onResetTrades = null,
  onSkipTrade = null,
  // Smithing invasion phase props
  isSmithingInvasionPhase = false,
  spearheadsToSpend = 0,
  onIncrementSpearheads = null,
  onDecrementSpearheads = null,
  onConfirmSmithing = null,
  onSkipSmithing = null
}) {
  const goodsValue = getGoodsValue(player.goodsPositions);

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 lg:h-full flex flex-col lg:overflow-hidden">
      {/* Contenu principal en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 lg:flex-1 lg:min-h-0">
        {/* Colonne de gauche */}
        <div className="flex flex-col lg:overflow-y-auto space-y-2">
          <div className='flex justify-between'>
            <CityDisplay
              cities={player.cities}
              onBuildCity={onBuildCity}
              canBuild={canBuild}
              pendingWorkers={pendingWorkers}
            />
            {variantId === 'late_bronze_age' && (
              <BoatDisplay
                builtBoats={player.builtBoats || 0}
                pendingBoats={player.pendingBoats || 0}
                canBuild={canBuild}
                maxBoats={maxBoats}
                hasShipping={player.developments.includes('shipping')}
                onBuildBoat={onBuildBoat}
                onUnbuildBoat={onUnbuildBoat}
              />
            )}
          </div>
          <MonumentsGrid
            playerMonuments={player.monuments}
            onBuildMonument={onBuildMonument}
            canBuild={canBuild}
            pendingWorkers={pendingWorkers}
            allPlayers={allPlayers}
            currentPlayerIndex={currentPlayerIndex}
            monuments={monuments}
          />

          {/* Trade panel - appears during trade phase */}
          {isTradePhase && (
            <TradeResourcesPanel
              player={player}
              tradesUsed={tradesUsed}
              onTrade={onTrade}
              onReset={onResetTrades}
              onSkip={onSkipTrade}
            />
          )}

          {/* Smithing invasion panel - appears during smithing_invasion phase */}
          {isSmithingInvasionPhase && (
            <SmithingInvasionPanel
              currentPlayer={player}
              allPlayers={allPlayers}
              currentPlayerIndex={currentPlayerIndex}
              spearheadsToSpend={spearheadsToSpend}
              onIncrementSpearheads={onIncrementSpearheads}
              onDecrementSpearheads={onDecrementSpearheads}
              onConfirm={onConfirmSmithing}
              onSkip={onSkipSmithing}
            />
          )}

          <ResourcesDisplay
            goodsPositions={player.goodsPositions}
            food={player.food}
            previewFood={previewFood}
            previewGoodsCount={previewGoodsCount}
            developments={player.developments}
            interactionMode={interactionMode}
            tempGoodsPositions={tempGoodsPositions}
            selectedGoodsForPurchase={selectedGoodsForPurchase}
            onDiscardGood={onDiscardGood}
            onToggleGoodForPurchase={onToggleGoodForPurchase}
          />
        </div>
  
        {/* Colonne de droite */}
        <div className="flex flex-col justify-between gap-3 lg:overflow-y-auto">
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
