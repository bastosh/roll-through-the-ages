// Central registry of all game variants

import { BRONZE_AGE_CONFIG } from './bronzeAge';
import { BRONZE_AGE_2024_CONFIG } from './bronzeAge2024';
import { LATE_BRONZE_AGE_CONFIG } from './lateBronzeAge';

export const VARIANTS = [
  BRONZE_AGE_CONFIG,
  BRONZE_AGE_2024_CONFIG,
  LATE_BRONZE_AGE_CONFIG
];

export function getVariantById(variantId) {
  for (let i = 0; i < VARIANTS.length; i++) {
    if (VARIANTS[i].id === variantId) {
      return VARIANTS[i];
    }
  }
  return BRONZE_AGE_CONFIG; // Default fallback
}

// Export individual variants for direct access
export { BRONZE_AGE_CONFIG, BRONZE_AGE_2024_CONFIG, LATE_BRONZE_AGE_CONFIG };
