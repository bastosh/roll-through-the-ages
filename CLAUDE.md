# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Digital implementation of "Roll Through the Ages: The Bronze Age" board game as a single-page React application. The game is a dice-based civilization-building game where players collect resources, build cities and monuments, and purchase developments to score victory points. The UI is multilingual (French/English) with support for multiple game variants.

## Development Commands

- `pnpm dev` - Start the development server with hot module replacement
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint on the codebase
- `pnpm preview` - Preview the production build locally

## Technology Stack

- **Build Tool**: Vite 7.x
- **Framework**: React 19.x with JSX (no TypeScript)
- **Styling**: Tailwind CSS 4.x with Tailwind Vite plugin
- **Internationalization**: react-i18next
- **Package Manager**: pnpm (note: uses pnpm-lock.yaml)

## Architecture Overview

### App Structure

The app has two main screens controlled by `App.jsx`:
- **Setup Screen** (`GameSetup.jsx`): Player configuration, variant selection, language selection, and saved game management
- **Game Screen** (`Game.jsx`): Main game orchestrator (~1400 lines) managing all game state and phases

Game state is automatically saved to localStorage and persists for 7 days.

### Game Variants System

The game supports multiple variants with different rules, monuments, and developments:

**Variant Configurations** (`/src/constants/variants/`):
- `bronzeAge.js` - Original Bronze Age rules
- `bronzeAge2024.js` - 2024 variant with configurable development count
- `lateBronzeAge.js` - Late Bronze Age expansion
- `ancientEmpires.js` - Ancient Empires original
- `ancientEmpiresBeri.js` - Ancient Empires Beri variant
- `ancientEmpiresBeriRevised.js` - Revised Beri rules
- `index.js` - Variant registry and `getVariantById()` function

Each variant defines:
- Available monuments and developments
- Monument restrictions by player count
- Special mechanics (metropolis, production buildings, etc.)
- End game conditions (development count thresholds)
- Scoring multipliers (see SCORING_CONFIG.md)

### Component Organization

Components are organized by domain in `/src/components/`:
- **`/dice/`** - Dice rolling interface components
- **`/info/`** - Help and information displays
- **`/layout/`** - Screen layouts (GameSetup, GameHeader, GameEndScreen)
- **`/phases/`** - Turn phase modals (BuildPhase, BuyPhase, etc.)
- **`/player/`** - Player-related UI (PlayerBoard, PlayerScorePanel, etc.)
- **`/shared/`** - Reusable UI components (modals, buttons, etc.)
- **`Game.jsx`** - Main game state container

### Custom Hooks Architecture

The codebase uses custom hooks to encapsulate complex game phase logic (see REFACTORING.md for details):

**Available Hooks** (`/src/hooks/`):
- `useDiceRolling.js` - Complete dice rolling logic including lock/unlock, Leadership development, and animations
- `useBuildPhase.js` - City and monument building logic
- `useBuyPhase.js` - Development purchase logic
- `useFoodOrWorkersPhase.js` - Food/workers choice phase
- `useDiscardPhase.js` - Excess goods discard logic
- `useTradePhase.js` - Trading mechanics (Ancient Empires)
- `useSmithingPhase.js` - Smithing mechanics (Ancient Empires)
- `useLocalStorage.js` - LocalStorage persistence helper

### Utils and Phase Handlers

**Core Utilities** (`/src/utils/`):
- `gameUtils.js` - Core game functions (`getGoodsValue()`, `getTotalGoodsCount()`, `addGoods()`, `handleDisasters()`)
- `scoring.js` - Score calculation (`calculatePlayerScore()`, `calculateScoreBreakdown()`)
- `developmentCost.js` - Development cost calculation with prerequisites
- `diceTextHelpers.js` - Dice result text formatting
- `playerHistory.js` - Player name history management
- `scoreHistory.js` - Score history tracking

**Phase Handlers** (`/src/utils/phaseHandlers/`):
Pure functions for game phase logic that can be used independently:
- `rollPhase.js` - Process dice results, apply development bonuses
- `feedPhase.js` - Feed cities or take disaster penalties
- `foodWorkersPhase.js` - Handle food/workers choices
- `buildPhase.js` - Building construction logic
- `buyPhase.js` - Development purchase logic
- `discardPhase.js` - Excess goods discard
- `index.js` - Exports all handlers

### Internationalization (i18n)

Full internationalization system using react-i18next (see I18N.md for details):

