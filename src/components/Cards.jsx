import { mapMedition } from "../api/mappings"

export function CardSites({data, onOpenModal}) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-blue-600 hover:cursor-pointer transition-all rounded-xl p-5" onClick={() => onOpenModal(data)}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0">
                {data.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Código: {data.code}</p>
        </div>
    )
}

export const SensorDetailCard = ({ sensor }) => (
    <div className={`p-3 rounded-lg border text-sm shadow-sm transition-all ${
        sensor.status === 'out_of_range' 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
    ${
        sensor.status === 'no_data'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
        <div className="flex justify-between items-start mb-3">
            <div>
                <span className="font-bold text-gray-900 dark:text-white text-base">
                    {sensor.sensor_name}
                </span>
                <span className="block text-xs text-gray-500 uppercase mt-0.5">
                    {mapMedition(sensor.medition)}
                </span>
            </div>
            <div className="text-right">
                <span className={`text-lg font-bold ${
                    sensor.status === 'ok' ? 'text-green-600' : 
                    sensor.status === 'out_of_range' ? 'text-red-600' : 'text-gray-500'
                }`}>
                    {sensor.last_reading ? sensor.last_reading.value : '--'}
                </span>
                {sensor.medition === 'oxygen' && <span className="text-gray-500 ml-1">mg/L</span>}
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded">
            <p>Rango: <span className="font-medium text-gray-900 dark:text-gray-300">{sensor.oxygen_min} - {sensor.oxygen_max}</span></p>
            <p>Profundidad: <span className="font-medium text-gray-900 dark:text-gray-300">{sensor.depth}m</span></p>
            <p className="col-span-2 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${sensor.transmitting ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {sensor.transmitting ? 'Transmitiendo' : 'Sin señal'}
                </span>
                <span>
                    {sensor.last_reading?.at 
                        ? new Date(sensor.last_reading.at).toLocaleDateString() 
                        : 'Sin registro'}
                </span>
            </p>
        </div>
    </div>
)

export function CardSensors({ data, onOpenModal }) {
    const isOk = data.status === 'ok';
    const isOutOfRange = data.status === 'out_of_range';

    return (
        <div className={`bg-white dark:bg-gray-800 border rounded-xl p-5 hover:shadow-md dark:hover:shadow-blue-600 hover:cursor-pointer transition-all ${
            isOutOfRange ? 'border-red-400 dark:border-red-600 bg-red-50/10' : 'border-gray-200 dark:border-gray-700'
        }`} onClick={() => onOpenModal(data)}>
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md uppercase">
                    {mapMedition(data.medition)}
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
            <p className="text-xs text-gray-500 mt-1 mb-2">
                Rango seguro: {data.oxygen_min} - {data.oxygen_max} mg/L
            </p>

            <div className={`mt-3 p-3 rounded-lg border ${
                isOutOfRange ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700'
            }`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Última lectura</p>
                <div className="flex items-end gap-1">
                    <span className={`text-2xl font-bold leading-none ${
                        isOutOfRange ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'
                    }`}>
                        {data.last_reading ? data.last_reading.value : '--'}
                    </span>
                    {data.medition === 'oxygen' && <span className="text-sm font-semibold text-gray-500 mb-0.5">mg/L</span>}
                </div>
            </div>
        </div>
    )
}
