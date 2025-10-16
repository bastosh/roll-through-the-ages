// Helper functions to get translated monument and development data
import i18n from '../../i18n/config';

export function getTranslatedMonuments(baseMonuments, variantId = null) {
  return baseMonuments.map(function(monument) {
    let effectText = null;
    if (monument.effect) {
      // Try to get variant-specific effect first
      const effectKey = 'monumentEffects.' + monument.id;
      const effectData = i18n.t(effectKey, { returnObjects: true });

      if (typeof effectData === 'object' && effectData !== null) {
        // Check if variant-specific effect exists
        if (variantId && effectData[variantId]) {
          effectText = effectData[variantId];
        } else {
          // Fallback to default
          effectText = effectData.default || effectData;
        }
      } else {
        // Old string format (backward compatibility)
        effectText = effectData;
      }
    }

    return {
      ...monument,
      name: i18n.t('monuments.' + monument.id),
      effect: effectText
    };
  });
}

export function getTranslatedDevelopments(baseDevelopments, variantId = null) {
  return baseDevelopments.map(function(dev) {
    // Handle special cases with dynamic values based on scoringMultiplier or cost/points
    let effect;

    if (dev.id === 'granaries') {
      // Detect variant: 30 cost with 6 points = 6 coins, otherwise 4 coins
      const coins = dev.cost === 30 && dev.points === 6 ? 6 : 4;
      effect = i18n.t('developmentEffects.granaries', { count: coins });
    } else if (dev.id === 'architecture') {
      // Use scoringMultiplier if defined, otherwise fallback to heuristic
      const bonus = dev.scoringMultiplier !== undefined
        ? dev.scoringMultiplier
        : (dev.cost === 60 ? 2 : 1);

      // Variant-specific effect for Architecture
      const effectKey = 'developmentEffects.architecture';
      const effectData = i18n.t(effectKey, { returnObjects: true });

      if (typeof effectData === 'object' && effectData !== null && !effectData.hasOwnProperty('count')) {
        // Check if variant-specific effect exists
        if (variantId && effectData[variantId]) {
          effect = i18n.t(effectKey + '.' + variantId, { count: bonus });
        } else {
          // Fallback to default
          effect = i18n.t(effectKey + '.default', { count: bonus });
        }
      } else {
        // Old string format (backward compatibility)
        effect = i18n.t(effectKey, { count: bonus });
      }
    } else if (dev.id === 'economy') {
      // Use scoringMultiplier if defined, otherwise default to 2
      const bonus = dev.scoringMultiplier !== undefined ? dev.scoringMultiplier : 2;
      effect = i18n.t('developmentEffects.economy', { count: bonus });
    } else if (dev.id === 'ancientEmpire') {
      // Use scoringMultiplier if defined, otherwise default to 9
      const bonus = dev.scoringMultiplier !== undefined ? dev.scoringMultiplier : 9;
      effect = i18n.t('developmentEffects.ancientEmpire', { count: bonus });
    } else if (dev.id === 'slavery') {
      // Variant-specific effect for Slavery
      const effectKey = 'developmentEffects.slavery';
      const effectData = i18n.t(effectKey, { returnObjects: true });

      if (typeof effectData === 'object' && effectData !== null) {
        // Check if variant-specific effect exists
        if (variantId && effectData[variantId]) {
          effect = effectData[variantId];
        } else {
          // Fallback to default
          effect = effectData.default || effectData;
        }
      } else {
        // Old string format (backward compatibility)
        effect = effectData;
      }
    } else {
      effect = i18n.t('developmentEffects.' + dev.id);
    }

    return {
      ...dev,
      name: i18n.t('developments.' + dev.id),
      effect: effect
    };
  });
}
