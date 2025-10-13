// Helper functions to get translated monument and development data
import i18n from '../../i18n/config';

export function getTranslatedMonuments(baseMonuments) {
  return baseMonuments.map(function(monument) {
    return {
      ...monument,
      name: i18n.t('monuments.' + monument.id),
      effect: monument.effect ? i18n.t('monumentEffects.' + monument.id) : null
    };
  });
}

export function getTranslatedDevelopments(baseDevelopments) {
  return baseDevelopments.map(function(dev) {
    // Handle special cases with dynamic values based on cost/points
    let effect;

    if (dev.id === 'granaries') {
      // Detect variant: 30 cost with 6 points = 6 coins, otherwise 4 coins
      const coins = dev.cost === 30 && dev.points === 6 ? 6 : 4;
      effect = i18n.t('developmentEffects.granaries', { count: coins });
    } else if (dev.id === 'architecture') {
      // Detect variant: 60 cost = 2 bonus points, 50 cost = 1 bonus point
      const bonus = dev.cost === 60 ? 2 : 1;
      effect = i18n.t('developmentEffects.architecture', { count: bonus });
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
