# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a digital implementation of "Roll Through the Ages: The Bronze Age" board game, built as a single-page React application in French. The game is a dice-based civilization-building game where players collect resources, build cities and monuments, and purchase developments to score victory points.

## Development Commands

- `pnpm dev` - Start the development server with hot module replacement
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint on the codebase
- `pnpm preview` - Preview the production build locally

## Technology Stack

- **Build Tool**: Vite 7.x
- **Framework**: React 19.x with JSX (no TypeScript)
- **Styling**: Tailwind CSS 4.x with Tailwind Vite plugin
- **Package Manager**: pnpm (note: uses pnpm-lock.yaml)

## Architecture

### Modular Component Structure

The codebase is organized into separate modules for maintainability:

- **`/src/constants/gameData.js`**: All game data (goods types, monuments, developments, dice faces)
- **`/src/utils/gameUtils.js`**: Utility functions (`getGoodsValue()`, `getTotalGoodsCount()`, `addGoods()`, `handleDisasters()`)
- **`/src/components/`**: React components
  - `GameSetup.jsx`: Player configuration screen
  - `DiceRoll.jsx`: Dice rolling interface with lock/unlock mechanics
  - `PlayerBoard.jsx`: Individual player state display
  - `Game.jsx`: Main game state container and orchestrator
  - `BuildPhase.jsx`, `BuyPhase.jsx`, `DiscardPhase.jsx`: Turn phase modals
- **`/src/App.jsx`**: Root component (~20 lines) that switches between setup and game

### Game State Architecture

The `Game` component manages all state using React hooks:
- **Player State**: Array of player objects containing food, goods positions, cities, monuments, developments, disasters, and scores
- **Turn State**: Current player index, round number, phase (roll/choose_food_or_workers/feed/build/buy/discard)
- **Pending Resources**: Workers, food-or-workers choice, and coins awaiting allocation
- **UI State**: Modal visibility flags for dice roll, build, and buy phases

### Game Flow

1. **Roll Phase**: Player rolls dice (3 + built cities), can lock non-skull dice, up to 3 rolls total
2. **Choose Food/Workers**: If any dual-purpose dice, player chooses conversion
3. **Feed Phase**: Player feeds cities (3 + built cities) or takes disaster points
4. **Build Phase**: Allocate workers to cities (4-7) or monuments (7 different types, 3-15 workers each)
5. **Buy Phase**: Purchase developments using goods value + coins (13 developments, 10-70 coins)
6. **Discard Phase**: Discard excess goods if over 6 (unless Caravans development owned)

### Key Game Mechanics

- **Goods System**: 5 resource types (wood, stone, pottery, cloth, spearheads) with exponential value tracks. Goods are added bottom-to-top in fixed order with wraparound.
- **Disasters**: Triggered by skull dice results (2-5+ skulls have different effects), can be mitigated by specific developments/monuments
- **Development Bonuses**: Automatically applied when processing dice (e.g., Agriculture adds food, Quarrying doubles stone, Masonry adds workers)
- **Monument Scoring**: First player to complete gets higher points (e.g., Great Pyramid: 12 pts first, 6 pts others)
- **End Game**: Triggered when any player purchases 5th development

### Code Style

- Uses explicit `function` declarations rather than arrow functions
- Uses explicit `for` loops instead of array methods in many places
- All text is in French
- Uses imperative array iteration patterns (e.g., `for (let i = 0; i < array.length; i++)`)
- Inline conditional rendering with ternary operators for className construction

## Important Implementation Details

- The goods allocation system fills resources from bottom-to-top (wood → stone → pottery → cloth → spearheads) and cycles back
- Worker allocation to buildings is toggleable - clicking adds a worker, clicking again removes it
- Dice with skulls are auto-locked and cannot be unlocked
- All game phases use modal overlays with hide/show capability to check player boards
- Development effects are applied immediately during dice processing, not retroactively
