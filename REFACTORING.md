# Refactoring de Game.jsx - Documentation

## 📊 Vue d'ensemble

Ce document décrit le refactoring effectué sur `Game.jsx` pour améliorer l'organisation du code et la maintenabilité.

### Statistiques
- **Taille initiale**: ~1600 lignes
- **Taille actuelle**: 1425 lignes
- **Réduction**: 175 lignes (-11%)

---

## 🗂️ Structure du refactoring

### 1. Hooks personnalisés créés

#### `src/hooks/useDiceRolling.js` ✅ **INTÉGRÉ**
**172 lignes** - Gère toute la logique des dés

**États**:
- `diceResults`, `rollCount`, `lockedDice`
- `isRolling`, `rollingDice`
- `leadershipUsed`, `leadershipMode`

**Actions**:
- `rollDice(initial, currentRollCount)`
- `toggleLock(index)`
- `handleReroll()`
- `handleUseLeadership()`, `handleLeadershipReroll()`, `handleCancelLeadership()`
- `resetForNewTurn()`

**Fonctionnalités**:
- Auto-lock des crânes selon mode solo/variante
- Auto-validation après le 3ème lancer
- Support du développement Leadership
- Animations individuelles par dé

#### `src/hooks/useFoodOrWorkersPhase.js` 📦 **Prêt pour intégration**
**73 lignes** - Phase choix nourriture/ouvriers

**API**:
```javascript
const {
  foodOrWorkerChoices,
  initializeChoices,
  toggleChoice,
  validateChoices,
  reset
} = useFoodOrWorkersPhase();
```

#### `src/hooks/useBuildPhase.js` 📦 **Prêt pour intégration**
**211 lignes** - Phase de construction

**API**:
```javascript
const {
  buildPhaseInitialState,
  stoneToTradeForWorkers,
  initializeBuildPhase,
  buildCity,
  buildMonument,
  checkAllMonumentsBuilt,
  resetBuild,
  canSkipBuild,
  tradeStone,
  resetStone,
  resetPhase
} = useBuildPhase();
```

#### `src/hooks/useBuyPhase.js` 📦 **Prêt pour intégration**
**201 lignes** - Phase d'achat

**API**:
```javascript
const {
  selectedDevelopmentToBuy,
  selectedGoodsForPurchase,
  coinsForPurchase,
  originalGoodsPositions,
  lastPurchasedDevelopment,
  foodToTradeForCoins,
  selectDevelopment,
  autoBuyDevelopment,
  toggleGoodForPurchase,
  calculateSelectedValue,
  confirmPurchase,
  cancelPurchaseSelection,
  resetBuy,
  tradeFood,
  resetTrade,
  resetPhase
} = useBuyPhase();
```

---

### 2. Modules utilitaires créés

#### `src/utils/scoring.js` ✅ **INTÉGRÉ**
**163 lignes** - Calcul des scores

**Fonctions**:
```javascript
// Calcul du score total
calculatePlayerScore(player, DEVELOPMENTS, MONUMENTS)

// Détail du score pour fin de partie
calculateScoreBreakdown(player, DEVELOPMENTS, MONUMENTS)
// Retourne: { developments, monuments, bonus, disasters, total }
```

**Calculs inclus**:
- Points des développements
- Points des monuments (avec bonus premier à compléter)
- Bonus Architecture (x1 ou x2 selon variante)
- Bonus Empire (nombre de cités)
- Bonus Commerce (nombre de ressources)
- Pénalité catastrophes

---

### 3. Phase Handlers créés 📦 **Prêts pour intégration**

Tous les handlers sont dans `src/utils/phaseHandlers/`

#### `rollPhase.js` (78 lignes)
```javascript
import { processRollResults } from './phaseHandlers';

const result = processRollResults(
  diceResults,
  currentPlayer,
  currentPlayerIndex,
  players
);
// Retourne: { players, pendingWorkers, pendingFoodOrWorkers,
//            pendingCoins, nextPhase, foodOrWorkerChoicesCount }
```

