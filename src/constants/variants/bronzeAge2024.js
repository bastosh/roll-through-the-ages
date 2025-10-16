// Configuration for The Bronze Age (2024 Edition)
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
  { id: 'coinage', cost: 20, points: 4 },
  { id: 'caravans', cost: 20, points: 4 },
  { id: 'religion', cost: 25, points: 7 },
  { id: 'granaries', cost: 30, points: 6 },
  { id: 'masonry', cost: 30, points: 6 },
  { id: 'engineering', cost: 40, points: 6 },
  { id: 'architecture', cost: 60, points: 8 },
  { id: 'empire', cost: 70, points: 10 }
];

export const BRONZE_AGE_2024_CONFIG = {
  id: 'bronze_age_2024',
  name: 'The Bronze Age (2024)',
  displayName: 'The Bronze Age (2024)',

  // End game conditions - option for 6 developments
  endGameConditions: {
    developmentCount: 5,
    allMonumentsBuilt: true
  },

  // Solo mode: skulls cannot be rerolled
  soloSkullsLocked: true,

  // Solo mode: maximum number of rounds
  soloMaxRounds: 10,

  // Monument restrictions based on player count
  monumentRestrictions: {
    1: [],
    2: ['temple', 'great_pyramid'],
    3: ['hanging_gardens'],
    4: []
  },

  // Getter functions for translated data
  get monuments() {
    return getTranslatedMonuments(BASE_MONUMENTS, this.id);
  },

  get developments() {
    return getTranslatedDevelopments(BASE_DEVELOPMENTS);
  }
};
