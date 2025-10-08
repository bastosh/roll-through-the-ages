export const GOODS_TYPES = ['wood', 'stone', 'pottery', 'cloth', 'spearheads'];

export const GOODS_NAMES = {
  wood: 'Bois',
  stone: 'Pierre',
  pottery: 'Poterie',
  cloth: 'Vêtements',
  spearheads: 'Lances'
};

export const GOODS_COLORS = {
  wood: 'bg-amber-700',
  stone: 'bg-gray-500',
  pottery: 'bg-red-600',
  cloth: 'bg-blue-600',
  spearheads: 'bg-orange-600'
};

export const GOODS_VALUES = {
  wood: [0, 1, 3, 6, 10, 15, 21, 28, 36],
  stone: [0, 2, 6, 12, 20, 30, 42, 56],
  pottery: [0, 3, 9, 18, 30, 45, 63],
  cloth: [0, 4, 12, 24, 40, 60],
  spearheads: [0, 5, 15, 30, 50]
};

export const MONUMENTS = [
  { id: 'step_pyramid', name: 'Petite Pyramide', workers: 3, points: [1, 0], effect: null },
  { id: 'stone_circle', name: 'Stonehenge', workers: 5, points: [2, 1], effect: null },
  { id: 'temple', name: 'Temple', workers: 7, points: [4, 2], effect: null },
  { id: 'obelisk', name: 'Obélisque', workers: 9, points: [6, 3], effect: null },
  { id: 'hanging_gardens', name: 'Jardins suspendus', workers: 11, points: [8, 4], effect: null },
  { id: 'great_wall', name: 'Grande Muraille', workers: 13, points: [10, 5], effect: 'Les invasions ne vous affectent plus' },
  { id: 'great_pyramid', name: 'Grande Pyramide', workers: 15, points: [12, 6], effect: null }
];

export const DEVELOPMENTS = [
  { id: 'leadership', name: 'Leadership', cost: 10, points: 2, effect: 'Relancez 1 dé (après votre 3e lancer)' },
  { id: 'irrigation', name: 'Irrigation', cost: 10, points: 2, effect: 'La sécheresse ne vous affecte plus' },
  { id: 'agriculture', name: 'Agriculture', cost: 15, points: 3, effect: '+ 1 nourriture par dé Nourriture' },
  { id: 'quarrying', name: 'Carrière', cost: 15, points: 3, effect: '+1 pierre si vous collectez de la pierre' },
  { id: 'medicine', name: 'Médecine', cost: 15, points: 3, effect: 'La peste ne vous affecte plus' },
  { id: 'coinage', name: 'Monnaie', cost: 20, points: 4, effect: 'Les dés Pièce valent 12 pièces' },
  { id: 'caravans', name: 'Caravanes', cost: 20, points: 4, effect: 'Plus aucune ressource à défausser' },
  { id: 'religion', name: 'Religion', cost: 25, points: 6, effect: 'La révolte affecte vos adversaires' },
  { id: 'granaries', name: 'Greniers', cost: 30, points: 6, effect: 'Échangez 1 nourriture contre 4 pièces' },
  { id: 'masonry', name: 'Maçonnerie', cost: 30, points: 6, effect: '+1 ouvrier par dé Ouvriers' },
  { id: 'engineering', name: 'Ingénierie', cost: 40, points: 6, effect: 'Échangez 1 pierre contre 3 ouvriers' },
  { id: 'architecture', name: 'Architecture', cost: 50, points: 8, effect: '1 point de bonus par monument' },
  { id: 'empire', name: 'Empire', cost: 60, points: 8, effect: '1 point de bonus par cité' }
];

export const DICE_FACES = [
  { type: 'food', value: 3, skulls: 0 },
  { type: 'goods', value: 1, skulls: 0 },
  { type: 'goods', value: 2, skulls: 1 },
  { type: 'workers', value: 3, skulls: 0 },
  { type: 'food_or_workers', value: 2, skulls: 0 },
  { type: 'coins', value: 7, skulls: 0 }
];