#### `foodWorkersPhase.js` (51 lignes)
```javascript
import { toggleFoodOrWorkerDie, validateFoodOrWorkers } from './phaseHandlers';

// Toggle un dé
const newChoices = toggleFoodOrWorkerDie(foodOrWorkerChoices, dieIndex);

// Valider les choix
const result = validateFoodOrWorkers(
  foodOrWorkerChoices,
  player,
  pendingWorkers
);
// Retourne: { player, newPendingWorkers, nextPhase }
```

#### `feedPhase.js` (26 lignes)
```javascript
import { feedCities } from './phaseHandlers';

const result = feedCities(player, pendingWorkers);
// Retourne: { player, shouldSkipBuild }
```

#### `buildPhase.js` (204 lignes)
```javascript
import {
  buildCity,
  buildMonument,
  checkAllMonumentsBuilt,
  resetBuild,
  canSkipBuild,
  tradeStone,
  resetStone
} from './phaseHandlers';

// Construire une cité
const result = buildCity(player, cityIndex, pendingWorkers);
// Retourne: { player, newPendingWorkers }

// Construire un monument
const result = buildMonument(
  player,
  monumentId,
  pendingWorkers,
  MONUMENTS,
  allPlayers,
  currentPlayerIndex
);
// Retourne: { player, newPendingWorkers, triggerEndGame }

// Échanger pierre contre ouvriers
const result = tradeStone(
  player,
  amount,
  currentTradeAmount,
  pendingWorkers
);
// Retourne: { player, newPendingWorkers, newTradeAmount }
```

#### `buyPhase.js` (147 lignes)
```javascript
import {
  selectDevelopmentToBuy,
  autoBuyDevelopment,
  toggleGood,
  calculatePurchaseValue,
  confirmDevelopmentPurchase,
  resetPurchase,
  tradeFoodForCoins
} from './phaseHandlers';

// Sélectionner un développement
const result = selectDevelopmentToBuy(dev, player, pendingCoins, alreadyPurchased);
// Retourne: { shouldAutoBuy, dev } ou null

// Auto-acheter
const result = autoBuyDevelopment(dev, player, pendingCoins);
// Retourne: { player, newCoins }

// Confirmer achat
const result = confirmDevelopmentPurchase(
  dev,
  player,
  selectedGoodsForPurchase,
  coinsForPurchase,
  pendingCoins
);
// Retourne: { player, newPendingCoins }

// Échanger nourriture contre pièces
const result = tradeFoodForCoins(
  player,
  amount,
  currentTradeAmount,
  granariesRate
);
// Retourne: { player, coinsToAdd, newTradeAmount }
```

#### `discardPhase.js` (30 lignes)
```javascript
import { discardExcessGoods } from './phaseHandlers';

const newPlayer = discardExcessGoods(player);
// Défausse automatiquement jusqu'à 6 ressources (sauf si Caravans)
```

---

## 📝 Import simplifié

Tous les handlers peuvent être importés via un seul fichier:

```javascript
import {
  // Roll phase
  processRollResults,

  // Food/Workers phase
  toggleFoodOrWorkerDie,
  validateFoodOrWorkers,

  // Feed phase
  feedCities,

  // Build phase
  buildCity,
  buildMonument,
  checkAllMonumentsBuilt,
  resetBuild,
  canSkipBuild,
  tradeStone,
  resetStone,

  // Buy phase
  selectDevelopmentToBuy,
  autoBuyDevelopment,
  toggleGood,
  calculatePurchaseValue,
  confirmDevelopmentPurchase,
  resetPurchase,
  tradeFoodForCoins,

  // Discard phase
  discardExcessGoods
} from './utils/phaseHandlers';
```

---

## 🎯 Bénéfices

### Déjà réalisés
1. ✅ **Réduction de taille**: Game.jsx réduit de 11%
2. ✅ **Logique des dés isolée**: Testable indépendamment
3. ✅ **Scoring centralisé**: Une seule source de vérité
4. ✅ **Code plus lisible**: Séparation des responsabilités

