// Configuration for The Late Bronze Age expansion
import { getTranslatedMonuments, getTranslatedDevelopments } from './variantTranslations';

// Base monument data (IDs only, names come from translations)
const BASE_MONUMENTS = [
  { id: 'step_pyramid', workers: 3, points: [1, 0], effect: null },
  { id: 'stone_circle', workers: 5, points: [2, 1], effect: null },
  { id: 'temple', workers: 7, points: [4, 3], effect: null },
  { id: 'obelisk', workers: 9, points: [6, 4], effect: null },
  { id: 'hanging_gardens', workers: 11, points: [8, 5], effect: null },
  { id: 'great_wall', workers: 13, points: [10, 6], effect: 'great_wall' },
  { id: 'great_pyramid', workers: 15, points: [12, 8], effect: null }
];

// Base development data (IDs only, names come from translations)
const BASE_DEVELOPMENTS = [
  { id: 'leadership', cost: 10, points: 2 },
  { id: 'irrigation', cost: 10, points: 2 },
  { id: 'agriculture', cost: 15, points: 3 },
  { id: 'quarrying', cost: 15, points: 3 },
  { id: 'medicine', cost: 20, points: 4 },
  { id: 'preservation', cost: 20, points: 4 },
  { id: 'coinage', cost: 20, points: 4 },
  { id: 'caravans', cost: 20, points: 4 },
  { id: 'religion', cost: 25, points: 7 },
  { id: 'smithing', cost: 25, points: 5 },
  { id: 'shipping', cost: 25, points: 5 },
  { id: 'granaries', cost: 30, points: 6 },
  { id: 'masonry', cost: 30, points: 6 },
  { id: 'commerce', cost: 40, points: 8 },
  { id: 'engineering', cost: 40, points: 6 },
  { id: 'architecture', cost: 60, points: 8 },
  { id: 'empire', cost: 70, points: 10 }
];

export const LATE_BRONZE_AGE_CONFIG = {
  id: 'late_bronze_age',
  name: 'The Late Bronze Age',
  displayName: 'The Late Bronze Age',

  // End game conditions - modified for this variant
  endGameConditions: {
    developmentCount: 7,
    allMonumentsBuilt: true
  },

  // Solo mode: skulls can be rerolled
  soloSkullsLocked: true,

  // Monument restrictions - all monuments available for all player counts
  monumentRestrictions: {
    1: [],
    2: [],
    3: [],
    4: []
  },

  // Getter functions for translated data
  get monuments() {
    return getTranslatedMonuments(BASE_MONUMENTS);
  },

  get developments() {
    return getTranslatedDevelopments(BASE_DEVELOPMENTS);
  }
};
