export default function CityDisplay({ cities, onBuildCity, canBuild, pendingWorkers }) {
  const allCities = [
    { built: true, progress: 3, requiredWorkers: 3, number: 1 },
    { built: true, progress: 3, requiredWorkers: 3, number: 2 },
    { built: true, progress: 3, requiredWorkers: 3, number: 3 },
    ...cities.map((city, i) => ({ ...city, number: i + 4, index: i }))
  ];

  return (
    <div className="flex-shrink-0">
      <h3 className="text-sm font-bold mb-2 text-gray-800">Cités</h3>
      <div className="flex gap-1.5">
        {allCities.map(function (city, i) {
          const height = city.requiredWorkers <= 4 ? 'h-16' : 'h-20';

          const isClickable = canBuild && !city.built && (pendingWorkers >= 1 || city.progress > 0);
          let containerClass = '';
          if (isClickable) {
            containerClass = 'cursor-pointer';
          }

          return (
            <div
              key={i}
              className={containerClass}
              onClick={isClickable ? () => onBuildCity(city.index) : undefined}
            >
              <div className={'border-2 rounded-lg flex flex-col items-center justify-start p-1.5 ' + height + ' ' + (
                city.built ? 'bg-green-100 border-green-600' : 'bg-gray-50 border-gray-300'
              ) + (isClickable ? ' hover:bg-blue-100 hover:border-blue-500' : '')}>
                {city.requiredWorkers > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {Array(city.requiredWorkers).fill(0).map(function (_, j) {
                      const isLastOdd = city.requiredWorkers % 2 === 1 && j === city.requiredWorkers - 1;
                      return (
                        <div
                          key={j}
                          className={'w-4 h-4 border border-gray-400 rounded ' + (
                            j < city.progress ? 'bg-blue-600' : 'bg-white'
                          ) + (isLastOdd ? ' col-span-2 mx-auto' : '')}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
