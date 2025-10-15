import { getGoodsValue } from '../../utils/gameUtils';
import CityDisplay from './CityDisplay';
import DevelopmentsList from './DevelopmentsList';
import MonumentsGrid from './MonumentsGrid';
import DisastersDisplay from './DisastersDisplay';
import ResourcesDisplay from './ResourcesDisplay';
import BoatDisplay from './BoatDisplay';
import TradeResourcesPanel from '../phases/TradeResourcesPanel';
import SmithingInvasionPanel from '../phases/SmithingInvasionPanel';
import MetropolisDisplay from './MetropolisDisplay';
import MonumentsByCulture from './MonumentsByCulture';
import ProductionBuildingsList from './ProductionBuildingsList';
import DevelopmentsListAncient from './DevelopmentsListAncient';

export default function PlayerScorePanel({
  player,
  onBuyDevelopment,
  canBuy,
  pendingCoins,
  onBuildCity,
  onUnbuildCity,
  onBuildMonument,
  onUnbuildMonument,
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
  onSkipSmithing = null,
  // Ancient Empires props
  variantConfig = null,
  onBuildMetropolis = null,
  onUnbuildMetropolis = null,
  onBuildProduction = null,
  onUnbuildProduction = null
}) {
  const goodsValue = getGoodsValue(player.goodsPositions);
  const isAncientEmpires = variantId === 'ancient_empires';

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-2 sm:px-4 lg:h-full flex flex-col lg:overflow-hidden transition-colors">
      {/* Contenu principal en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 lg:flex-1 lg:min-h-0">
        {/* Colonne de gauche */}
        <div className={"flex flex-col lg:overflow-y-auto scrollbar-hide " + (isAncientEmpires ? 'space-y-4' : 'space-y-2')}>
          {/* Trade panel - appears during trade phase at the top */}
          {isTradePhase && (
            <TradeResourcesPanel
              player={player}
              tradesUsed={tradesUsed}
              onTrade={onTrade}
              onReset={onResetTrades}
              onSkip={onSkipTrade}
            />
          )}

          {/* Smithing invasion panel - appears during smithing_invasion phase at the top */}
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

          <div className='flex justify-between gap-2'>
            <div className='flex gap-2'>
              <CityDisplay
                cities={player.cities}
                onBuildCity={onBuildCity}
                onUnbuildCity={onUnbuildCity}
                canBuild={canBuild}
                pendingWorkers={pendingWorkers}
              />
              {isAncientEmpires && player.metropolis && (
                <MetropolisDisplay
                  metropolis={player.metropolis}
                  onBuildMetropolis={onBuildMetropolis}
                  onUnbuildMetropolis={onUnbuildMetropolis}
                  canBuild={canBuild}
                  pendingWorkers={pendingWorkers}
                />
              )}
            </div>
            {(variantId === 'late_bronze_age' || isAncientEmpires) && (
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

          {/* Production buildings for Ancient Empires - between cities and monuments */}
          {isAncientEmpires && variantConfig && player.productions && (
            <ProductionBuildingsList
              playerProductions={player.productions}
              onBuildProduction={onBuildProduction}
              onUnbuildProduction={onUnbuildProduction}
              canBuild={canBuild}
              pendingWorkers={pendingWorkers}
              productions={variantConfig.productions}
              citiesBuiltCount={3 + player.cities.filter(c => c.built).length}
            />
          )}

          {isAncientEmpires && variantConfig ? (
            <MonumentsByCulture
              playerMonuments={player.monuments}
              onBuildMonument={onBuildMonument}
              onUnbuildMonument={onUnbuildMonument}
              canBuild={canBuild}
              pendingWorkers={pendingWorkers}
              allPlayers={allPlayers}
              currentPlayerIndex={currentPlayerIndex}
              monuments={monuments}
              cultures={variantConfig.cultures}
            />
          ) : (
            <MonumentsGrid
              playerMonuments={player.monuments}
              onBuildMonument={onBuildMonument}
              onUnbuildMonument={onUnbuildMonument}
              canBuild={canBuild}
              pendingWorkers={pendingWorkers}
              allPlayers={allPlayers}
              currentPlayerIndex={currentPlayerIndex}
              monuments={monuments}
            />
          )}

          {/* Resources display - only for non-Ancient Empires variants */}
          {!isAncientEmpires && (
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
          )}
        </div>
  
        {/* Colonne de droite */}
        <div className="flex flex-col justify-between gap-3 lg:overflow-y-auto scrollbar-hide">
          {/* Resources display - for Ancient Empires only (moved to right column) */}
          {isAncientEmpires && (
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
          )}

          {isAncientEmpires && variantConfig ? (
            <DevelopmentsListAncient
              playerDevelopments={player.developments}
              onBuyDevelopment={onBuyDevelopment}
              canBuy={canBuy}
              playerGoodsValue={goodsValue}
              pendingCoins={pendingCoins}
              selectedDevelopmentId={selectedDevelopmentId}
              developments={developments}
              playerMonuments={player.monuments}
              playerProductions={player.productions || []}
              hasMetropolis={player.metropolis && player.metropolis.built}
              playerCount={allPlayers ? allPlayers.length : 1}
            />
          ) : (
            <DevelopmentsList
              playerDevelopments={player.developments}
              onBuyDevelopment={onBuyDevelopment}
              canBuy={canBuy}
              playerGoodsValue={goodsValue}
              pendingCoins={pendingCoins}
              selectedDevelopmentId={selectedDevelopmentId}
              developments={developments}
            />
          )}

          <DisastersDisplay disasters={player.disasters} />
        </div>
      </div>
    </div>
  );
}
