// Configuration for The Bronze Age (2024 Edition)

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

  // Monument restrictions based on player count
  monumentRestrictions: {
    1: [],
    2: ['temple', 'great_pyramid'],
    3: ['hanging_gardens'],
    4: []
  },

  // Monuments configuration (same as base game)
  monuments: [
    { id: 'step_pyramid', name: 'Petite Pyramide', workers: 3, points: [1, 0], effect: null },
    { id: 'stone_circle', name: 'Stonehenge', workers: 5, points: [2, 1], effect: null },
    { id: 'temple', name: 'Temple', workers: 7, points: [4, 3], effect: null },
    { id: 'obelisk', name: 'Obélisque', workers: 9, points: [6, 4], effect: null },
    { id: 'hanging_gardens', name: 'Jardins suspendus', workers: 11, points: [8, 5], effect: null },
    { id: 'great_wall', name: 'Grande Muraille', workers: 13, points: [10, 6], effect: 'Les invasions ne vous affectent plus' },
    { id: 'great_pyramid', name: 'Grande Pyramide', workers: 15, points: [12, 8], effect: null }
  ],

  // Developments configuration with 2024 adjustments
  developments: [
    { id: 'leadership', name: 'Leadership', cost: 10, points: 2, effect: 'Relancez 1 dé (après votre 3e lancer)' },
    { id: 'irrigation', name: 'Irrigation', cost: 10, points: 2, effect: 'La sécheresse ne vous affecte plus' },
    { id: 'agriculture', name: 'Agriculture', cost: 15, points: 3, effect: '+ 1 nourriture par dé Nourriture' },
    { id: 'quarrying', name: 'Carrière', cost: 15, points: 3, effect: '+1 pierre si vous collectez de la pierre' },
    { id: 'medicine', name: 'Médecine', cost: 20, points: 4, effect: 'La peste ne vous affecte plus' },
    { id: 'coinage', name: 'Monnaie', cost: 20, points: 4, effect: 'Les dés Pièce valent 12 pièces' },
    { id: 'caravans', name: 'Caravanes', cost: 20, points: 4, effect: 'Plus aucune ressource à défausser' },
    { id: 'religion', name: 'Religion', cost: 25, points: 7, effect: 'La révolte affecte vos adversaires' },
    { id: 'granaries', name: 'Greniers', cost: 30, points: 6, effect: 'Échangez 1 nourriture contre 6 pièces' },
    { id: 'masonry', name: 'Maçonnerie', cost: 30, points: 6, effect: '+1 ouvrier par dé Ouvriers' },
    { id: 'engineering', name: 'Ingénierie', cost: 40, points: 6, effect: 'Échangez 1 pierre contre 3 ouvriers' },
    { id: 'architecture', name: 'Architecture', cost: 60, points: 8, effect: '2 points de bonus par monument' },
    { id: 'empire', name: 'Empire', cost: 70, points: 10, effect: '1 point de bonus par cité' }
  ]
};
