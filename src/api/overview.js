import { apiFetch } from "./client";

export const OVERVIEW_DEFAULTS = { days: 7 };

export const MAGNITUDES = {
  oxygen: { label: "Oxígeno", unit: "mg/L" },
  saturation: { label: "Saturación", unit: "%" },
  temperature: { label: "Temperatura", unit: "°C" },
  salinity: { label: "Salinidad", unit: "PSU" },
};

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    } else {
      query.append(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export function getOverview(params = {}, options = {}) {
  const merged = { ...OVERVIEW_DEFAULTS, ...params };
  return apiFetch(`/measurements/overview${buildQuery(merged)}`, options);
}

export const getSiteOverview = (siteId, params = {}, options = {}) =>
  getOverview({ ...params, site_id: siteId }, options);

export async function getOverviewForSites(siteIds, params = {}, options = {}) {
  const results = await Promise.all(
    siteIds.map((id) => getSiteOverview(id, params, options).catch(() => null))
  );
  return new Map(siteIds.map((id, i) => [id, results[i]]));
}

export function toSeries(raw) {
  return Array.isArray(raw?.data) ? raw.data : [];
}

export function toRows(raw) {
  return toSeries(raw).flatMap((s) =>
    (s.points ?? []).map((p) => ({
      sensor_id: s.sensor_id,
      sensor_name: s.sensor_name,
      depth: s.depth,
      position: s.position,
      ...p,
    }))
  );
}

export function latestPerSensor(raw) {
  return toSeries(raw).map((s) => {
    const last = (s.points ?? []).reduce(
      (acc, p) => (!acc || p.bucket > acc.bucket ? p : acc),
      null
    );
    return {
      sensor_id: s.sensor_id,
      sensor_name: s.sensor_name,
      depth: s.depth,
      position: s.position,
      ...last,
    };
  });
}

export async function getSensorSeries(siteId, sensorId, params = {}, options = {}) {
  const raw = await getSiteOverview(siteId, params, options);
  return toSeries(raw).find((s) => String(s.sensor_id) === String(sensorId)) ?? null;
}