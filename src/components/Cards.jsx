export function CardSites({data, onOpenModal}) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                {data.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Código: {data.code}</p>
            
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button 
                    onClick={() => onOpenModal(data)}
                    className={data.active ? "px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-medium rounded-lg transition-colors":
                        "px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"}
                >
                    Ver detalles
                </button>
            </div>
        </div>
    )
}

export function CardSensors({ data, onOpenModal }) {
    const isOk = data.status === 'ok';
    const isOutOfRange = data.status === 'out_of_range';

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md uppercase">
                    {data.medition}
                </span>
                
                <span className={`flex items-center gap-1.5 text-xs font-bold ${
                    isOk ? 'text-green-600' : isOutOfRange ? 'text-red-500' : 'text-gray-500'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${
                        isOk ? 'bg-green-500' : isOutOfRange ? 'bg-red-500' : 'bg-gray-500'
                    }`}></span>
                    {data.status === 'ok' ? 'OK' : data.status === 'out_of_range' ? 'Fuera de rango' : 'Sin datos'}
                </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                {data.sensor_name}
            </h3>
            <div className="mt-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Última lectura:</p>
                <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">
                        {data.last_reading ? data.last_reading.value : '--'}
                    </span>
                    {data.medition === 'oxygen' && <span className="text-sm font-semibold text-gray-500 mb-0.5">mg/L</span>}
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button 
                    onClick={() => onOpenModal(data)}
                    className={data.status === 'ok' 
                        ? "px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-medium rounded-lg transition-colors"
                        : "px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"}
                >
                    Ver detalles
                </button>
            </div>
        </div>
    )
}