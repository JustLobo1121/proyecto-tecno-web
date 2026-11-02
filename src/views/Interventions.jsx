import { useEffect, useState } from 'react'
import { getInterventions, createIntervention } from '../api/interventions'
import { getSites } from '../api/sites'
import { getSensors } from '../api/sensors'
import { mapOutcome, findSites } from '../api/mappings'

function Interventions() {
    const [interventions, setInterventions] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [activeSites, setActiveSites] = useState([])
    const [siteId, setSiteId] = useState(-1)
    const [sensorId, setSensorId] = useState(-1)
    const [sensors, setSensors] = useState([])

    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(-1);

    const [status, setStatus] = useState(null);

    const loadInterventions = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await getInterventions({page_size: PAGE_SIZE, page: currentPage, status: status})
            setInterventions(response.data || response)
            setTotalPages(Math.ceil(response.meta.totalCount / PAGE_SIZE))
        } catch (err) {
            setError(err.message || 'Ocurrió un error al obtener las intervenciones.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInterventions()
    }, [currentPage, status])

    useEffect(() => {
        Promise.all([
            getSites({}),
        ])
            .then(([activeSites]) => {
                setActiveSites(activeSites.data || [])
            })
            .catch((err) => setError(err.message))
    }, [])

    useEffect(() => {
        // No site chosen if this is the case
        if (siteId === -1) return
        const querySiteSensors = async () => {
            try {
                const params = { 
                    page: 1, 
                    page_size: 20,
                    site_id: siteId
                }
                const response = await getSensors(params)
                setSensors(response.data || response)
            } catch (err) {
                setError(err.message)
            }
        }
        querySiteSensors()
    }, [siteId])

    const handleOpenModal = () => setShowModal(true)
    const handleCloseModal = () => {
        setShowModal(false)
        setSiteId(-1)
        setSensorId(-1)
        setSensors([])
        setReason('')
    }
    const handleCreateIntervention = async (e) => {
        e.preventDefault()
        if (siteId == -1 || sensorId == -1 || !reason) return
        setSubmitting(true)
        
        try {
            await createIntervention({
                site_id: siteId,
                sensor_id: sensorId,
                reason: reason
            })

            handleCloseModal()
            await loadInterventions()
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-8 text-gray-800 dark:text-gray-100">
            <div className="flex flex-wrap p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl mb-6 border dark:border-gray-700 justify-between">
                <div className="flex items-center gap-3">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtrar por estado:</label>
                    <select id="status-filter" value={status} onChange={(e) => {setStatus(e.target.value); setCurrentPage(1)}} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white">
                        <option value="">Todos los registros</option>
                        <option value="open">Abiertos</option>
                        <option value="closed">Resueltos</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-md cursor-pointer" onClick={() => {if (currentPage > 1) setCurrentPage(currentPage - 1)}}>Anterior</button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-md cursor-pointer" onClick={() => {if (currentPage < totalPages) setCurrentPage(currentPage + 1)}}>Siguiente</button>
                </div>
                <div>
                    <button onClick={handleOpenModal} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm shadow-md cursor-pointer">
                        + Abrir Intervención
                    </button>
                </div>
            </div>

            {error && (
                <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                    <button type="button" onClick={loadInterventions} className="ml-3 font-semibold underline">
                        Reintentar
                    </button>
                </div>
            )}

            <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border dark:border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <th className="px-6 py-4">Sitio</th>
                            <th className="px-6 py-4">Motivo</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Resultado</th>
                            <th className="px-6 py-4">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500">Cargando intervenciones...</td>
                            </tr>
                        ) : interventions.length > 0 ? (
                            interventions.map((item, index) => (
                                <tr key={item.id || item._id || `${item.target_id || 'intervention'}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 text-white-500 max-w-sm truncate">{findSites(activeSites, item)}</td>
                                    <td className="px-6 py-4 text-gray-500 max-w-sm truncate">{item.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${item.status === 'open' ? 'text-yellow-500 bg-yellow-100 dark:text-yellow-700 dark:bg-yellow-200' : 'text-green-500 bg-green-100 dark:text-green-700 dark:bg-green-200'}`}>
                                            {String(item.status === 'open' ? 'Abierta' : item.status === 'closed' ? 'Cerrada' : 'Sin estado').replace(/[_-]+/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 max-w-sm truncate">
                                        {item.outcome && <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase text-white bg-purple-500">
                                            {mapOutcome(item.outcome)}
                                        </span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 max-w-sm truncate">{item.outcome_notes}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-10 text-gray-500">
                                    {status
                                        ? 'No hay intervenciones con ese estado.'
                                        : 'No hay intervenciones registradas.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-white">
                                Abrir Nueva Intervención
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleCreateIntervention}>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Centro</label>
                                    <select
                                    value={siteId}
                                    onChange={(e) => setSiteId(e.target.value)}
                                    className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[180px] text-sm"
                                    >
                                        <option key={-1} value={-1}>Seleccione un centro...</option>
                                        {activeSites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Sensor</label>
                                    <select
                                    value={sensorId}
                                    onChange={(e) => setSensorId(e.target.value)}
                                    className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg outline-none min-w-[180px] text-sm"
                                    >
                                        <option key={-1} value={-1}>Seleccione un sensor...</option>
                                        {sensors.map(sensor => <option key={sensor.id} value={sensor.id}>{sensor.sensor_name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Motivo / Descripción</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Problema técnico o alerta..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    {submitting ? 'Guardando...' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Interventions