### Potentiels (avec intégration complète)
1. 📦 **Réduction supplémentaire**: Estimation ~400-500 lignes de moins
2. 📦 **Testabilité**: Chaque phase testable unitairement
3. 📦 **Maintenabilité**: Bugs plus faciles à localiser
4. 📦 **Réutilisabilité**: Logique partageable entre composants

---

## 🚀 Prochaines étapes

### Intégration progressive recommandée

#### Étape 1: Food/Workers Phase
```javascript
// Dans Game.jsx
import { toggleFoodOrWorkerDie, validateFoodOrWorkers } from '../utils/phaseHandlers';

function handleToggleFoodOrWorkerDie(dieIndex) {
  const newChoices = toggleFoodOrWorkerDie(foodOrWorkerChoices, dieIndex);
  setFoodOrWorkerChoices(newChoices);
}

function handleValidateFoodOrWorkers() {
  const result = validateFoodOrWorkers(
    foodOrWorkerChoices,
    players[currentPlayerIndex],
    pendingWorkers
  );

  const newPlayers = [...players];
  newPlayers[currentPlayerIndex] = result.player;
  setPlayers(newPlayers);
  setPendingWorkers(result.newPendingWorkers);
  setPendingFoodOrWorkers(0);
  setFoodOrWorkerChoices([]);
  setPhase(result.nextPhase);
}
```

#### Étape 2: Feed Phase
```javascript
import { feedCities } from '../utils/phaseHandlers';

function handleFeed() {
  const result = feedCities(players[currentPlayerIndex], pendingWorkers);

  const newPlayers = [...players];
  newPlayers[currentPlayerIndex] = result.player;
  setPlayers(newPlayers);

  if (result.shouldSkipBuild) {
    skipToBuyPhase();
  } else {
    // Initialize build phase...
    setPhase('build');
  }
}
```

#### Étape 3: Discard Phase
```javascript
import { discardExcessGoods } from '../utils/phaseHandlers';

function handleDiscard() {
  const newPlayer = discardExcessGoods(players[currentPlayerIndex]);

  const newPlayers = [...players];
  newPlayers[currentPlayerIndex] = newPlayer;
  setPlayers(newPlayers);
  nextTurn();
}
```

### Priorité d'intégration

1. **Haute priorité**: `rollPhase`, `feedPhase`, `discardPhase` (simples, forte réduction)
2. **Moyenne priorité**: `foodWorkersPhase`, `buyPhase` (complexité moyenne)
3. **Basse priorité**: `buildPhase` (très complexe, nécessite refactoring approfondi)

---

## 📚 Tests recommandés

Une fois intégrés, créer des tests unitaires pour chaque handler:

```javascript
// Exemple pour rollPhase.test.js
import { processRollResults } from '../utils/phaseHandlers';

describe('processRollResults', () => {
  it('should process food results with Agriculture bonus', () => {
    const player = {
      food: 5,
      developments: ['agriculture'],
      goodsPositions: { wood: 0, stone: 0, pottery: 0, cloth: 0, spearheads: 0 },
      disasters: 0
    };

    const results = [
      { type: 'food', value: 3, skulls: 0 }
    ];

    const outcome = processRollResults(results, player, 0, [player]);

    expect(outcome.players[0].food).toBe(9); // 5 + 3 + 1 (Agriculture)
  });
});
```

---

## 🎓 Principes appliqués

1. **Séparation des préoccupations**: Logique métier séparée de la présentation
2. **Fonctions pures**: Les handlers ne modifient pas directement l'état
3. **Single Responsibility**: Chaque fichier a une responsabilité claire
4. **DRY**: Élimination des duplications
5. **Testabilité**: Code facilement testable unitairement

---

## 📖 Références

- Code original: `src/components/Game.jsx`
- Hooks: `src/hooks/`
- Utilitaires: `src/utils/scoring.js`
- Phase handlers: `src/utils/phaseHandlers/`
