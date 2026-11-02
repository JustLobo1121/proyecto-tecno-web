import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CartesianGrid, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { getSensors, getSensor } from "../api/sensors";
import { getSites } from "../api/sites";
import { getMeasurements } from "../api/measurements";

const RANGES = { "24h": 1, "7d": 7 };
const PAGE_SIZE = 100;
const MAX_PAGES = 30;
const MAX_POINTS = 600;
const REFRESH_MS = 60_000;

const MEDITIONS = {
  oxygen: { label: "Oxígeno", unit: "mg/L" },
  temperature: { label: "Temperatura", unit: "°C" },
  salinity: { label: "Salinidad", unit: "PSU" },
};

const STATUS_LABELS = { ok: "OK", out_of_range: "Fuera de rango", no_data: "Sin transmitir" };
const STATUS_STYLES = {
  ok: "bg-green-100 text-green-800",
  out_of_range: "bg-yellow-100 text-yellow-800",
  no_data: "bg-red-100 text-red-800",
};

const CARD = "rounded-lg border p-4 bg-white dark:bg-gray-800 dark:text-white";

const toPoint = (m) => ({ time: m.at ?? m.timestamp, value: m.value });

const pad = (n) => String(n).padStart(2, "0");

const toApiDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
  `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

function formatTime(at) {
  if (!at) return "";
  const [date, time] = at.split("T");
  const [, month, day] = date.split("-");
  return `${day}/${month} ${time.slice(0, 5)}`;
}

function thin(points, max) {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  return points.filter((_, i) => i % step === 0);
}

async function fetchRange(params) {
  const first = await getMeasurements({ ...params, page: 1, page_size: PAGE_SIZE });
  const total = first.meta.totalCount;
  const pages = Math.min(Math.ceil(total / PAGE_SIZE), MAX_PAGES);

  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      getMeasurements({ ...params, page: i + 2, page_size: PAGE_SIZE })
    )
  );

  const rows = [first, ...rest].flatMap((r) => r.data);
  return { rows, total };
}

const DEFAULT_LOCATION = {
  name: "Puerto Montt (ubicación por defecto)",
  lat: -41.47,
  lon: -72.94,
};

function getLocation(site) {
  const lat = site?.latitude ?? site?.lat;
  const lon = site?.longitude ?? site?.lon ?? site?.lng;
  if (lat != null && lon != null) {
    return { name: site.name, lat: Number(lat), lon: Number(lon) };
  }
  return DEFAULT_LOCATION;
}

function weatherText(code) {
  if (code === 0) return "Despejado";
  if (code <= 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Niebla";
  if (code >= 51 && code <= 57) return "Llovizna";
  if (code >= 61 && code <= 67) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code === 85 || code === 86) return "Chubascos de nieve";
  if (code >= 95) return "Tormenta";
  return "—";
}

const COMPASS = ["Norte", "Noreste", "Este", "Sureste", "Sur", "Suroeste", "Oeste", "Noroeste"];
const compass = (deg) => COMPASS[Math.round(deg / 45) % 8];

function useWeather(lat, lon) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lat == null || lon == null) return;
    let cancelled = false;
    setData(null);
    setError(false);

    const url =
      "https://api.open-meteo.com/v1/forecast?" +
      new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
        daily: "temperature_2m_max,temperature_2m_min,wind_gusts_10m_max",
        timezone: "America/Santiago",
        forecast_days: 1,
      });

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("open-meteo");
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => { cancelled = true; };
  }, [lat, lon]);

  return { data, error };
}

function WeatherCards({ location }) {
  const { data, error } = useWeather(location?.lat, location?.lon);

  if (!data) {
    const msg = error ? "No se pudo cargar" : "Cargando...";
    return (
      <>
        <div className={CARD}>
          <p className="text-sm text-gray-500">Clima</p>
          <p>{msg}</p>
        </div>
        <div className={CARD}>
          <p className="text-sm text-gray-500">Viento</p>
          <p>{msg}</p>
        </div>
      </>
    );
  }

  const c = data.current;
  const d = data.daily;
  const footer = `Open-Meteo · ${location.name} · obs. ${c.time.slice(11, 16)}`;

  return (
    <>
      <div className={CARD}>
        <p className="text-sm text-gray-500">Clima</p>
        <p className="text-4xl font-bold">{c.temperature_2m}°C</p>
        <p className="text-gray-500 mb-3">{weatherText(c.weather_code)}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Sensación</span>
            <span className="font-medium">{c.apparent_temperature}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Humedad</span>
            <span className="font-medium">{c.relative_humidity_2m}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Máx / Mín</span>
            <span className="font-medium">
              <span className="text-red-500">{d.temperature_2m_max[0]}°</span>
              {" / "}
              <span className="text-cyan-500">{d.temperature_2m_min[0]}°</span>
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t dark:border-gray-700">{footer}</p>
      </div>

      <div className={CARD}>
        <p className="text-sm text-gray-500">Viento</p>
        <p className="text-4xl font-bold text-cyan-500">
          {c.wind_speed_10m} <span className="text-lg text-gray-500">km/h</span>
        </p>
        <p className="text-gray-500 mb-3">
          {compass(c.wind_direction_10m)} ({c.wind_direction_10m}°)
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ráfaga máx.</span>
          <span className="font-medium text-red-500">{d.wind_gusts_10m_max[0]} km/h</span>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t dark:border-gray-700">{footer}</p>
      </div>
    </>
  );
}

function SensorChart({ id, site }) {
  const [sensor, setSensor] = useState(null);
  const [points, setPoints] = useState([]);
  const [info, setInfo] = useState({ total: 0, loaded: 0 });
  const [range, setRange] = useState("24h");
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSensor(id)
      .then((res) => {
        if (cancelled) return;
        setSensor(res);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => { cancelled = true; };
  }, [id, tick]);

  const ready = sensor !== null;
  const lastAt = sensor?.last_reading?.at ?? null;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);

    const to = lastAt ? new Date(lastAt.slice(0, 19)) : new Date();
    const from = new Date(to.getTime() - RANGES[range] * 86_400_000);

    fetchRange({ sensor_id: id, from: toApiDate(from), to: toApiDate(to) })
      .then(({ rows, total }) => {
        if (cancelled) return;
        const pts = rows
          .map(toPoint)
          .filter((p) => p.time && p.value != null)
          .sort((a, b) => a.time.localeCompare(b.time));
        setPoints(pts);
        setInfo({ total, loaded: rows.length });
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, range, ready, lastAt]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  if (error && !sensor) return <p className="text-red-600">{error}</p>;
  if (!sensor) return <p>Cargando sensor...</p>;

  const med = MEDITIONS[sensor.medition] ?? { label: sensor.medition, unit: "" };
  const min = sensor[`${sensor.medition}_min`];
  const max = sensor[`${sensor.medition}_max`];
  const last = sensor.last_reading;
  const outOfRange =
    last != null && min != null && max != null && (last.value < min || last.value > max);

  const location = getLocation(site);
  const chartData = thin(points, MAX_POINTS);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="text-xl font-bold dark:text-white">{sensor.sensor_name}</h3>
        <span
          className={`rounded px-2 py-1 text-sm ${
            STATUS_STYLES[sensor.status] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[sensor.status] ?? sensor.status}
        </span>
        <Link
          to={`/interventions?sensor_id=${id}`}
          className="ml-auto rounded border px-3 py-1 text-sm hover:shadow dark:text-white"
        >
          Abrir intervención
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className={CARD}>
          <p className="text-sm text-gray-500">Última lectura</p>
          {last ? (
            <>
              <p className={`text-4xl font-bold ${outOfRange ? "text-red-600" : ""}`}>
                {last.value} <span className="text-lg">{med.unit}</span>
              </p>
              <p className="text-sm text-gray-500">{formatTime(last.at)}</p>
            </>
          ) : (
            <p>Sin lecturas</p>
          )}
          <div className="mt-3 pt-2 border-t dark:border-gray-700 text-sm text-gray-500 space-y-1">
            <p>
              Rango permitido: {min} – {max} {med.unit}
              {outOfRange && <span className="text-red-600 font-medium"> · fuera de rango</span>}
            </p>
            <p>
              {sensor.position} · {sensor.depth} m ·{" "}
              {sensor.transmitting ? "Transmitiendo" : "Sin transmitir"}
            </p>
          </div>
        </div>

        <WeatherCards location={location} />
      </div>

      <div className="flex gap-2 mb-3">
        {Object.keys(RANGES).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded border px-3 py-1 text-sm dark:text-white ${
              r === range ? "bg-gray-900 text-white dark:bg-gray-600" : ""
            }`}
          >
            {r === "24h" ? "Últimas 24 horas" : "Últimos 7 días"}
          </button>
        ))}
        <button
          onClick={() => setTick((t) => t + 1)}
          className="ml-auto rounded border px-3 py-1 text-sm dark:text-white"
        >
          Actualizar
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="dark:text-white">Cargando mediciones...</p>}
      {!loading && !error && points.length === 0 && (
        <p className="dark:text-white">Este sensor no tiene mediciones en el rango elegido.</p>
      )}

      {points.length > 0 && (
        <>
          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.4} />
                <XAxis dataKey="time" tickFormatter={formatTime} minTickGap={40} />
                <YAxis
                  unit={` ${med.unit}`}
                  domain={[
                    (dataMin) => Math.min(dataMin, min ?? dataMin),
                    (dataMax) => Math.max(dataMax, max ?? dataMax),
                  ]}
                />
                <Tooltip labelFormatter={formatTime} />
                {min != null && (
                  <ReferenceLine y={min} stroke="#dc2626" strokeDasharray="4 4" label="Mín" />
                )}
                {max != null && (
                  <ReferenceLine y={max} stroke="#dc2626" strokeDasharray="4 4" label="Máx" />
                )}
                <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {info.loaded < info.total
              ? `Mostrando ${info.loaded} de ${info.total} mediciones del rango (se alcanzó el límite de páginas).`
              : `${info.total} mediciones en el rango.`}
          </p>
        </>
      )}
    </div>
  );
}

export default function Measurements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const siteId = searchParams.get("site_id");
  const sensorId = searchParams.get("sensor_id");

  const [sites, setSites] = useState([]);
  const [siteSensors, setSiteSensors] = useState([]);
  const [autoNote, setAutoNote] = useState(null);
  const [listError, setListError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSites({ page_size: 100 })
      .then((res) => {
        if (!cancelled) setSites(res.data);
      })
      .catch((err) => {
        if (!cancelled) setListError(err.message);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (siteId) return;

    let cancelled = false;
    (async () => {
      try {
        if (sensorId) {
          const s = await getSensor(sensorId);
          if (!cancelled) {
            setSearchParams(
              { site_id: String(s.site_id), sensor_id: String(sensorId) },
              { replace: true }
            );
          }
          return;
        }

        let res = await getSensors({ status: "out_of_range", page_size: 1 });
        let reason = "fuera de rango";
        if (res.data.length === 0) {
          res = await getSensors({ page_size: 1 });
          reason = "primer sensor de la lista";
        }
        const pick = res.data[0];
        if (!cancelled && pick) {
          setAutoNote(reason);
          setSearchParams(
            { site_id: String(pick.site_id), sensor_id: String(pick.id) },
            { replace: true }
          );
        }
      } catch (err) {
        if (!cancelled) setListError(err.message);
      }
    })();

    return () => { cancelled = true; };
  }, [siteId, sensorId, setSearchParams]);

  useEffect(() => {
    if (!siteId) {
      setSiteSensors([]);
      return;
    }
    let cancelled = false;
    getSensors({ site_id: siteId, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        setSiteSensors(res.data);
        if (!sensorId && res.data[0]) {
          setSearchParams(
            { site_id: siteId, sensor_id: String(res.data[0].id) },
            { replace: true }
          );
        }
      })
      .catch((err) => {
        if (!cancelled) setListError(err.message);
      });
    return () => { cancelled = true; };
  }, [siteId]);

  function handleSite(e) {
    setAutoNote(null);
    const value = e.target.value;
    setSearchParams(value ? { site_id: value } : {});
  }

  function handleSensor(e) {
    setAutoNote(null);
    setSearchParams({ site_id: siteId, sensor_id: e.target.value });
  }

  const site = sites.find((s) => String(s.id) === siteId);
  const selectClass =
    "p-2.5 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm min-w-[220px]";

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Mediciones</h2>

      {listError && <p className="text-red-600 mb-4">{listError}</p>}

      <div className="flex flex-wrap gap-3 mb-2">
        <select value={siteId ?? ""} onChange={handleSite} className={selectClass}>
          <option value="">Automático (fuera de rango)</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={sensorId ?? ""}
          onChange={handleSensor}
          disabled={!siteId}
          className={selectClass}
        >
          <option value="" disabled>
            Selecciona un sensor...
          </option>
          {siteSensors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sensor_name}
            </option>
          ))}
        </select>
      </div>

      {autoNote && (
        <p className="text-sm text-gray-500 mb-4">
          Mostrando automáticamente un sensor ({autoNote}). Elige otro centro o sensor arriba.
        </p>
      )}

      <div className="mt-6">
        {sensorId ? (
          <SensorChart key={sensorId} id={sensorId} site={site} />
        ) : (
          <p className="text-gray-500">Cargando selección...</p>
        )}
      </div>
    </div>
  );
}