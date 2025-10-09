import { GOODS_VALUES, GOODS_COLORS } from '../../constants/gameData';

export default function GoodsTrack({
  type,
  position,
  isSelected = false,
  onClick = null,
  showEmptySlots = false
}) {
  const maxForType = GOODS_VALUES[type].length - 1;
  const isClickable = onClick !== null;

  return (
    <div className="flex-1 flex gap-1">
      {GOODS_VALUES[type].map(function(val, idx) {
        if (idx === 0) return null;

        const isFilled = idx <= position;
        const showEmpty = showEmptySlots && idx > position;

        return (
          <div
            key={idx}
            className="flex flex-col items-center"
          >
            <div
              className={'w-5 h-6 border-2 rounded transition ' + (
                showEmpty ? 'bg-white border-gray-300' :
                isSelected ? 'bg-white border-gray-400' :
                isFilled ? GOODS_COLORS[type] + ' border-gray-700' :
                'bg-white border-gray-300'
              )}
            />
            <div className={'text-xs mt-0.5 ' + (showEmpty ? 'text-gray-400' : 'text-gray-500')}>
              {val}
            </div>
          </div>
        );
      })}
    </div>
  );
}
