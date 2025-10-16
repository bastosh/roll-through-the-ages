/**
 * Composant pour afficher un dé individuel
 */
export default function DiceDisplay({
  result,
  index,
  isLocked,
  canToggle,
  isClickable,
  foodOrWorkerIndex,
  foodOrWorkerChoice,
  isRolling,
  onToggleLock,
  onToggleFoodOrWorker,
  leadershipMode
}) {
  // Déterminer l'image de la face du dé
  let imageSrc = '';

  if (foodOrWorkerIndex !== -1 && foodOrWorkerChoice !== undefined) {
    const choice = foodOrWorkerChoice;
    if (choice === 'none') {
      imageSrc = '/src/assets/food-workers.png';
    } else if (choice === 'food') {
      imageSrc = '/src/assets/food-selection.png';
    } else if (choice === 'workers') {
      imageSrc = '/src/assets/worker-selection.png';
    }
  } else if (result.type === 'food') {
    imageSrc = result.wasChoice ? '/src/assets/food-selection.png' : '/src/assets/food.png';
  } else if (result.type === 'goods') {
    if (result.skulls > 0 && result.value === 2) {
      imageSrc = '/src/assets/crane-goods.png';
    } else {
      imageSrc = '/src/assets/good.png';
    }
  } else if (result.type === 'workers') {
    imageSrc = result.wasChoice ? '/src/assets/worker-selection.png' : '/src/assets/workers.png';
  } else if (result.type === 'food_or_workers') {
    imageSrc = '/src/assets/food-workers.png';
  } else if (result.type === 'coins') {
    imageSrc = '/src/assets/coin.png';
  }

  function handleClick() {
    if (isClickable && onToggleFoodOrWorker) {
      onToggleFoodOrWorker(foodOrWorkerIndex);
    } else if (canToggle && onToggleLock) {
      onToggleLock(index);
    }
  }

  // Afficher le ring uniquement si le dé est verrouillé
  // En mode Leadership : verrouillé = ne sera PAS relancé, déverrouillé = sera relancé
  // Couleur : rouge pour les crânes, ambre pour les autres
  let ringClass = '';
  if (isLocked) {
    const ringColor = result.skulls > 0 ? 'ring-red-500' : 'ring-amber-500';
    ringClass = 'ring-2 sm:ring-4 ' + ringColor;
  }

  // Appliquer l'animation de lancer uniquement aux dés non verrouillés pendant le lancer
  const shouldAnimate = isRolling && !isLocked;
  const animationClass = shouldAnimate ? 'animate-dice-roll ' : '';

  return (
    <div
      key={index}
      className={'relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden ' + ringClass}
    >
      <img
        src={imageSrc}
        alt={result.type}
        onClick={handleClick}
        className={'w-12 h-12 sm:w-16 sm:h-16 object-contain transition rounded-lg ' +
          animationClass +
          (isClickable || canToggle ? 'cursor-pointer hover:opacity-80 active:opacity-60 ' : 'cursor-default ')}
      />
    </div>
  );
}
