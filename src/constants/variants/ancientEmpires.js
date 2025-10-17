// Configuration for The Late Bronze Age expansion
import { getTranslatedMonuments, getTranslatedDevelopments } from './variantTranslations';

const METROPOLIS = {name: 'metropolis', workers: 10, points: 4}

const PRODUCTION = [
  {name: 'market', workers: 10, bonus: '1 good'}, 
  {name: 'mine', workers: 8, bonus: '1 coin'}, 
  {name: 'mine', workers: 8, bonus: '1 coin'}, 
  {name: 'village', workers: 6, bonus: '1 food'}, 
  {name: 'village', workers: 6, bonus: '1 food'}, 
  {name: 'village', workers: 6, bonus: '1 food'}, 
]

const CULTURES = [
  {name: 'celtic', bonusFirst: 8}, 
  {name: 'babylonian', bonusFirst: 6}, 
  {name: 'greek', bonusFirst: 4}, 
  {name: 'chinese', bonusFirst: 4}, 
  {name: 'egyptian', bonusFirst: 2}
];

// Base monument data (IDs only, names come from translations)
const BASE_MONUMENTS = [
  { id: 'menhir', workers: 3, points: [1, 0], effect: null, origin: 'celtic' },
  { id: 'stone_circle', workers: 5, points: [2, 1], effect: null, origin: 'celtic' },
  { id: 'stonehenge', workers: 10, points: [6, 4], effect: null, origin: 'celtic' },

  { id: 'step_pyramid', workers: 3, points: [1, 0], effect: null, origin: 'babylonian' },
  { id: 'ishtar_gate', workers: 10, points: [6, 4], effect: null, origin: 'babylonian' },
  { id: 'hanging_gardens', workers: 11, points: [8, 5], effect: null, origin: 'babylonian' },

  { id: 'temple', workers: 6, points: [3, 2], effect: null, origin: 'greek' },
  { id: 'delphi_oracle', workers: 15, points: [10, 6], effect: 'delphi_oracle', origin: 'greek' },
  { id: 'colossus', workers: 12, points: [9, 5], effect: null, origin: 'greek' },

  { id: 'heavenly_gate', workers: 7, points: [4, 3], effect: null, origin: 'chinese' },
  { id: 'great_wall', workers: 13, points: [10, 6], effect: 'great_wall', origin: 'chinese' },
  { id: 'forbidden_city', workers: 18, points: [12, 8], effect: null, origin: 'chinese' },

  { id: 'obelisk', workers: 8, points: [4, 3], effect: null, origin: 'egyptian' },
  { id: 'sphinx', workers: 12, points: [8, 5], effect: 'sphinx', origin: 'egyptian' },
  { id: 'great_pyramid', workers: 15, points: [10, 6], effect: 'great_pyramid', origin: 'egyptian' }
];

// Base development data (IDs only, names come from translations)
const BASE_DEVELOPMENTS = [
  { id: 'irrigation', prerequisite: null, cost: 10, points: 2 },
  { id: 'forestry', prerequisite: null, cost: 10, points: 1 },

  { id: 'agriculture', prerequisite: 'village', cost: 15, points: 3 },

  { id: 'quarrying', prerequisite: null, cost: 20, points: 3 },
  { id: 'medicine', prerequisite: null, cost: 20, points: 4 },
  { id: 'coinage', prerequisite: 'mine', cost: 20, points: 4 },
  { id: 'caravans', prerequisite: 'market', cost: 20, points: 4 },

  { id: 'smithing', prerequisite: null, cost: 25, points: 5 },
  { id: 'religion', prerequisite: null, cost: 25, points: 5 },

  { id: 'granaries', prerequisite: 'village', cost: 30, points: 6 },
  { id: 'masonry', prerequisite: null, cost: 30, points: 6 },

  { id: 'slavery', prerequisite: null, cost: 35, points: 6 },

  { id: 'engineering', prerequisite: null, cost: 40, points: 6 },
  { id: 'economy', prerequisite: null, cost: 40, points: 6, scoringMultiplier: 1 }, // 1 point per production building

  { id: 'commerce', prerequisite: 'metropolis', cost: 40, points: 8 },
  { id: 'architecture', prerequisite: 'metropolis', cost: 60, points: 8, scoringMultiplier: 1 }, // 1 point per monument
  { id: 'kingdom', prerequisite: 'metropolis', cost: 70, points: 10 },
  { id: 'ancientEmpire', prerequisite: 'metropolis', cost: 80, points: 10, scoringMultiplier: 10 } // 10 points per culture
];

export const ANCIENT_EMPIRES_CONFIG = {
  id: 'ancient_empires',
  name: 'Ancient Empires',
  displayName: 'Ancient Empires',

  // End game conditions - modified for this variant
  endGameConditions: {
    developmentCount: 8,
    allMonumentsBuilt: true,
    allMonumentsOfTwoCultures: true
  },

  // Solo mode: skulls can't be rerolled
  soloSkullsLocked: true,

  // Solo mode: maximum number of rounds
  soloMaxRounds: 12,

  useMetropolis: true,
  metropolis: METROPOLIS,
  productions: PRODUCTION,
  cultures: CULTURES,

  // Monument effects configuration
  monumentEffects: {
    starvationPrevention: null,        // No monument prevents starvation in original Ancient Empires
    disasterReduction: 'great_pyramid', // Great Pyramid gives -1 disaster
    resourceProtection: 'sphinx'        // Sphinx keeps 1 resource during revolt (5+ skulls)
  },

  // Monument restrictions - all monuments available for all player counts
  monumentRestrictions: {
    1: [],
    2: [],
    3: [],
    4: []
  },

  // Getter functions for translated data
  get monuments() {
    return getTranslatedMonuments(BASE_MONUMENTS, this.id);
  },

  get developments() {
    return getTranslatedDevelopments(BASE_DEVELOPMENTS, this.id);
  }
};
