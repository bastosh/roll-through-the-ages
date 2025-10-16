# Configuration du Scoring par Variante

Ce document explique comment gérer les valeurs de scoring pour les développements qui varient selon les variantes du jeu.

## Développements avec scoring variable

Certains développements ont des valeurs de points bonus qui varient selon la variante. Voici comment les configurer:

### 1. Economy (Économie)

**Effet**: Donne des points bonus pour chaque bâtiment de production construit.

**Configuration dans les fichiers de variante**:
```javascript
{
  id: 'economy',
  cost: 40,
  points: 6,
  scoringMultiplier: 2  // 2 points par bâtiment (Ancient Empires Beri)
}

{
  id: 'economy',
  cost: 40,
  points: 6,
  scoringMultiplier: 1  // 1 point par bâtiment (Ancient Empires Original)
}
```

**Variantes**:
- **Ancient Empires Original**: `scoringMultiplier: 1` → 1 point par bâtiment
- **Ancient Empires Beri**: `scoringMultiplier: 2` → 2 points par bâtiment

### 2. Architecture

**Effet**: Donne des points bonus pour chaque monument complété.

**Configuration dans les fichiers de variante**:
```javascript
{
  id: 'architecture',
  cost: 60,
  points: 8,
  scoringMultiplier: 2  // 2 points par monument (Ancient Empires Beri, Late Bronze Age)
}

{
  id: 'architecture',
  cost: 60,
  points: 8,
  scoringMultiplier: 1  // 1 point par monument (Ancient Empires Original)
}

{
  id: 'architecture',
  cost: 50,
  points: 8
  // Pas de scoringMultiplier → utilise heuristique (1 point pour cost < 60)
}
```

**Variantes**:
- **Ancient Empires Original**: `scoringMultiplier: 1` → 1 point par monument
- **Ancient Empires Beri**: `scoringMultiplier: 2` → 2 points par monument
- **Late Bronze Age**: `scoringMultiplier: 2` → 2 points par monument
- **Bronze Age**: Pas de `scoringMultiplier` (utilise heuristique: 1 point car cost = 50)

### 3. Ancient Empire (Empire Antique)

**Effet**: Donne des points bonus pour chaque culture complétée (tous les monuments d'une culture).

**Configuration dans les fichiers de variante**:
```javascript
{
  id: 'ancientEmpire',
  cost: 80,
  points: 10,
  scoringMultiplier: 9  // 9 points par culture (Ancient Empires Beri)
}

{
  id: 'ancientEmpire',
  cost: 80,
  points: 10,
  scoringMultiplier: 10  // 10 points par culture (Ancient Empires Original)
}
```

**Variantes**:
- **Ancient Empires Original**: `scoringMultiplier: 10` → 10 points par culture
- **Ancient Empires Beri**: `scoringMultiplier: 9` → 9 points par culture

## Comment modifier les valeurs

### Étape 1: Modifier les fichiers de configuration

Éditez les fichiers de variante appropriés:
- `src/constants/variants/ancientEmpiresOriginal.js`
- `src/constants/variants/ancientEmpires.js`
- `src/constants/variants/lateBronzeAge.js`
- etc.

### Étape 2: Ajouter ou modifier `scoringMultiplier`

Dans le tableau `DEVELOPMENTS`, trouvez le développement concerné et ajoutez/modifiez la propriété `scoringMultiplier`:

```javascript
const DEVELOPMENTS = [
  // ... autres développements ...

  {
    id: 'economy',
    prerequisite: null,
    cost: 40,
    points: 6,
    scoringMultiplier: 1  // ← Modifiez cette valeur
  },

  // ... autres développements ...
];
```

### Étape 3: Rebuild et test

```bash
pnpm build
```

Le système utilise automatiquement les valeurs de `scoringMultiplier` si elles sont définies. Si elles ne sont pas définies, il utilise des valeurs par défaut (heuristiques basées sur le coût).

## Architecture du système

### Fichiers concernés

1. **Configuration des variantes** (définissent les valeurs):
   - `src/constants/variants/ancientEmpiresOriginal.js`
   - `src/constants/variants/ancientEmpires.js`
   - `src/constants/variants/lateBronzeAge.js`
   - etc.

2. **Calcul du score** (utilise les valeurs):
   - `src/utils/scoring.js` - Fonctions `calculatePlayerScore()` et `calculateScoreBreakdown()`

3. **Traductions** (affichent les descriptions):
   - `src/i18n/locales/fr.json` - Traductions françaises
   - `src/i18n/locales/en.json` - Traductions anglaises
   - `src/constants/variants/variantTranslations.js` - Logique de traduction dynamique

### Logique de fallback

Le système utilise cette logique de fallback pour garantir la rétrocompatibilité:

```javascript
// Pour architecture:
const multiplier = architectureDev && architectureDev.scoringMultiplier !== undefined
  ? architectureDev.scoringMultiplier  // Utilise la valeur explicite
  : (architectureDev && architectureDev.cost >= 60 ? 2 : 1);  // Heuristique

// Pour economy:
const multiplier = economyDev && economyDev.scoringMultiplier !== undefined
  ? economyDev.scoringMultiplier
  : 2;  // Défaut

// Pour ancientEmpire:
const multiplier = ancientEmpireDev && ancientEmpireDev.scoringMultiplier !== undefined
  ? ancientEmpireDev.scoringMultiplier
  : 9;  // Défaut
```

## Exemple de test

Pour tester rapidement différentes valeurs:

1. Modifiez `scoringMultiplier` dans le fichier de variante
2. Lancez `pnpm dev`
3. Créez une partie avec la variante modifiée
4. Construisez les bâtiments/monuments concernés
5. Achetez le développement
6. Vérifiez le score affiché

Le score devrait refléter immédiatement la nouvelle valeur de `scoringMultiplier`.
