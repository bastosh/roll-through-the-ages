export function getDiceIcon(result, hasAgriculture, hasMasonry) {
  if (!result) return '?';

  let mainIcon = '';

  if (result.type === 'food') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    mainIcon = '🌾'.repeat(foodValue);
  } else if (result.type === 'goods') {
    if (result.skulls > 0 && result.value === 2) {
      return '🏺☠️🏺';
    }
    mainIcon = '🏺'.repeat(result.value);
  } else if (result.type === 'workers') {
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    mainIcon = '⚒️'.repeat(workersValue);
  } else if (result.type === 'food_or_workers') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    mainIcon = '🌾'.repeat(foodValue) + '/' + '⚒️'.repeat(workersValue);
  } else if (result.type === 'coins') {
    mainIcon = '💰';
  } else {
    mainIcon = '?';
  }

  if (result.skulls > 0 && result.type !== 'goods') {
    const skullIcon = '☠️'.repeat(result.skulls);
    return mainIcon + ' ' + skullIcon;
  }

  return mainIcon;
}

export function getDiceText(result, hasAgriculture, hasMasonry, hasCoinage) {
  if (!result) return '';
  let text = result.value.toString();
  if (result.type === 'food') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    text = foodValue + ' nourriture';
    if (hasAgriculture) text += ' (agriculture)';
  }
  if (result.type === 'goods') text = result.value + ' bien' + (result.value > 1 ? 's' : '');
  if (result.type === 'workers') {
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    text = workersValue + ' ouvrier' + (workersValue > 1 ? 's' : '');
    if (hasMasonry) text += ' (maçonnerie)';
  }
  if (result.type === 'food_or_workers') {
    const foodValue = result.value + (hasAgriculture ? 1 : 0);
    const workersValue = result.value + (hasMasonry ? 1 : 0);
    text = foodValue + ' nourriture OU ' + workersValue + ' ouvriers';
    const bonuses = [];
    if (hasAgriculture) bonuses.push('agriculture');
    if (hasMasonry) bonuses.push('maçonnerie');
    if (bonuses.length > 0) text += ' (' + bonuses.join(', ') + ')';
  }
  if (result.type === 'coins') {
    const coinValue = result.value + (hasCoinage ? 5 : 0);
    text = coinValue + ' pièces';
    if (hasCoinage) text += ' (monnaie)';
  }
  return text;
}

export default function DiceDisplay({ result, hasAgriculture, hasMasonry, hasCoinage, isSelected, size = 'normal' }) {
  const sizeClasses = {
    small: 'w-12 h-12 text-2xl',
    normal: 'w-16 h-16 text-3xl',
    large: 'aspect-square text-4xl'
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex flex-col items-center justify-center font-bold border-4 ${
        isSelected
          ? 'bg-amber-200 border-amber-500'
          : 'bg-gray-100 border-gray-300'
      }`}
    >
      <div className="mb-1">{getDiceIcon(result, hasAgriculture, hasMasonry)}</div>
      {size !== 'small' && (
        <div className="text-xs text-gray-600 text-center px-1">
          {getDiceText(result, hasAgriculture, hasMasonry, hasCoinage)}
        </div>
      )}
    </div>
  );
}
