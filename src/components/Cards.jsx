import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSite } from '../api/sites'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

export function CardSites({ data, onOpenModal }) {
    const [summary, setSummary] = useState({ ok: 0, out_of_range: 0, no_data: 0, total: 0 })
    const [loadingSensors, setLoadingSensors] = useState(true)

    useEffect(() => {
        let isMounted = true;
        
        const fetchSensorsForCard = async () => {
            try {
                const response = await getSite(data.id)
                if (!isMounted) return
                
                const siteData = response.data || response
                let ok = 0, out_of_range = 0, no_data = 0
                
                if (siteData.sensors) {
                    siteData.sensors.forEach(sensor => {
                        if (sensor.status === 'ok') ok++;
                        else if (sensor.status === 'out_of_range') out_of_range++
                        else if (sensor.status === 'no_data') no_data++
                    });
                }
                
                setSummary({ ok, out_of_range, no_data, total: siteData.sensors?.length || 0 })
            } catch (error) {
                console.error(`Error cargando sensores para el sitio ${data.id}`, error)
            } finally {
                if (isMounted) setLoadingSensors(false)
            }
        };

        fetchSensorsForCard();
        return () => { isMounted = false; }
    }, [data.id])

    const hasAlerts = summary.out_of_range > 0 || summary.no_data > 0

    return (
        <div 
            onClick={() => onOpenModal(data)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all rounded-xl p-5 cursor-pointer group flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white m-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {data.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold uppercase ${data.active ? 'bg-green-500' : 'bg-red-500'}`}>
                        {data.active ? 'OK' : 'Inactivo'}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{data.area}</p>
            </div>
            
            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    {loadingSensors ? (
                        <span className="text-xs text-gray-400 flex items-center gap-2 animate-pulse">
                            <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            Verificando sensores...
                        </span>
                    ) : summary.total === 0 ? (
                        <span className="text-xs text-gray-400">Sin sensores</span>
                    ) : (
                        <div className="flex gap-2">
                            {summary.ok > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md border border-green-100 dark:border-green-800">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {summary.ok}
                                </span>
                            )}
                            {summary.out_of_range > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md border border-red-100 dark:border-red-800">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {summary.out_of_range}
                                </span>
                            )}
                            {summary.no_data > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                    {summary.no_data}
                                </span>
                            )}
                        </div>
                    )}
                    
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver detalles &rarr;
                    </span>
                </div>
            </div>
        </div>
    )
}

export function SiteDetailedModalContent({ detailedData, onClose }) {
    const navigate = useNavigate()
    let sensorSummary = { ok: 0, out_of_range: 0, no_data: 0 }
    if (detailedData && detailedData.sensors) {
        detailedData.sensors.forEach(sensor => {
            if (sensor.status === 'ok') sensorSummary.ok++
            else if (sensor.status === 'out_of_range') sensorSummary.out_of_range++
            else if (sensor.status === 'no_data') sensorSummary.no_data++
        });
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white m-0">
                        {detailedData.name}
                    </h3>
                    <span className={`text-xs px-3 py-1 rounded-full text-white font-medium ${detailedData.active ? 'bg-green-500' : 'bg-red-500'}`}>
                        {detailedData.active ? 'Operativo' : 'Inactivo'}
                    </span>
                    <span className="text-sm text-gray-500">{detailedData.area}</span>
                </div>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold leading-none"
                >
                    &times;
                </button>
            </div>
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-5 gap-6">
                <div className="md:w-1/3 flex flex-col space-y-6 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm border-b dark:border-gray-700 pb-2">Resumen de Sensores</h4>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span>OK</span>
                                <span className="font-bold text-gray-900 dark:text-white">{sensorSummary.ok}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span>Fuera de Rango</span>
                                <span className="font-bold text-gray-900 dark:text-white">{sensorSummary.out_of_range}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-500"></span>Sin Datos</span>
                                <span className="font-bold text-gray-900 dark:text-white">{sensorSummary.no_data}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate(`/sensors?site_id=${detailedData.id}`)}
                            className="mt-5 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Ver Todos los Sensores
                        </button>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-64 shrink-0">
                        <MapContainer center={[detailedData.latitude, detailedData.longitude]} zoom={8} scrollWheelZoom={false} style={{height: '100%', width: '100%'}}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[detailedData.latitude, detailedData.longitude]}>
                                <Popup>
                                    Latitud: {detailedData.latitude}<br/>
                                    Longitud: {detailedData.longitude}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
                <div className="md:w-2/3 flex flex-col bg-gray-50/50 dark:bg-gray-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-3 mb-4">
                        Detalle de Sensores Instalados ({detailedData.sensors?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 overflow-y-auto pr-2 max-h-[60vh]">
                        {detailedData.sensors && detailedData.sensors.length > 0 ? (
                            detailedData.sensors.map((sensor) => (
                                <SensorDetailCard key={sensor.id} sensor={sensor} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No hay sensores registrados en este centro.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const SensorDetailCard = ({ sensor }) => (
    <div className={`p-3 rounded-lg border text-sm shadow-sm transition-all ${
        sensor.status === 'out_of_range' 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
        <div className="flex justify-between items-start mb-3">
            <div>
                <span className="font-bold text-gray-900 dark:text-white text-base">
                    {sensor.sensor_name}
                </span>
                <span className="block text-xs text-gray-500 uppercase mt-0.5">
                    {sensor.medition}
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
    const isOk = data.status === 'ok'
    const isOutOfRange = data.status === 'out_of_range'

    return (
        <div className={`bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
            isOutOfRange 
                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-gray-800' 
                : 'border-gray-300 dark:border-gray-700'
        }`}>
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
            <p className="text-xs text-gray-500 mt-1 mb-2">
                Rango seguro: {data.oxygen_min} - {data.oxygen_max} mg/L
            </p>
            <div className={`mt-3 p-3 rounded-lg border ${
                isOutOfRange 
                    ? 'bg-white dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
            }`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Última lectura:</p>
                <div className="flex items-end gap-1">
                    <span className={`text-2xl font-bold leading-none ${
                        isOutOfRange ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'
                    }`}>
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