import { apiFetch, toQuery } from "./client";

export const getSensors = (params) => apiFetch(`/sensors${toQuery(params)}`);
export const getSensor = (id) => apiFetch(`/sensors/${id}`);