export default function DisastersDisplay({ disasters }) {
  if (disasters === 0) return null;

  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Catastrophes</h3>
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-2">
        <div className="flex gap-0.5 flex-wrap mb-1">
          {Array(disasters).fill(0).map(function (_, i) {
            return (
              <div
                key={i}
                className="w-5 h-5 bg-red-600 border-2 border-red-700 rounded flex items-center justify-center text-white text-xs"
              >
                ☠
              </div>
            );
          })}
        </div>
        <div className="text-center text-red-700 font-bold text-sm">-{disasters} points</div>
      </div>
    </div>
  );
}
