import { useState, useEffect } from 'react'
import { getSensors } from '../api/sensors'
import { CardSensors } from '../components/Cards'

function Sensors() {
    const [active, setActive] = useState([])
    const [outRange, setOutRange] = useState([])
    const [noData, setNoData] = useState([])
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [dataModal, setDataModal] = useState(null)

    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPosition, setFilterPosition] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        Promise.all([
            getSensors({ status: 'no_data'}),
            getSensors({ status: 'ok'}),
            getSensors({ status: 'out_of_range'})
        ]).then(([noDataRes, okRes, noRangeRes]) => {
            setNoData(noDataRes.data || [])
            setActive(okRes.data || [])
            const sortedOutRange = (noRangeRes.data || []).sort((a, b) => {
                if (!a.last_reading || !b.last_reading) return 0;
                const devA = Math.max(0, a.oxygen_min - a.last_reading.value, a.last_reading.value - a.oxygen_max)
                const devB = Math.max(0, b.oxygen_min - b.last_reading.value, b.last_reading.value - b.oxygen_max)
                return devB - devA
            })
            setOutRange(sortedOutRange)

        }).catch((err) => setError(err.message))
    }, [])

    const handleOpenModal = (siteData) => {
        setDataModal(siteData)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setDataModal(null)
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') handleCloseModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const applyFilters = (sensorsList) => {
        return sensorsList.filter((sensor) => {
            const matchPosition = filterPosition === 'all' || sensor.position === filterPosition
            const matchSearch = sensor.sensor_name.toLowerCase().includes(searchTerm.toLowerCase())
            return matchPosition && matchSearch
        })
    }

    if (error) return <p className="p-8 text-red-500">{error}</p>

    return (
        <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Sensores Registrados</h2>
                    <p className="text-gray-500 text-sm">Monitoreo de estado y mediciones</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[200px] flex-grow sm:flex-grow-0"
                    />
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[180px]"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="ok">Solo OK</option>
                        <option value="out_of_range">Solo Fuera de Rango</option>
                        <option value="no_data">Solo Sin Datos</option>
                    </select>
                    <select 
                        value={filterPosition}
                        onChange={(e) => setFilterPosition(e.target.value)}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[180px]"
                    >
                        <option value="all">Todas las Posiciones</option>
                        <option value="jaula">Jaula</option>
                        <option value="ponton">Ponton</option>
                    </select>
                </div>
            </div>
            {(filterStatus === 'all' || filterStatus === 'no_data') && (
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-gray-500 rounded-full"></span>
                        Estado: Sin datos ({applyFilters(noData).length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {applyFilters(noData).map((e) => (
                            <CardSensors key={e.id} data={e} onOpenModal={handleOpenModal} />
                        ))}
                        {applyFilters(noData).length === 0 && (
                            <p className="text-gray-500 text-sm">No hay sensores que coincidan con esta búsqueda.</p>
                        )}
                    </div>
                </div>
            )}
            {(filterStatus === 'all' || filterStatus === 'out_of_range') && (
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        Estado: Fuera de rango ({applyFilters(outRange).length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {applyFilters(outRange).map((e) => (
                            <CardSensors key={e.id} data={e} onOpenModal={handleOpenModal} />
                        ))}
                        {applyFilters(outRange).length === 0 && (
                            <p className="text-gray-500 text-sm">No hay sensores que coincidan con esta búsqueda.</p>
                        )}
                    </div>
                </div>
            )}
            {(filterStatus === 'all' || filterStatus === 'ok') && (
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                        Estado: OK ({applyFilters(active).length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {applyFilters(active).map((e) => (
                            <CardSensors key={e.id} data={e} onOpenModal={handleOpenModal} />
                        ))}
                        {applyFilters(active).length === 0 && (
                            <p className="text-gray-500 text-sm">No hay sensores que coincidan con esta búsqueda.</p>
                        )}
                    </div>
                </div>
            )}            
            {showModal && dataModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={handleCloseModal}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                {dataModal.sensor_name}
                                {!dataModal.transmitting && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Sin Señal</span>}
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-gray-700 dark:text-gray-300">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong className="block text-gray-500">ID Interno</strong> {dataModal.id}</div>
                                <div><strong className="block text-gray-500">Sitio Asignado</strong> ID: {dataModal.site_id}</div>
                                <div><strong className="block text-gray-500">Medición</strong> {dataModal.medition}</div>
                                <div><strong className="block text-gray-500">Posición</strong> {dataModal.position} ({dataModal.depth}m)</div>
                            </div>
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Lectura de Oxígeno</span>
                                    <span className={`font-bold ${dataModal.status === 'out_of_range' ? 'text-red-500' : 'text-green-500'}`}>
                                        {dataModal.last_reading?.value || '--'} mg/L
                                    </span>
                                </div>
                                
                                <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
                                    <div 
                                        className="absolute h-full bg-green-400 opacity-30" 
                                        style={{
                                            left: '20%',
                                            width: '60%'
                                        }}
                                    ></div>
                                    {dataModal.last_reading && (
                                        <div 
                                            className={`absolute top-0 h-full w-2 rounded-full ${dataModal.status === 'out_of_range' ? 'bg-red-500' : 'bg-green-600'}`}
                                            style={{
                                                left: `${Math.min(Math.max(((dataModal.last_reading.value - (dataModal.oxygen_min - 2)) / ((dataModal.oxygen_max + 2) - (dataModal.oxygen_min - 2))) * 100, 0), 100)}%`
                                            }}
                                        ></div>
                                    )}
                                </div>
                                
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Mín: {dataModal.oxygen_min}</span>
                                    <span>Rango Seguro</span>
                                    <span>Máx: {dataModal.oxygen_max}</span>
                                </div>
                                
                                <div className="text-xs text-center text-gray-500 mt-3 pt-3 border-t dark:border-gray-700">
                                    Última actualización: {dataModal.last_reading ? new Date(dataModal.last_reading.at).toLocaleString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                            <button 
                                onClick={handleCloseModal}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sensors