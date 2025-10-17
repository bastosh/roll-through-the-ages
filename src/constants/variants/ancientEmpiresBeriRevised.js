// Configuration for The Late Bronze Age expansion
import { getTranslatedMonuments, getTranslatedDevelopments } from './variantTranslations';

const METROPOLIS = {name: 'metropolis', workers: 10, points: 4}

const PRODUCTION = [
  {name: 'market', workers: {'3 cities': 8, '4 cities': 9, '5 cities': 10, '6 cities': 11, '7 cities': 12}, bonus: '1 good'},
  {name: 'mine', workers: {'3 cities': 6, '4 cities': 7, '5 cities': 8}, bonus: '1 coin'},
  {name: 'mine', workers: {'3 cities': 6, '4 cities': 7, '5 cities': 8}, bonus: '1 coin'},
  {name: 'village', workers: {'3 cities': 4, '4 cities': 5, '5 cities': 6}, bonus: '1 food'},
  {name: 'village', workers: {'3 cities': 4, '4 cities': 5, '5 cities': 6}, bonus: '1 food'},
  {name: 'village', workers: {'3 cities': 4, '4 cities': 5, '5 cities': 6}, bonus: '1 food'},
]

const CULTURES = [
  {name: 'celtic', bonusFirst: 6, bonusSecond: 3},
  {name: 'babylonian', bonusFirst: 6, bonusSecond: 3},
  {name: 'greek', bonusFirst: 6, bonusSecond: 3},
  {name: 'chinese', bonusFirst: 6, bonusSecond: 3},
  {name: 'egyptian', bonusFirst: 6, bonusSecond: 3}
];

// Base monument data (IDs only, names come from translations)
const BASE_MONUMENTS = [
  { id: 'menhir', workers: 3, points: [1, 0], effect: null, origin: 'celtic' },
  { id: 'stone_circle', workers: 5, points: [2, 1], effect: null, origin: 'celtic' },
  { id: 'stonehenge_1', workers: 6, points: [3, 2], effect: null, origin: 'celtic', monumentGroup: 'stonehenge' },
  { id: 'stonehenge_2', workers: 4, points: [3, 2], effect: null, origin: 'celtic', monumentGroup: 'stonehenge' },

  { id: 'step_pyramid', workers: 3, points: [1, 0], effect: null, origin: 'babylonian' },
  { id: 'ishtar_gate', workers: 10, points: [5, 3], effect: 'ishtar_gate', origin: 'babylonian' },
  { id: 'hanging_gardens', workers: 11, points: [8, 5], effect: null, origin: 'babylonian' },

  { id: 'temple', workers: 6, points: [3, 2], effect: null, origin: 'greek' },
  { id: 'delphi_oracle', workers: 15, points: [11, 8], effect: 'delphi_oracle', origin: 'greek' },
  { id: 'colossus', workers: 12, points: [9, 6], effect: null, origin: 'greek' },

  { id: 'heavenly_gate', workers: 7, points: [2, 1], effect: 'heavenly_gate', origin: 'chinese' },
  { id: 'great_wall', workers: 13, points: [9, 6], effect: 'great_wall', origin: 'chinese' },
  { id: 'forbidden_city', workers: 18, points: [16, 13], effect: null, origin: 'chinese' },

  { id: 'obelisk', workers: 8, points: [5, 3], effect: null, origin: 'egyptian' },
  { id: 'sphinx', workers: 12, points: [7, 5], effect: 'sphinx', origin: 'egyptian' },
  { id: 'great_pyramid', workers: 15, points: [10, 7], effect: 'great_pyramid', origin: 'egyptian' }
];

// Base development data (IDs only, names come from translations)
const BASE_DEVELOPMENTS = [
  { id: 'irrigation', discount: 'none', cost: 10, points: 2 },
  { id: 'forestry', discount: 'none', cost: 10, points: 2 },

  { id: 'agriculture', discount: 'village', cost: 15, points: 3 },
  { id: 'quarrying', discount: 'mine', cost: 15, points: 3 },

  { id: 'preservation', discount: 'village', cost: 20, points: 4 },
  { id: 'coinage', discount: 'mine', cost: 20, points: 4 },
  { id: 'caravans', discount: 'market', cost: 20, points: 4 },
  { id: 'medicine', discount: 'none', cost: '10 per player', points: 4 },

  { id: 'shipping', discount: 'market', cost: 25, points: 5 },
  { id: 'smithing', discount: 'colossus', cost: 25, points: 5 },
  { id: 'religion', discount: 'temple', cost: 25, points: 7 },

  { id: 'granaries', discount: 'village', cost: 30, points: 6 },
  { id: 'masonry', discount: 'none', cost: 30, points: 6 },
  { id: 'slavery', discount: 'mine', cost: 30, points: 6 },

  { id: 'engineering', discount: 'none', cost: 40, points: 6 },
  { id: 'economy', discount: 'none', cost: 40, points: 6, scoringMultiplier: 2 }, // 2 points per production building

  { id: 'commerce', prerequisite: 'metropolis', discount: 'market', cost: 40, points: 8 },
  { id: 'architecture', prerequisite: 'metropolis', discount: 'none', cost: 60, points: 8, scoringMultiplier: 1 }, // 1 point per monument
  { id: 'kingdom', prerequisite: 'metropolis', discount: 'none', cost: 70, points: 10 },
  { id: 'ancientEmpire', prerequisite: 'metropolis', discount: 'none', cost: 80, points: 10, scoringMultiplier: 'special' } // Special: 3pts/completed culture + 3pts/different culture
];

export const ANCIENT_EMPIRES_BERI_REVISED_CONFIG = {
  id: 'ancient_empires_beri_revised',
  name: 'Ancient Empires Beri Revised',
  displayName: 'Ancient Empires (v. Beri révisée)',

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

  // Monument effects configuration (inverted from Beri)
  monumentEffects: {
    starvationPrevention: 'great_pyramid', // Great Pyramid prevents starvation once per game
    disasterReduction: 'sphinx',           // Sphinx gives -1 disaster
    resourceProtection: null               // No resource protection in Beri Revised
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
