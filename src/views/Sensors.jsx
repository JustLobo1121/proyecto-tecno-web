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

    useEffect(() => {
        Promise.all([
            getSensors({ status: 'no_data'}),
            getSensors({ status: 'ok'}),
            getSensors({ status: 'out_of_range'})
        ]).then(([noData, ok, noRange]) => {
            setNoData(noData.data || [])
            setActive(ok.data || [])
            setOutRange(noRange.data || [])
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

    if (error) return <p className="p-8 text-red-500">{error}</p>

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Sensores Registrados</h2>
                    <p className="text-gray-500 text-sm">Monitoreo de estado y mediciones</p>
                </div>
                <div className="flex gap-3">
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
                        Estado: Sin datos ({noData.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {noData
                            .filter((e) => filterPosition === 'all' || e.position === filterPosition)
                            .map((e) => (
                                <CardSensors key={e.id} data={e} onOpenModal={handleOpenModal} />
                            ))
                        }
                        {noData.filter((e) => filterPosition === 'all' || e.position === filterPosition).length === 0 && (
                            <p className="text-gray-500 text-sm">No hay sensores que coincidan con esta búsqueda.</p>
                        )}
                    </div>
                </div>
            )}
            {(filterStatus === 'all' || filterStatus === 'out_of_range') && (
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        Estado: Fuera de rango ({outRange.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {outRange
                            .filter((e) => filterPosition === 'all' || e.position === filterPosition)
                            .map((e) => (
                                <CardSensors key={e.id} data={e} onOpenModal={handleOpenModal} />
                            ))
                        }
                        {outRange.filter((e) => filterPosition === 'all' || e.position === filterPosition).length === 0 && (
                            <p className="text-gray-500 text-sm">No hay sensores que coincidan con esta búsqueda.</p>
                        )}
                    </div>
                </div>
            )}
            {(filterStatus === 'all' || filterStatus === 'ok') && (
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                        Estado: OK ({active.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {active
                            .filter((e) => filterPosition === 'all' || e.position === filterPosition)
                            .map((e) => (
                                <CardSensors key={e.id} data={e} onOpenModal={handleOpenModal} />
                            ))
                        }
                        {active.filter((e) => filterPosition === 'all' || e.position === filterPosition).length === 0 && (
                            <p className="text-gray-500 text-sm">No hay sensores que coincidan con esta búsqueda.</p>
                        )}
                    </div>
                </div>
            )}            
            {showModal && dataModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-white">
                                {dataModal.sensor_name}
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-5 space-y-3 text-gray-700 dark:text-gray-300">
                            <p><strong>ID Interno:</strong> {dataModal.id} (Sitio: {dataModal.site_id})</p>
                            <p><strong>Tipo de medición:</strong> {dataModal.medition}</p>
                            <p><strong>Posición:</strong> {dataModal.position} (Profundidad: {dataModal.depth}m)</p>
                            <p><strong>Rango permitido:</strong> {dataModal.oxygen_min} - {dataModal.oxygen_max}</p>
                            <p><strong>Transmitiendo:</strong> {dataModal.transmitting ? 'Sí' : 'No'}</p>
                            
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="font-bold mb-1">Última lectura registrada:</p>
                                <p><strong>Valor:</strong> {dataModal.last_reading?.value}</p>
                                <p><strong>Fecha:</strong> {new Date(dataModal.last_reading?.at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                            <button 
                                onClick={handleCloseModal}
                                className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
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