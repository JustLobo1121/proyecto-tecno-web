import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { getSensors } from "../api/sensors";
import { getSites } from "../api/sites";
import { getInterventions } from "../api/interventions";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const INTERVENTIONS_SHOWN = 5;

const centerRoute = (id) => `/sites/${id}`;

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
const DRAW_ORDER = ["ok", "no_data", "out_of_range"];

const MEDITIONS = {
  oxygen: { label: "Oxígeno", unit: "mg/L" },
  temperature: { label: "Temperatura", unit: "°C" },
  salinity: { label: "Salinidad", unit: "PSU" },
};

const CARD = "rounded-lg border p-4 bg-white dark:bg-gray-800 dark:text-white";
const HOVER = "transition hover:bg-gray-50 hover:shadow dark:hover:bg-gray-700/40";
const MUTED = "text-gray-600 dark:text-gray-400";
const AXIS_TEXT = "currentColor";
const CLOSED_VALUES = ["closed", "cerrada", "cerrado", "resolved", "done"];

const POINT_HOVER = [
  "[&_.recharts-scatter-symbol]:cursor-pointer",
  "[&_.recharts-scatter-symbol_path]:transition-all",
  "[&_.recharts-scatter-symbol:hover_path]:[stroke-width:6px]",
  "[&_.recharts-scatter-symbol:hover_path]:[fill-opacity:1]",
].join(" ");

const pad = (n) => String(n).padStart(2, "0");

const parseAt = (at) => new Date(at.slice(0, 19)).getTime();

