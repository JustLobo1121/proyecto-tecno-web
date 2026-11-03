import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CartesianGrid, Line, LineChart, ReferenceArea,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { getSensors } from "../api/sensors";
import { getSites } from "../api/sites";
import { getInterventions } from "../api/interventions";
import { getSiteOverview, toSeries } from "../api/overview";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const INTERVENTIONS_SHOWN = 5;

const centerRoute = (id) => `/sites?site_id=${id}`;

const STATUS = {
  out_of_range: {
    label: "Fuera de rango", title: "Sensores fuera de rango", color: "#ef4444",
    pill: "bg-red-500/15 text-red-700 dark:text-red-400",
  },
  no_data: {
    label: "Sin transmitir", title: "Sensores sin transmitir", color: "#9ca3af",
    pill: "bg-gray-500/15 text-gray-700 dark:text-gray-300",
  },
  ok: {
    label: "Funcionando", title: "Sensores funcionando", color: "#22c55e",
    pill: "bg-green-500/15 text-green-700 dark:text-green-400",
  },
};

const CARD = "rounded-lg border p-4 bg-white dark:bg-gray-800 dark:text-white";
const HOVER = "transition hover:bg-gray-50 hover:shadow dark:hover:bg-gray-700/40";
const MUTED = "text-gray-600 dark:text-gray-400";
const AXIS_TEXT = "currentColor";
const CLOSED_VALUES = ["closed", "cerrada", "cerrado", "resolved", "done"];

function formatAt(at) {
  if (!at) return "";
  const [date, time] = at.split("T");
  const [, month, day] = date.split("-");
  return `${day}/${month} ${(time ?? "").slice(0, 5)}`;
}

function toIntervention(i) {
  const raw = i.status ?? i.state ?? null;
  const closed =
    Boolean(i.closed_at) || (raw != null && CLOSED_VALUES.includes(String(raw).toLowerCase()));
  return {
    id: i.id,
    sensor_id: i.sensor_id ?? null,
    site_id: i.site_id ?? null,
    reason: i.reason ?? i.motivo ?? i.description ?? "",
    at: i.created_at ?? i.opened_at ?? i.createdAt ?? "",
    closed,
  };
}

async function fetchAllSensors() {
  const first = await getSensors({ page: 1, page_size: PAGE_SIZE });
  const pages = Math.min(Math.ceil(first.meta.totalCount / PAGE_SIZE), MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      getSensors({ page: i + 2, page_size: PAGE_SIZE })
    )
  );
  return [first, ...rest].flatMap((r) => r.data);
}

function StatusCard({ status, count }) {
  const s = STATUS[status];
  return (
    <Link
      to={`/sensors?status=${status}`}
      className={`${CARD} ${HOVER} block border-l-4`}
      style={{ borderLeftColor: s.color }}
    >
      <p className={`text-sm ${MUTED}`}>{s.title}</p>
      <p className="text-4xl font-bold">{count}</p>
    </Link>
  );
}

function StatusLegend() {
  return (
    <div className={`flex flex-wrap gap-4 text-sm ${MUTED}`}>
      {["out_of_range", "no_data", "ok"].map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: STATUS[k].color }}
          />
          {STATUS[k].label}
        </span>
      ))}
    </div>
  );
}

// Únicamente se mantiene Oxígeno como magnitud requerida
const MAGNITUDE = { label: "Oxígeno", unit: "mg/L" };
const MAGNITUDE_KEY = "oxygen";

const RANGES = { "24h": 1, "7d": 7 };

const PALETTE = ["#3b82f6", "#f97316", "#a855f7", "#06b6d4", "#ec4899", "#eab308"];

const SELECT =
  "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white";

function buildChartData(series, magnitude) {
  const byTime = new Map();
  series.forEach((s) => {
    (s.points ?? []).forEach((p) => {
      const v = p[`${magnitude}_avg`];
      if (v == null) return;
      const row = byTime.get(p.bucket) ?? { time: p.bucket };
      row[`s${s.sensor_id}`] = v;
      byTime.set(p.bucket, row);
    });
  });
  return [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time));
}

function lastValue(points, magnitude) {
  let best = null;
  points.forEach((p) => {
    const v = p[`${magnitude}_avg`];
    if (v != null && (!best || p.bucket > best.bucket)) best = { bucket: p.bucket, v };
  });
  return best?.v ?? null;
}

function TrendTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value != null).sort((a, b) => b.value - a.value);
  return (
    <div className="rounded-lg border bg-white p-3 text-sm shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white">
      <p className="mb-1 font-semibold">{formatAt(label)}</p>
      {rows.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: p.stroke ?? p.color }}
          />
          <span className="flex-1">{p.name}</span>
          <span className="font-medium">
            {p.value} {unit}
          </span>
        </p>
      ))}
    </div>
  );
}

