import { getSites, getSite } from '../api/sites'
import { useEffect, useState } from 'react'
import { CardSites, SiteDetailedModalContent } from '../components/Cards'

function Sites() {
    const [active, setActive] = useState([])
    const [noActive, setNoActive] = useState([])
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [dataModal, setDataModal] = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    useEffect(() => {
        Promise.all([
            getSites({ active: true, page_size: 20, page: 1 }),
            getSites({ active: false, page_size: 20, page: 1 }),
        ])
            .then(([activeSites, inactiveSites]) => {
                setActive(activeSites.data || [])
                setNoActive(inactiveSites.data || [])
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
            if (e.key === 'Escape') handleCloseModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [])

    if (error) return <p className="p-8 text-red-500">{error}</p>

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-500">Centros Inactivos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {noActive.length > 0 ? (
                    noActive.map((e) => (
                        <CardSites key={e.id} data={e} onOpenModal={handleOpenModal} />
                    ))
                ) : (
                    <p className="text-gray-500">Actualmente no hay centros inactivos registrados.</p>
                )}
            </div>
            <h2 className="text-2xl font-bold mb-4 mt-8">Centros Activos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {active.length > 0 ? (
                    active.map((e) => (
                        <CardSites key={e.id} data={e} onOpenModal={handleOpenModal} />
                    ))
                ) : (
                    <p className="text-gray-500">Cargando o no hay centros activos...</p>
                )}
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