import { getSites, getSite } from '../api/sites'
import { useEffect, useState } from 'react'
import { CardSites, SensorDetailCard } from '../components/Cards'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.js'

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

    const handleOpenModal = async (siteData) => {
        setDataModal(siteData)
        setShowModal(true)
        setLoadingDetail(true)
        try {
            const detailResponse = await getSite(siteData.id)
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
        setLoadingDetail(false)
    }

     useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') handleCloseModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


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

            {showModal && dataModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={handleCloseModal}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 shrink-0">
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-3">
                                {dataModal.name}
                                <span className={`text-xs px-2 py-1 rounded-full text-white ${dataModal.active ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {dataModal.active ? 'Operativo' : 'Inactivo'}
                                </span>
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                            <div className="md:w-1/2 p-5 flex flex-col space-y-4 overflow-y-auto border-r dark:border-gray-700">
                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                    <div><span className="font-semibold text-gray-500 block">Código</span>{dataModal.code}</div>
                                    <div><span className="font-semibold text-gray-500 block">Área</span> {dataModal.area}</div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Ubicación</h4>
                                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-100">
                                        <MapContainer center={[dataModal.latitude, dataModal.longitude]} zoom={8} scrollWheelZoom={false} style={{height: '100%', width: '100%'}}>
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[dataModal.latitude, dataModal.longitude]}>
                                                <Popup>
                                                    Latitud: {dataModal.latitude}<br/>
                                                    Longitud: {dataModal.longitude}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-1/2 p-5 flex flex-col overflow-y-auto bg-gray-50/50 dark:bg-gray-900/20">
                                <h4 className="font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-3 mb-4 sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10">
                                    Sensores
                                </h4>

                                {loadingDetail ? (
                                    <div className="flex justify-center items-center py-12 flex-1">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {
                                            dataModal.sensors.map((sensor) => (
                                                <SensorDetailCard key={sensor.id} sensor={sensor} />
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shrink-0 flex justify-end">
                            <button 
                                onClick={handleCloseModal}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
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

export default Sites