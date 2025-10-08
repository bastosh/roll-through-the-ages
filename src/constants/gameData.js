// Re-export common game data for backward compatibility
export {
  GOODS_TYPES,
  GOODS_NAMES,
  GOODS_COLORS,
  GOODS_VALUES,
  DICE_FACES
} from './commonGameData';

// Note: MONUMENTS and DEVELOPMENTS are now variant-specific
// Import them from the variant configuration instead:
// import { getVariantById } from './variants';
// const variant = getVariantById('bronze_age');
// const MONUMENTS = variant.monuments;
// const DEVELOPMENTS = variant.developments;
