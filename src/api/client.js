const BASE_URL = import.meta.env.VITE_API_URL;
export const TOKEN_KEY = "token";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/";
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body.detail === "string" ? body.detail : "Error en la petición";
    throw new Error(message);
  }

  return response.json();
}

export function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}