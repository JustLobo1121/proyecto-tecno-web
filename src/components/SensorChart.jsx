import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, createHorizontalChart } from 'recharts';
import { getMeasurements } from '../api/measurements';
import { useEffect, useState } from 'react';

async function populateData(rawData, setData) {
    const data = []
    rawData.data.map((entry) => {
        data.unshift({
            x: entry.oxygen,
            date: new Date(Date.parse(entry.timestamp)).toLocaleString("es-CL")
        })
    })
    // API is of a stack data type. the first entry is the last one
    // ideally .map() shouldnt be used and an interation should begin from the last index
    // tl;dr this is not efficient.
    setData(data)
}

export function SensorChart({ sensorData }) {
    const [data, setData] = useState([]);
    const [range, setRange] = useState(3600 * 24);
    const Typed = createHorizontalChart()({ XAxis, YAxis, Tooltip, Line });
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
        <div>
            <select value={range} onChange={(e) => setRange(e.target.value)}>
                <option value={3600 * 1}>1 hora</option>
                <option value={3600 * 2}>2 horas</option>
                <option value={3600 * 4}>4 horas</option>
                <option value={3600 * 8}>8 horas</option>
                <option value={3600 * 24}>1 día</option>
                <option value={3600 * 48}>2 días</option>
                <option value={3600 * 72}>3 días</option>
            </select>
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
            <Typed.XAxis dataKey="date" />
            <Typed.YAxis width="auto" />
            <Tooltip />
            <Legend />
            <Typed.Line dataKey="x" name="Oxígeno" unit=" mg/L"/>
            </Typed.LineChart>
        </div>
    );
}