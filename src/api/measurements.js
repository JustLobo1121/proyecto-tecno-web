import { apiFetch, toQuery } from "./client";

export const getMeasurements = (params) => apiFetch(`/measurements${toQuery(params)}`);
export const getMeasurementsOverview = (params) =>
  apiFetch(`/measurements/overview${toQuery(params)}`);