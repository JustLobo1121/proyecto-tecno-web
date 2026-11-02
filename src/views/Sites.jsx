import { getSites, getSite } from '../api/sites'
import { useEffect, useState, useMemo } from 'react'
import { SiteTableRow } from '../components/SiteTable'
import { SiteDetailedModalContent } from '../components/Cards'

function Sites() {
    const [active, setActive] = useState([])
    const [noActive, setNoActive] = useState([])
    const [sensorSummaries, setSensorSummaries] = useState({})
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOrder, setSortOrder] = useState('desc')

    const [showModal, setShowModal] = useState(false)
    const [dataModal, setDataModal] = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    useEffect(() => {
        Promise.all([
            getSites({ active: true, page_size: 20, page: 1 }),
            getSites({ active: false, page_size: 20, page: 1 }),
        ])
            .then(([activeSites, inactiveSites]) => {
                const aSites = activeSites.data || []
                const nSites = inactiveSites.data || []
                setActive(aSites)
                setNoActive(nSites)
                const allSites = [...aSites, ...nSites]
                Promise.all(allSites.map(async (site) => {
                    try {
                        const response = await getSite(site.id)
                        const siteData = response.data || response
                        let ok = 0, out_of_range = 0, no_data = 0
                        
                        if (siteData.sensors) {
                            siteData.sensors.forEach(sensor => {
                                if (sensor.status === 'ok') ok++
                                else if (sensor.status === 'out_of_range') out_of_range++
                                else if (sensor.status === 'no_data') no_data++
                            })
                        }
                        return { id: site.id, summary: { ok, out_of_range, no_data, total: siteData.sensors?.length || 0 } }
                    } catch (error) {
                        return { id: site.id, summary: { ok: 0, out_of_range: 0, no_data: 0, total: 0 } }
                    }
                })).then(results => {
                    const summariesObj = {}
                    results.forEach(res => {
                        summariesObj[res.id] = res.summary
                    })
                    setSensorSummaries(summariesObj)
                })
            })
            .catch((err) => setError(err.message))
    }, [])

    const handleOpenModal = async (siteBasicData) => {
        setShowModal(true)
        setLoadingDetail(true)
        setDataModal(null)
        
        try {
            const detailResponse = await getSite(siteBasicData.id)
            setDataModal(detailResponse.data || detailResponse)
        } catch (err) {
            console.error("Error cargando el detalle del centro", err)
        } finally {
            setLoadingDetail(false)
        }
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

    const toggleSortOrder = () => {
        if (sortOrder === 'default') setSortOrder('desc')
        else if (sortOrder === 'desc') setSortOrder('asc')
        else setSortOrder('default')
    }

    const processedSites = useMemo(() => {
        const allSites = [
            ...active.map(site => ({ ...site, isSiteActive: true })),
            ...noActive.map(site => ({ ...site, isSiteActive: false }))
        ]

        let filtered = allSites.filter(site => 
            site.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (sortOrder !== 'default') {
            filtered.sort((a, b) => {
                const sumA = sensorSummaries[a.id]
                const sumB = sensorSummaries[b.id]

                if (!sumA || !sumB) return 0
                const getWeight = (sum) => {
                    if (sum.total === 0) return 0
                    if (sum.out_of_range > 0) return 3
                    if (sum.no_data > 0) return 2
                    return 1
                }

                const weightA = getWeight(sumA)
                const weightB = getWeight(sumB)

                return sortOrder === 'desc' 
                    ? weightB - weightA 
                    : weightA - weightB
            })
        }

        return filtered
    }, [active, noActive, searchTerm, sortOrder, sensorSummaries])

    const handleClearAllFilters = () => {
        setSearchTerm('')
    }

    if (error) return <p className="p-8 text-red-500">{error}</p>

    return (
        <div className="p-8 w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Lista de Centros</h2>
                <input
                    type="text"
                    placeholder="Buscar centro por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
                <table className="min-w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 select-none">
                            <th className="py-3 px-4 border-b dark:border-gray-600">Nombre del Centro</th>
                            <th className="py-3 px-4 border-b dark:border-gray-600">Estado</th>
                            <th 
                                className="py-3 px-4 border-b dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                onClick={toggleSortOrder}
                                title="Clic para ordenar por estado"
                            >
                                <div className="flex items-center gap-2">
                                    Estado de los Sensores
                                    <span className="text-xs">
                                        {sortOrder === 'desc' ? '▼' : sortOrder === 'asc' ? '▲' : '↕'}
                                    </span>
                                </div>
                            </th>
                            <th className="py-3 px-4 border-b dark:border-gray-600 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedSites.length > 0 ? (
                            processedSites.map(site => (
                                <SiteTableRow 
                                    key={site.id} 
                                    site={site} 
                                    summary={sensorSummaries[site.id]}
                                    onOpenModal={handleOpenModal} 
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-6 text-center text-gray-500 dark:text-gray-400">
                                    <p className="text-gray-500 font-medium">No se encontraron centros con la busqueda.</p>
                                    <button 
                                        onClick={handleClearAllFilters}
                                        className="mt-3 text-blue-600 hover:underline text-sm"
                                    >
                                        Limpiar todos los filtros
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={handleCloseModal}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 w-full max-w-6xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {loadingDetail ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                <p>Cargando información de sensores y mapa...</p>
                            </div>
                        ) : dataModal ? (
                            <SiteDetailedModalContent detailedData={dataModal} onClose={handleCloseModal} />
                        ) : (
                            <div className="p-8 text-center text-red-500">
                                <p>Ocurrió un error al cargar los datos del centro.</p>
                                <button onClick={handleCloseModal} className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg">Cerrar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sites