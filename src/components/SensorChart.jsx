import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, createHorizontalChart } from 'recharts'
import { getMeasurements } from '../api/measurements'
import { useEffect, useState } from 'react'

async function populateData(rawData, setData) {
    const data = []
    rawData.data.map((entry) => {
        data.unshift({
            oxygen: entry.oxygen,
            saturation: entry.saturation,
            temperature: entry.temperature,
            salinity: entry.salinity,
            date: new Date(Date.parse(entry.timestamp)).toLocaleString("es-CL")
        })
    })
    // API is of a stack data type. the first entry is the last one
    // ideally .map() shouldnt be used and an interation should begin from the last index
    // tl;dr this is not efficient.
    setData(data)
}

export function SensorChart({ sensorData }) {
    const [data, setData] = useState([])
    const [range, setRange] = useState(3600 * 24)
    const Typed = createHorizontalChart()({ XAxis, YAxis, Tooltip, Line })
    const currDate = new Date()
    useEffect(() => {
        getMeasurements({
            sensor_id: sensorData.id,
            from: new Date(currDate.valueOf() - range * 1000).toISOString(), // epochs are in milliseconds in JS!!
            to: currDate.toISOString(),
            page_size: 1000
        })
    .then((r) => {
        populateData(r, setData)
    })
    .finally((e) => {
        // nothing for now
    })
    }, [range])
    return (
        <div className="text-gray-900 dark:text-gray-200">
            <div className="flex justify-start w-1/2">
                <h3 className="text-gray-900 dark:text-gray-200">Rango de tiempo</h3>
                <div className="px-4">
                    <select 
                    value={range} 
                    onChange={(e) => setRange(e.target.value)}
                    className="mb-4 p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded outline-none"
                >
                    <option value={3600 * 1}>1 hora</option>
                    <option value={3600 * 2}>2 horas</option>
                    <option value={3600 * 4}>4 horas</option>
                    <option value={3600 * 8}>8 horas</option>
                    <option value={3600 * 24}>1 día</option>
                    <option value={3600 * 48}>2 días</option>
                    <option value={3600 * 72}>3 días</option>
                </select>
                </div>
            </div>
            <Typed.LineChart
            style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
            responsive
            data={data}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
            }}
            >
            <CartesianGrid />
            <Typed.XAxis dataKey="date" tick={{ fill: 'currentColor' }} />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    borderColor: '#374151',
                    color: '#f3f4f6',
                    borderRadius: '0.5rem'
                }}
                itemStyle={{ color: '#60a5fa' }}
            />
            <Legend />
            <Typed.Line dataKey="oxygen" name="Oxígeno" unit=" mg/L" dot={false}/>
            <Typed.Line dataKey="temperature" name="Temperatura" unit=" ºC" dot={false} stroke={"red"}/>
            <Typed.Line dataKey="saturation" name="Saturación" unit=" %" dot={false} stroke={"green"}/>
            <Typed.Line dataKey="salinity" name="Salinidad" unit=" psu" dot={false} stroke={"orange"}/>
            </Typed.LineChart>
        </div>
    )
}