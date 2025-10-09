export default function ActionButtons({
  onConfirm,
  onCancel,
  confirmLabel = "Valider",
  cancelLabel = "Annuler",
  confirmDisabled = false,
  cancelDisabled = false,
  confirmColor = "green",
  cancelColor = "gray",
  showCancel = true
}) {
  const confirmColorClasses = {
    green: 'bg-green-600 hover:bg-green-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  const cancelColorClasses = {
    gray: 'bg-gray-500 hover:bg-gray-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    red: 'bg-red-500 hover:bg-red-600'
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {showCancel && (
        <button
          onClick={onCancel}
          disabled={cancelDisabled}
          className={`h-24 rounded-lg font-bold text-xl text-white transition cursor-pointer flex items-center justify-center ${
            cancelDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : cancelColorClasses[cancelColor]
          }`}
        >
          {cancelLabel}
        </button>
      )}
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`h-24 rounded-lg font-bold text-xl text-white transition flex items-center justify-center ${
          confirmDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : confirmColorClasses[confirmColor] + ' cursor-pointer'
        } ${!showCancel ? 'col-span-2' : ''}`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
