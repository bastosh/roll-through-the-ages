/**
 * Affiche les informations de catastrophe (disaster) : icône, label, effet.
 * Props :
 *   - skulls: nombre de crânes (int)
 *   - label: nom de la catastrophe (string)
 *   - effect: description de l'effet (string)
 *   - isAvoided: boolean indiquant si la catastrophe est évitée (optionnel)
 */
export default function DisasterInfo({ skulls, label, effect, isAvoided = false }) {
  if (!skulls || !label) return null;

  const boxClass = isAvoided
    ? 'px-2 py-1 rounded bg-green-100 border border-green-400 flex flex-col min-w-[120px]'
    : 'px-2 py-1 rounded bg-red-100 border border-red-400 flex flex-col min-w-[120px]';
  const labelClass = isAvoided ? 'font-bold text-green-700' : 'font-bold text-red-700';
  const effectClass = isAvoided ? 'text-xs text-green-700 mt-1' : 'text-xs text-red-700 mt-1';
  return (
    <div className={boxClass}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{'\u{1F480}'.repeat(skulls)}</span>
        <span className={labelClass}>{label}</span>
      </div>
      {effect && (
        <span className={effectClass}>{effect}</span>
      )}
    </div>
  );
}
