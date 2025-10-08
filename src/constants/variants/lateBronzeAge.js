// Configuration for The Late Bronze Age expansion

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
  soloSkullsLocked: false,

  // Monument restrictions - all monuments available for all player counts
  monumentRestrictions: {
    1: [],
    2: [],
    3: [],
    4: []
  },

  // Monuments configuration (same as base game for now)
  monuments: [
    { id: 'step_pyramid', name: 'Petite Pyramide', workers: 3, points: [1, 0], effect: null },
    { id: 'stone_circle', name: 'Stonehenge', workers: 5, points: [2, 1], effect: null },
    { id: 'temple', name: 'Temple', workers: 7, points: [4, 3], effect: null },
    { id: 'obelisk', name: 'Obélisque', workers: 9, points: [6, 4], effect: null },
    { id: 'hanging_gardens', name: 'Jardins suspendus', workers: 11, points: [8, 5], effect: null },
    { id: 'great_wall', name: 'Grande Muraille', workers: 13, points: [10, 6], effect: 'Les invasions ne vous affectent plus' },
    { id: 'great_pyramid', name: 'Grande Pyramide', workers: 15, points: [12, 8], effect: null }
  ],

  // Developments configuration - Late Bronze Age variant
  developments: [
    // Base developments (unchanged)
    { id: 'leadership', name: 'Leadership', cost: 10, points: 2, effect: 'Relancez 1 dé (après votre 3e lancer)' },
    { id: 'irrigation', name: 'Irrigation', cost: 10, points: 2, effect: 'La sécheresse ne vous affecte plus' },
    { id: 'agriculture', name: 'Agriculture', cost: 15, points: 3, effect: '+ 1 nourriture par dé Nourriture' },
    { id: 'quarrying', name: 'Carrière', cost: 15, points: 3, effect: '+1 pierre si vous collectez de la pierre' },

    // Medicine - adjusted: cost 20 (was 15), points 4 (was 3)
    { id: 'medicine', name: 'Médecine', cost: 20, points: 4, effect: 'La peste ne vous affecte plus' },

    // Preservation - NEW development
    { id: 'preservation', name: 'Conservation', cost: 20, points: 4, effect: 'Dépensez 1 Poterie pour doubler votre nourriture' },

    // Base developments (unchanged)
    { id: 'coinage', name: 'Monnaie', cost: 20, points: 4, effect: 'Les dés Pièce valent 12 pièces' },
    { id: 'caravans', name: 'Caravanes', cost: 20, points: 4, effect: 'Plus aucune ressource à défausser' },

    // Religion - adjusted: cost 25 (was 20), points 7 (was 5)
    { id: 'religion', name: 'Religion', cost: 25, points: 7, effect: 'La révolte affecte vos adversaires' },

    // Smithing - NEW development
    { id: 'smithing', name: 'Forge', cost: 25, points: 5, effect: 'Invasion: -4 pts aux adversaires. Dépensez des Lances pour -2 pts/lance' },

    // Shipping - NEW development
    { id: 'shipping', name: 'Navigation', cost: 25, points: 5, effect: 'Construisez des navires (1 Bois + 1 Tissu). Échangez des ressources' },

    // Granaries - adjusted: cost 30 (unchanged), effect changed to 6 coins (was 4)
    { id: 'granaries', name: 'Greniers', cost: 30, points: 6, effect: 'Échangez 1 nourriture contre 6 pièces' },

    // Base developments (unchanged)
    { id: 'masonry', name: 'Maçonnerie', cost: 30, points: 6, effect: '+1 ouvrier par dé Ouvriers' },

    // Commerce - NEW development
    { id: 'commerce', name: 'Commerce', cost: 40, points: 8, effect: '8 points + 1 point par ressource en fin de partie' },

    // Base development (unchanged)
    { id: 'engineering', name: 'Ingénierie', cost: 40, points: 6, effect: 'Échangez 1 pierre contre 3 ouvriers' },

    // Architecture - adjusted: cost 60 (was 50), effect 2 points/monument (was 1)
    { id: 'architecture', name: 'Architecture', cost: 60, points: 8, effect: '2 points de bonus par monument' },

    // Empire - adjusted: cost 70 (was 60), points 10 (was 8)
    { id: 'empire', name: 'Empire', cost: 70, points: 10, effect: '1 point de bonus par cité' }
  ]
};
