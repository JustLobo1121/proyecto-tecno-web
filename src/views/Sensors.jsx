import { useState, useEffect } from 'react'
import { useSearchParams } from "react-router-dom"
import { getSensors } from '../api/sensors'
import { CardSensors } from '../components/Cards'

function Sensors() {
    const [searchParams] = useSearchParams()
    const PAGE_SIZE = 15
    const [sensors, setSensors] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status'))
    const [filterPosition, setFilterPosition] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [totalItems, setTotalItems] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [dataModal, setDataModal] = useState(null)
  
    useEffect(() => {
        const fetchPaginatedSensors = async () => {
            setLoading(true)
            try {
                const params = { 
                    page: currentPage, 
                    page_size: PAGE_SIZE 
                }
                if (filterStatus !== 'all') params.status = filterStatus
                if (filterPosition !== 'all') params.position = filterPosition
                if (searchTerm) params.search = searchTerm
                const response = await getSensors(params)
                setSensors(response.data || response)
                setHasNextPage((response.data || []).length === PAGE_SIZE)
                setTotalItems(response.total || response.data?.length || 0)

            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        const delayDebounce = setTimeout(() => {
            fetchPaginatedSensors()
        }, 300)

        return () => clearTimeout(delayDebounce)
    }, [currentPage, filterStatus, filterPosition, searchTerm])

    const handleFilterStatus = (e) => {
        setFilterStatus(e.target.value)
        setCurrentPage(1)
    }

    const handleFilterPosition = (e) => {
        setFilterPosition(e.target.value)
        setCurrentPage(1)
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

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
            if (e.key === 'Escape') handleCloseModal()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    if (error) return <p className="p-8 text-red-500">{error}</p>

    return (
        <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Sensores Registrados</h2>
                    <p className="text-gray-500 text-sm">Mostrando {sensors.length} de {totalItems} sensores</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[200px] flex-grow sm:flex-grow-0 text-sm"
                    />
                    <select 
                        value={filterStatus}
                        onChange={handleFilterStatus}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[180px] text-sm"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="ok">Solo OK</option>
                        <option value="out_of_range">Solo Fuera de Rango</option>
                        <option value="no_data">Solo Sin Datos</option>
                    </select>
                    <select 
                        value={filterPosition}
                        onChange={handleFilterPosition}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[180px] text-sm"
                    >
                        <option value="all">Todas las Posiciones</option>
                        <option value="jaula">Jaula</option>
                        <option value="ponton">Ponton</option>
                    </select>
                </div>
            </div>

            <div className="flex-1">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : sensors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sensors.map((e) => (
                            <CardSensors key={e.id} data={e} onOpenModal={handleOpenModal} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 font-medium">No se encontraron sensores con estos filtros.</p>
                        <button 
                            onClick={() => { setFilterStatus('all'); setFilterPosition('all'); setSearchTerm(''); setCurrentPage(1); }}
                            className="mt-3 text-blue-600 hover:underline text-sm"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
            <div className="flex justify-center items-center gap-4 mt-10 shrink-0 pt-6 border-t dark:border-gray-800">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                    >
                    Anterior
                </button>
                <span className="text-gray-600 text-sm font-medium">
                    Página {currentPage}
                </span>
                <button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!hasNextPage || loading}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                    >
                    Siguiente
                </button>
            </div>
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