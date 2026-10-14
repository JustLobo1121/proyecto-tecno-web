import { apiFetch, toQuery } from "./client";

export const getInterventions = (params) => apiFetch(`/interventions${toQuery(params)}`);

export const createIntervention = (data) =>
  apiFetch("/interventions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  