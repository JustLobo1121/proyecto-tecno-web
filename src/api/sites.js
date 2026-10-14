import { apiFetch, toQuery } from "./client";

export const getSites = (params) => apiFetch(`/sites${toQuery(params)}`);
export const getSite = (id) => apiFetch(`/sites/${id}`);