function TrendChart({ sensors, centers }) {
  const navigate = useNavigate();

  const [siteId, setSiteId] = useState(centers[0]?.id ?? null);
  const [range, setRange] = useState("24h");
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => {
    if (siteId == null) return;
    const controller = new AbortController();
    setLoading(true);

    getSiteOverview(siteId, { days: RANGES[range] }, { signal: controller.signal })
      .then((raw) => {
        setSeries(toSeries(raw));
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [siteId, range]);

  const goToSensor = (s) => navigate(`/measurements?site_id=${s.site_id}&sensor_id=${s.id}`);

  const centerSensors = sensors
    .filter((s) => s.site_id === siteId)
    .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

  const seriesById = new Map(series.map((s) => [String(s.sensor_id), s]));
  const data = buildChartData(series, MAGNITUDE_KEY);

  const entries = centerSensors.map((s, i) => ({
    sensor: s,
    key: `s${s.id}`,
    color: PALETTE[i % PALETTE.length],
    last: lastValue(seriesById.get(String(s.id))?.points ?? [], MAGNITUDE_KEY),
  }));

  const lo = `${MAGNITUDE_KEY}_min`;
  const hi = `${MAGNITUDE_KEY}_max`;
  const ranged = centerSensors.filter(
    (s) => s.medition === MAGNITUDE_KEY && s[lo] != null && s[hi] != null
  );
  const rangeKeys = new Set(ranged.map((s) => `${s[lo]}|${s[hi]}`));
  const band = rangeKeys.size === 1 ? { lo: ranged[0][lo], hi: ranged[0][hi] } : null;

  return (
    <div className={`${CARD} h-full`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Evolución de Oxígeno en Sensores</h3>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className={SELECT}
            value={siteId ?? ""}
            onChange={(e) =>
              setSiteId(centers.find((c) => String(c.id) === e.target.value)?.id ?? null)
            }
          >
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.out_of_range > 0 ? ` · ${c.out_of_range} fuera de rango` : ""}
              </option>
            ))}
          </select>

          <div className="flex gap-1">
            {Object.keys(RANGES).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  r === range
                    ? "border-gray-900 bg-gray-900 text-white dark:border-gray-600 dark:bg-gray-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {r === "24h" ? "24 horas" : "7 días"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {centers.length === 0 ? (
        <p className={MUTED}>No hay centros para mostrar.</p>
      ) : loading ? (
        <p className={MUTED}>Cargando mediciones...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : data.length === 0 ? (
        <p className={MUTED}>Ningún sensor de este centro tiene lecturas de oxígeno en el rango elegido.</p>
      ) : (
        <div className={`h-80 w-full ${MUTED}`}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke={AXIS_TEXT}
                strokeOpacity={0.25}
              />
              <XAxis
                dataKey="time"
                tickFormatter={formatAt}
                minTickGap={48}
                tick={{ fill: AXIS_TEXT, fontSize: 11 }}
                stroke={AXIS_TEXT}
              />
              <YAxis
                width={64}
                domain={["auto", "auto"]}
                unit={` ${MAGNITUDE.unit}`}
                tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                stroke={AXIS_TEXT}
              />

              {band && (
                <>
                  <ReferenceArea
                    y1={band.lo}
                    y2={band.hi}
                    fill="#22c55e"
                    fillOpacity={0.1}
                    ifOverflow="extendDomain"
                  />
                  <ReferenceLine
                    y={band.lo}
                    stroke="#22c55e"
                    strokeDasharray="6 4"
                    ifOverflow="extendDomain"
                    label={{ value: `Mín ${band.lo}`, position: "insideBottomRight", fill: "#22c55e", fontSize: 11 }}
                  />
                  <ReferenceLine
                    y={band.hi}
                    stroke="#22c55e"
                    strokeDasharray="6 4"
                    ifOverflow="extendDomain"
                    label={{ value: `Máx ${band.hi}`, position: "insideTopRight", fill: "#22c55e", fontSize: 11 }}
                  />
                </>
              )}

              <Tooltip content={(props) => <TrendTooltip {...props} unit={MAGNITUDE.unit} />} />

              {entries.map((e) => (
                <Line
                  key={e.key}
                  type="monotone"
                  dataKey={e.key}
                  name={e.sensor.sensor_name}
                  stroke={e.color}
                  strokeWidth={hoverId === e.sensor.id ? 3.5 : 2}
                  strokeOpacity={hoverId == null || hoverId === e.sensor.id ? 1 : 0.15}
                  dot={false}
                  activeDot={{
                    r: 5,
                    style: { cursor: "pointer" },
                    onClick: () => goToSensor(e.sensor),
                  }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {entries.map((e) => {
            const st = STATUS[e.sensor.status];
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => goToSensor(e.sensor)}
                onMouseEnter={() => setHoverId(e.sensor.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(e.sensor.id)}
                onBlur={() => setHoverId(null)}
                className={`flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left dark:border-gray-700 ${HOVER}`}
              >
                <span className="h-1 w-6 shrink-0 rounded" style={{ backgroundColor: e.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {e.sensor.sensor_name}
                  </span>
                  <span className={`block text-xs ${MUTED}`}>
                    {e.last != null
                      ? `${e.last} ${MAGNITUDE.unit} · último promedio`
                      : "Sin lecturas en este rango"}
                  </span>
                </span>
                <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${st?.pill ?? ""}`}>
                  {st?.label ?? e.sensor.status}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className={`mt-3 text-xs ${MUTED}`}>
        Cada línea muestra el promedio por hora del oxígeno en los sensores del centro elegido.
        {band
          ? ` La franja verde es el rango permitido (${band.lo}–${band.hi} ${MAGNITUDE.unit}).`
          : " No hay un rango permitido único."}{" "}
        Pasa el cursor por un sensor de la lista para resaltar su línea, o haz clic en un
        punto para abrir sus mediciones.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [sensors, setSensors] = useState([]);
  const [sites, setSites] = useState([]);
  const [interventions, setInterventions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchAllSensors(),
      getSites({ page_size: 100 }).catch(() => null),
      getInterventions({ page_size: 100 }).catch(() => null),
    ])
      .then(([sensorList, siteRes, interventionRes]) => {
        if (cancelled) return;
        setSensors(sensorList);
        setSites(siteRes?.data ?? []);
        setInterventions(interventionRes?.data ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (loading) return <p className="p-8 dark:text-white">Cargando dashboard...</p>;

  const siteMap = new Map(sites.map((s) => [s.id, s]));
  const siteName = (id) => siteMap.get(id)?.name ?? `Centro ${id}`;
  const sensorMap = new Map(sensors.map((s) => [s.id, s]));

  const counts = { out_of_range: 0, no_data: 0, ok: 0 };
  sensors.forEach((s) => {
    if (s.status in counts) counts[s.status] += 1;
  });

  const bySite = new Map();
  sensors.forEach((s) => {
    const entry = bySite.get(s.site_id) ?? {
      id: s.site_id, total: 0, ok: 0, no_data: 0, out_of_range: 0,
    };
    entry.total += 1;
    if (s.status in STATUS) entry[s.status] += 1;
    bySite.set(s.site_id, entry);
  });
  sites.forEach((s) => {
    if (!bySite.has(s.id)) {
      bySite.set(s.id, { id: s.id, total: 0, ok: 0, no_data: 0, out_of_range: 0 });
    }
  });

  const centers = [...bySite.values()]
    .map((c) => ({ ...c, name: siteName(c.id), area: siteMap.get(c.id)?.area }))
    .sort(
      (a, b) =>
        b.out_of_range - a.out_of_range ||
        b.no_data - a.no_data ||
        a.name.localeCompare(b.name)
    );

  const recent = (interventions ?? [])
    .map(toIntervention)
    .sort(
      (a, b) =>
        (b.at ?? "").localeCompare(a.at ?? "") || Number(b.id) - Number(a.id)
    )
    .slice(0, INTERVENTIONS_SHOWN);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Dashboard</h2>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="flex flex-col justify-center gap-4">
          <StatusCard status="out_of_range" count={counts.out_of_range} />
          <StatusCard status="no_data" count={counts.no_data} />
          <StatusCard status="ok" count={counts.ok} />
        </div>

        <div className="lg:col-span-2">
           <TrendChart sensors={sensors} centers={centers} />
           </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={CARD}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-lg font-bold">Centros</h3>
            <StatusLegend />
          </div>

          {centers.length === 0 ? (
            <p className={MUTED}>No hay centros para mostrar.</p>
          ) : (
            <div className="space-y-2">
              {centers.map((c) => (
                <Link
                  key={c.id}
                  to={centerRoute(c.id)}
                  className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 dark:border-gray-700 ${HOVER}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className={`text-sm ${MUTED}`}>
                      {c.area ? `${c.area} · ` : ""}
                      {c.total} {c.total === 1 ? "sensor" : "sensores"}
                    </p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    {["out_of_range", "no_data", "ok"].map((k) => (
                      <span
                        key={k}
                        title={STATUS[k].label}
                        className={`min-w-8 rounded px-2 py-1 text-center font-medium ${
                          c[k] > 0 ? STATUS[k].pill : MUTED
                        }`}
                      >
                        {c[k]}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={CARD}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-lg font-bold">Intervenciones recientes</h3>
            <Link to="/interventions" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Ver todas →
            </Link>
          </div>

          {interventions === null ? (
            <p className={MUTED}>No se pudieron cargar las intervenciones.</p>
          ) : recent.length === 0 ? (
            <p className={MUTED}>Aún no hay intervenciones registradas.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((it) => {
                const sensor = sensorMap.get(it.sensor_id);
                const siteId = it.site_id ?? sensor?.site_id ?? null;
                const target = sensor
                  ? sensor.sensor_name
                  : siteId != null
                  ? siteName(siteId)
                  : "Sin asignar";

                return (
                  <div
                    className={`block rounded-lg border px-4 py-3 dark:border-gray-700 ${HOVER}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{target}</p>
                        {sensor && (
                          <p className={`text-sm ${MUTED} truncate`}>{siteName(sensor.site_id)}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
                          it.closed
                            ? "bg-green-500/15 text-green-700 dark:text-green-400"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {it.closed ? "Cerrada" : "Abierta"}
                      </span>
                    </div>
                    {it.reason && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                        {it.reason}
                      </p>
                    )}
                    <p className={`mt-1 text-xs ${MUTED}`}>{formatAt(it.at)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}