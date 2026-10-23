import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSensors } from "../api/sensors";

export default function Dashboard() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getSensors({ status: "no_data", page_size: 1 }),
      getSensors({ status: "out_of_range", page_size: 1 }),
      getSensors({ status: "ok", page_size: 1 }),
    ])
      .then(([noSignal, outOfRange, ok]) => {
        setCounts({
          noSignal: noSignal.meta.totalCount,
          outOfRange: outOfRange.meta.totalCount,
          ok: ok.meta.totalCount,
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>{error}</p>;
  if (!counts) return <p>Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/sensors?status=no_data" className="rounded-lg border p-4 hover:shadow">
          <p className="text-sm text-gray-500">Sin transmitir</p>
          <p className="text-4xl font-bold text-olive-500">{counts.noSignal}</p>
        </Link>

        <Link to="/sensors?status=out_of_range" className="rounded-lg border p-4 hover:shadow">
          <p className="text-sm text-gray-500">Fuera de rango</p>
          <p className="text-4xl font-bold text-rose-600">{counts.outOfRange}</p>
        </Link>

        <Link to="/sensors?status=ok" className="rounded-lg border p-4 hover:shadow">
          <p className="text-sm text-gray-500">Operativos</p>
          <p className="text-4xl font-bold text-emerald-500">{counts.ok}</p>
        </Link>
      </div>
    </div>
  );
}