function formatMs(ms) {
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatAt(at) {
  if (!at) return "";
  const [date, time] = at.split("T");
  const [, month, day] = date.split("-");
  return `${day}/${month} ${(time ?? "").slice(0, 5)}`;
}

const shortName = (n) => (n.length > 14 ? `${n.slice(0, 13)}…` : n);

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

function PointTooltip({ active, payload, siteName }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const med = MEDITIONS[d.medition] ?? { label: d.medition, unit: "" };
  return (
    <div className="rounded-lg border bg-white p-3 text-sm shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white">
      <p className="font-semibold">{d.name}</p>
      <p className={MUTED}>{siteName(d.site_id)}</p>
      <p>
        {d.y} {med.unit} · {STATUS[d.status]?.label ?? d.status}
      </p>
      {d.dev > 0 && (
        <p className="text-red-600 dark:text-red-400">
          {d.dev.toFixed(1)} {med.unit} {d.below ? "bajo el mínimo" : "sobre el máximo"}
        </p>
      )}
      {d.lo != null && d.hi != null && (
        <p className={MUTED}>
          Rango permitido: {d.lo} – {d.hi} {med.unit}
        </p>
      )}
      <p className={MUTED}>Última lectura: {formatAt(d.at)}</p>
      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
        Clic para ver el detalle del sensor
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [sensors, setSensors] = useState([]);
  const [sites, setSites] = useState([]);
  const [interventions, setInterventions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [xMode, setXMode] = useState("center");


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

  const base = sensors
    .filter((s) => s.last_reading?.at != null && s.last_reading?.value != null)
    .map((s) => {
      const v = s.last_reading.value;
      const lo = s[`${s.medition}_min`];
      const hi = s[`${s.medition}_max`];
      const below = lo != null && v < lo;
      const above = hi != null && v > hi;
      const dev = below ? lo - v : above ? v - hi : 0;
      const width = lo != null && hi != null ? hi - lo : null;
      return {
        id: s.id,
        site_id: s.site_id,
        name: s.sensor_name,
        status: s.status,
        medition: s.medition,
        at: s.last_reading.at,
        xt: parseAt(s.last_reading.at),
        y: v,
        lo,
        hi,
        dev,
        below,
        size:
          s.status === "out_of_range"
            ? Math.min(7, 2 + (width ? (5 * dev) / width : 0))
            : 1,
      };
    });

  const perSite = new Map();
  base.forEach((p) => {
    if (!perSite.has(p.site_id)) perSite.set(p.site_id, []);
    perSite.get(p.site_id).push(p);
  });
  const siteIds = [...perSite.keys()].sort((a, b) =>
    siteName(a).localeCompare(siteName(b))
  );
  const points = [];
  siteIds.forEach((id, ci) => {
    const group = perSite
      .get(id)
      .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
    const step = Math.min(0.2, 0.7 / Math.max(group.length - 1, 1));
    group.forEach((p, k) => {
      points.push({ ...p, xc: ci + (k - (group.length - 1) / 2) * step });
    });
  });

  const series = DRAW_ORDER.map((status) => ({
    status,
    data: points.filter((p) => p.status === status),
  }));

  const meditions = new Set(points.map((p) => p.medition));
  const mixedUnits = meditions.size > 1;
  const unit = !mixedUnits ? MEDITIONS[[...meditions][0]]?.unit ?? "" : "";
  const medLabel = !mixedUnits ? MEDITIONS[[...meditions][0]]?.label ?? "Valor" : "Valor";
  const yLabel = unit ? `${medLabel} (${unit})` : medLabel;

  const ranges = new Set(
    points.filter((p) => p.lo != null && p.hi != null).map((p) => `${p.lo}|${p.hi}`)
  );
  const firstRanged = points.find((p) => p.lo != null && p.hi != null);
  const band = !mixedUnits && ranges.size === 1 ? { lo: firstRanged.lo, hi: firstRanged.hi } : null;

  const byCenter = xMode === "center";
  const xAxisProps = byCenter
    ? {
        dataKey: "xc",
        name: "Centro",
        domain: [-0.5, siteIds.length - 0.5],
        ticks: siteIds.map((_, i) => i),
        tickFormatter: (i) => (siteIds[i] == null ? "" : shortName(siteName(siteIds[i]))),
        interval: 0,
        angle: -25,
        textAnchor: "end",
        height: 72,
      }
    : {
        dataKey: "xt",
        name: "Hora",
        domain: [(min) => min - 30 * 60_000, (max) => max + 30 * 60_000],
        tickFormatter: formatMs,
        tickCount: 6,
        height: 48,
      };

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

  function handlePointClick(p) {
    const d = p?.payload ?? p;
    if (d?.id == null) return;
    navigate(`/measurements?site_id=${d.site_id}&sensor_id=${d.id}`);
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Dashboard</h2>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="flex flex-col justify-center gap-4">
          <StatusCard status="out_of_range" count={counts.out_of_range} />
          <StatusCard status="no_data" count={counts.no_data} />
          <StatusCard status="ok" count={counts.ok} />
        </div>

        <div className={`${CARD} lg:col-span-2`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-bold">Última lectura de cada sensor</h3>
            <div className="flex gap-1 text-sm">
              {[
                ["center", "Por centro"],
                ["time", "Por hora"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setXMode(k)}
                  className={`rounded border px-3 py-1 ${
                    xMode === k ? "bg-gray-900 text-white dark:bg-gray-600" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <StatusLegend />
          </div>

          {points.length === 0 ? (
            <p className={MUTED}>Ningún sensor tiene lecturas para graficar.</p>
          ) : (
            <div className={`h-96 w-full ${MUTED} ${POINT_HOVER}`}>
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={AXIS_TEXT} strokeOpacity={0.25} />
                  <XAxis
                    type="number"
                    tick={{ fill: AXIS_TEXT, fontSize: 11 }}
                    stroke={AXIS_TEXT}
                    label={{
                      value: byCenter ? "Centro" : "Hora de la última lectura",
                      position: "insideBottom",
                      fill: AXIS_TEXT,
                      fontSize: 12,
                    }}
                    {...xAxisProps}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Valor"
                    width={64}
                    domain={[
                      (min) => Math.floor(Math.min(min, band?.lo ?? min) - 1),
                      (max) => Math.ceil(Math.max(max, band?.hi ?? max) + 1),
                    ]}
                    tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    stroke={AXIS_TEXT}
                    label={{
                      value: yLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: AXIS_TEXT,
                      fontSize: 12,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <ZAxis dataKey="size" domain={[1, 7]} range={[80, 420]} />

                  {band && (
                    <>
                      <ReferenceArea y1={band.lo} y2={band.hi} fill="#22c55e" fillOpacity={0.08} ifOverflow="visible" />
                      <ReferenceLine
                        y={band.lo}
                        stroke="#22c55e"
                        strokeDasharray="6 4"
                        ifOverflow="visible"
                        label={{ value: `Mín ${band.lo}`, position: "insideBottomRight", fill: "#22c55e", fontSize: 11 }}
                      />
                      <ReferenceLine
                        y={band.hi}
                        stroke="#22c55e"
                        strokeDasharray="6 4"
                        ifOverflow="visible"
                        label={{ value: `Máx ${band.hi}`, position: "insideTopRight", fill: "#22c55e", fontSize: 11 }}
                      />
                    </>
                  )}

                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={(props) => <PointTooltip {...props} siteName={siteName} />}
                  />
                  {series.map(({ status, data }) => (
                    <Scatter
                      key={status}
                      name={STATUS[status].label}
                      data={data}
                      fill={STATUS[status].color}
                      fillOpacity={0.8}
                      stroke={STATUS[status].color}
                      strokeWidth={1.5}
                      isAnimationActive={false}
                      onClick={handlePointClick}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          <p className={`text-xs ${MUTED} mt-2`}>
            {byCenter
              ? "Cada columna es un centro y cada burbuja un sensor; las más grandes están más lejos de su rango permitido."
              : "El eje horizontal es la hora de la última lectura: los sensores que dejaron de transmitir quedan más a la izquierda."}{" "}
            Los grises muestran el valor de su última lectura.
            {band && ` Franja verde: rango permitido (${band.lo}–${band.hi} ${unit}).`}
            {!band && ranges.size > 1 && " Los sensores tienen rangos permitidos distintos: se muestran al pasar el cursor."}
            {sensors.length > points.length &&
              ` ${sensors.length - points.length} sensor(es) sin lecturas no aparecen.`}
            {mixedUnits && " Hay sensores con distintas magnitudes: el eje vertical mezcla unidades."}
          </p>
        </div>
      </div>

      {/* Centros + intervenciones */}
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
                    key={it.id}
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