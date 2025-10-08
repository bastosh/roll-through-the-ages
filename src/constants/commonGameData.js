// Common game data shared across all variants

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

export const DICE_FACES = [
  { type: 'food', value: 3, skulls: 0 },
  { type: 'goods', value: 1, skulls: 0 },
  { type: 'goods', value: 2, skulls: 1 },
  { type: 'workers', value: 3, skulls: 0 },
  { type: 'food_or_workers', value: 2, skulls: 0 },
  { type: 'coins', value: 7, skulls: 0 }
];
