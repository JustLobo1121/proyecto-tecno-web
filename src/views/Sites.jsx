import { getSites } from '../api/sites'
import { useEffect, useState } from 'react'
import { CardSites } from '../components/Cards'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet/dist/leaflet.js'

function Sites() {
    const [active, setActive] = useState([])
    const [noActive, setNoActive] = useState([])
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [dataModal, setDataModal] = useState(null)

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
            <h2 className="text-2xl font-bold mb-4">Centros Activos</h2>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                            <h3 className="text-xl font-bold dark:text-white">
                                {dataModal.name}
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div>
                            <div className="p-5 space-y-3 text-gray-700 dark:text-gray-300">
                                <p><strong>ID:</strong> {dataModal.id} - {dataModal.code}</p>
                                <p><strong>Área:</strong> {dataModal.area}</p>
                                <p>
                                    <strong>Estado:</strong>{' '}
                                    <span className={dataModal.active ? 'text-green-500' : 'text-red-500'}>
                                        {dataModal.active ? 'Operativo' : 'Inactivo'}
                                    </span>
                                </p>
                            </div>
                            <div className="p-5 space-y-3 text-gray-700 dark:text-gray-300">
                                <p><strong>Ubicación</strong></p>
                                <MapContainer center={[dataModal.latitude, dataModal.longitude]} zoom={8} scrollWheelZoom={false} style={{height: 300}}>
                                    <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[dataModal.latitude, dataModal.longitude]}>
                                        <Popup>
                                            Latitud: {dataModal.latitude}
                                            <br></br>
                                            Longitud: {dataModal.longitude}
                                        </Popup>
                                    </Marker>
                            </MapContainer>
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

export default Sites