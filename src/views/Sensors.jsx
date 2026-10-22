import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getSensors } from "../api/sensors";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  ok: "OK",
  out_of_range: "Fuera de rango",
  no_data: "Sin transmitir",
};

const STATUS_STYLES = {
  ok: "bg-green-100 text-green-800 dark:bg-green-300 dark:text-green-1000",
  out_of_range: "bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-1000",
  no_data: "bg-red-100 text-red-800 dark:bg-red-300 dark:text-red-1000",
};

const mapping = [{name: "jaula", string: "Jaula"}, {name: "ponton", string: "Pontón"}]

export default function Sensors() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const position = searchParams.get("position") ?? "";
  const page = Number(searchParams.get("page") ?? 1);

  const [sensors, setSensors] = useState([]);
  const [allSensors, setAllSensors] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getSensors({ status, position, page, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setSensors(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, position, page]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  function goToPage(n) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(n));
    setSearchParams(next);
  }

  const totalPages = meta ? Math.max(1, Math.ceil(meta.totalCount / meta.pageSize)) : 1;

  useEffect(() => {getSensors().then((response) => setAllSensors(response.data))}, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sensores</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          className="rounded border px-3 py-2"
          value={status}
          onChange={(e) => updateFilter("status", e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ok">OK</option>
          <option value="out_of_range">Fuera de rango</option>
          <option value="no_data">Sin transmitir</option>
        </select>

        <select
          className="rounded border px-3 py-2"
          value={position}
          onChange={(e) => updateFilter("position", e.target.value)}
        >
          <option value="">Todas las posiciones</option>
          {
            // There is no way to declare const variables in here, so...
            // This dynamically generates the list of available positions depending on the current PAGE_SIZE
            // queried sensors instead of statically defining the available ones.
            // (that's bad practice, we don't know if another position may exist or not)
            [...new Set(allSensors.map((s) => s.position))].map((s) => <option value={s}>{mapping.find((e) => e.name === s) ? mapping.find((e) => e.name === s).string : s}</option>)
          }
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Cargando...</p>}

      {!loading && !error && (
        <>
          {sensors.length === 0 ? (
            <p>No hay sensores con esos filtros.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Centro</th>
                    <th className="py-2 pr-4">Posición</th>
                    <th className="py-2 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map((s) => {
                    const id = s.id ?? s._id;
                    return (
                      <tr key={id} className="border-b">
                        <td className="py-2 pr-4">{id}</td>
                        <td className="py-2 pr-4">{s.sensor_name}</td>
                        <td className="py-2 pr-4">{s.site_id}</td>
                        <td className="py-2 pr-4">{mapping.find((e) => e.name === s.position) ? mapping.find((e) => e.name === s.position).string : s.position}</td>
                        <td className="py-2 pr-4">
                          <span
                            className={`rounded px-2 py-1 text-sm ${
                              STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {STATUS_LABELS[s.status] ?? s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              className="rounded border px-3 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages} ({meta?.totalCount ?? 0} sensores)
            </span>
            <button
              className="rounded border px-3 py-1 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}