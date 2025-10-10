/**
 * Composant pour afficher un dé individuel
 */
export default function DiceDisplay({
  result,
  index,
  isLocked,
  isDiceRolling,
  canToggle,
  isClickable,
  foodOrWorkerIndex,
  foodOrWorkerChoice,
  onToggleLock,
  onToggleFoodOrWorker
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

  return (
    <div
      key={index}
      className={'relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg ' +
        (isLocked && result.skulls > 0 ? 'ring-2 sm:ring-4 ring-red-500 ' :
         isLocked ? 'ring-2 sm:ring-4 ring-amber-500 ' : '')}
    >
      {isDiceRolling ? (
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={result.type}
          onClick={handleClick}
          className={'w-12 h-12 sm:w-16 sm:h-16 object-contain transition rounded-lg ' +
            (isClickable || canToggle ? 'cursor-pointer hover:opacity-80 active:opacity-60 ' : 'cursor-default ')}
        />
      )}
    </div>
  );
}
