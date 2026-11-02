import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSite } from '../api/sites'
import { SensorDetailCard } from '../components/Cards'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const customMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function SiteDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [siteData, setSiteData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchSite = async () => {
            try {
                const response = await getSite(id)
                setSiteData(response.data || response)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchSite()
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !siteData) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error al cargar el centro: {error || 'No encontrado'}</p>
                <button onClick={() => navigate('/sites')} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg text-gray-800">Volver a Centros</button>
            </div>
        )
    }

    let sensorSummary = { ok: 0, out_of_range: 0, no_data: 0 }
    if (siteData.sensors) {
        siteData.sensors.forEach(sensor => {
            if (sensor.status === 'ok') sensorSummary.ok++
            else if (sensor.status === 'out_of_range') sensorSummary.out_of_range++
            else if (sensor.status === 'no_data') sensorSummary.no_data++
        })
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <button 
                onClick={() => navigate('/sites')}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
                &larr; Volver a todos los centros
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                            {siteData.name}
                        </h2>
                        <span className={`text-xs px-3 py-1 rounded-full text-white font-medium ${siteData.active ? 'bg-green-500' : 'bg-red-500'}`}>
                            {siteData.active ? 'Operativo' : 'Inactivo'}
                        </span>
                        <span className="text-sm text-gray-500 hidden sm:block">Area: {siteData.area}</span>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row p-6 gap-8">
                    <div className="md:w-1/3 flex flex-col space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm border-b dark:border-gray-700 pb-2">Estado Global</h4>
                            <div className="flex flex-col gap-3">
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
                                onClick={() => navigate(`/sensors?site_id=${siteData.id}`)}
                                className="mt-6 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                Filtrar sensores en tabla global
                            </button>
                        </div>
                        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-72">
                            <MapContainer center={[siteData.latitude, siteData.longitude]} zoom={8} scrollWheelZoom={false} style={{height: '100%', width: '100%'}}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker 
                                    position={[siteData.latitude, siteData.longitude]} 
                                    icon={customMarkerIcon}
                                >
                                    <Popup>
                                        <div className="text-center font-medium">
                                            {siteData.name}<br/>
                                            <span className="text-xs text-gray-500">
                                                {siteData.latitude}, {siteData.longitude}
                                            </span>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                    <div className="md:w-2/3 flex flex-col bg-gray-50/50 dark:bg-gray-900/20 rounded-xl p-6 border border-gray-100 dark:border-gray-700/50">
                        <h4 className="font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-3 mb-5 text-lg">
                            Sensores Instalados ({siteData.sensors?.length || 0})
                        </h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {siteData.sensors && siteData.sensors.length > 0 ? (
                                siteData.sensors.map((sensor) => (
                                    <SensorDetailCard key={sensor.id} sensor={sensor} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No hay sensores registrados en este centro.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SiteDetails