**Structure**:
- `/src/i18n/config.js` - i18next configuration
- `/src/i18n/locales/fr.json` - French translations (default)
- `/src/i18n/locales/en.json` - English translations
- `/src/constants/variants/variantTranslations.js` - Dynamic translation helpers for variant-specific content

**Translation keys** are organized by domain (common, setup, variants, monuments, developments, goods, phases, etc.)

**Dynamic Translations**: Monuments and developments use translation getters that recalculate when language changes

### Game State Management

`Game.jsx` manages all state with React hooks:

**Player State**:
- Array of player objects with: name, food, goodsPositions (5 resource tracks), cities, monuments, developments, disasters, score
- Ancient Empires variants add: metropolis, productions

**Turn State**:
- Current player index, round number
- Phase: `'roll'` | `'choose_food_or_workers'` | `'feed'` | `'build'` | `'buy'` | `'discard'` | `'trade'` | `'smithing'`
- Pending resources: workers, food-or-workers, coins

**UI State**:
- Modal visibility flags
- Dice results and lock states (via useDiceRolling hook)
- Build/buy selections (via respective hooks)

### Game Flow

1. **Roll Phase**: Player rolls 3 + built cities dice, can lock/unlock non-skull dice, max 3 rolls
2. **Choose Food/Workers**: If dual-purpose dice exist, player selects food or workers for each
3. **Feed Phase**: Player feeds cities (3 + built cities) or takes disaster penalties
4. **Build Phase**: Allocate workers to cities (4-7) or monuments (various costs)
5. **Buy Phase**: Purchase developments using goods value + coins
6. **Discard Phase**: Discard excess goods if over 6 (unless Caravans development owned)
7. **Trade/Smithing** (Ancient Empires only): Variant-specific phases

### Key Game Mechanics

**Goods System**:
- 5 resource types: wood, stone, pottery, cloth, spearheads
- Each type has a track with exponential value (positions 0-6)
- Goods added bottom-to-top in fixed order with wraparound
- Value calculation in `gameUtils.js:getGoodsValue()`

**Development Bonuses**:
- Applied automatically during dice processing (rollPhase.js)
- Examples: Agriculture adds food, Quarrying doubles stone, Masonry adds workers
- Effects are immediate, not retroactive

**Monument Scoring**:
- First player to complete gets higher points (e.g., Great Pyramid: 12 pts first, 6 pts others)
- Bonus multipliers can vary by variant (see SCORING_CONFIG.md)

**Disasters**:
- Triggered by skull dice (2-5+ skulls have different effects)
- Mitigated by specific developments/monuments
- Handled in `gameUtils.js:handleDisasters()`

**End Game**:
- Triggered when any player purchases their 5th development (or variant-specific count)
- Final round completes so all players have equal turns
- Score breakdown shown with development/monument/bonus/penalty details

### Variant-Specific Features

**Ancient Empires Variants**:
- Metropolis (5th city requiring 10 workers)
- Production buildings (Granary, Market, Quarry, Smithy)
- Trade phase (exchange goods for coins)
- Smithing phase (exchange workers for goods)
- Cultural monument sets (bonus for completing a culture)

**Bronze Age 2024**:
- Configurable development count for end game (4-6 developments)

### Theme System

ThemeContext (`/src/contexts/ThemeContext.jsx`) provides dark/light mode support throughout the app.

### Code Style Conventions

- Use explicit `function` declarations (not arrow functions for named functions)
- Use explicit `for` loops where performance matters
- Imperative patterns for game logic
- Inline conditional rendering with ternary operators for className construction
- Descriptive variable names (as per global .claude/CLAUDE.md rules)

## Important Implementation Details

- Goods allocation fills bottom-to-top (wood → stone → pottery → cloth → spearheads) then cycles
- Worker allocation is toggleable - click to add, click again to remove
- Skull dice are auto-locked and cannot be unlocked
- Phase modals can be hidden to check player boards without losing state
- Development effects apply during dice processing, never retroactively
- Variant configurations use getter functions for monuments/developments to support dynamic translations
- Scoring multipliers (Architecture, Economy, Ancient Empire) vary by variant - always use `scoringMultiplier` property if defined
- Game state autosaves to localStorage after each action, expires after 7 days

## Key Documentation Files

- **REFACTORING.md** - Documents the refactoring of Game.jsx into hooks and phase handlers
- **SCORING_CONFIG.md** - Explains variant-specific scoring multiplier configuration
- **I18N.md** - Internationalization system documentation (French)