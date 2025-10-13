// Helper functions to generate translated dice text
export function getDiceText(result, hasAgriculture, hasMasonry, hasCoinage, t) {
  if (!result) return '';

  let text = result.value.toString();

  if (result.type === 'food') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    text = t('game.foodCount', { count: foodValue });
    if (hasAgriculture) text += ' ' + t('game.withBonus', { bonus: t('game.agriculture') });
  }

  if (result.type === 'goods') {
    text = result.value > 1 ? t('game.goodsCountPlural', { count: result.value }) : t('game.goodsCount', { count: result.value });
  }

  if (result.type === 'workers') {
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    text = workersValue > 1 ? t('game.workersCountPlural', { count: workersValue }) : t('game.workersCount', { count: workersValue });
    if (hasMasonry) text += ' ' + t('game.withBonus', { bonus: t('game.masonry') });
  }

  if (result.type === 'food_or_workers') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    text = t('game.foodOrWorkers', { food: foodValue, workers: workersValue });
    const bonuses = [];
    if (hasAgriculture) bonuses.push(t('game.agriculture'));
    if (hasMasonry) bonuses.push(t('game.masonry'));
    if (bonuses.length > 0) text += ' ' + t('game.withBonus', { bonus: bonuses.join(', ') });
  }

  if (result.type === 'coins') {
    const coinValue = result.value + (hasCoinage ? 5 : 0);
    text = t('game.coinsCount', { count: coinValue });
    if (hasCoinage) text += ' ' + t('game.withBonus', { bonus: t('game.coinage') });
  }

  return text;
}
