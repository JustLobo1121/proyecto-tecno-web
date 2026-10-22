import React from 'react';

// 1. COMPONENTE: CLIMA
const WeatherCard = () => {
  return (
    <div className="bg-[#0f172a]/60 border border-slate-800 rounded-xl p-6 text-slate-300 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        <span className="text-purple-400">🌡️</span> Clima
      </div>
      
      <div className="flex flex-col mb-4">
        <span className="text-5xl font-black text-white tracking-tight">9.8°C</span>
        <span className="text-sm text-slate-400 mt-1">Niebla</span>
      </div>

      <div className="space-y-2 text-xs border-b border-slate-800/60 pb-4">
        <div className="flex justify-between">
          <span className="text-slate-400">Sensación</span>
          <span className="font-bold text-slate-200">8.9°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Humedad</span>
          <span className="font-bold text-white">95%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Máx / Mín</span>
          <span className="font-bold">
            <span className="text-red-400 mr-2">14.2°</span> / <span className="text-cyan-400">7.6°</span>
          </span>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 mt-4">
        Open-Meteo · El baño de la Ulagos · obs. 08:45 a. m.
      </div>
    </div>
  );
};

// 2. COMPONENTE: VIENTO
const WindCard = () => {
  return (
    <div className="bg-[#0f172a]/60 border border-slate-800 rounded-xl p-6 text-slate-300 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        <span className="text-cyan-400">💨</span> Viento
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl font-black text-cyan-400 tracking-tight">3.9</span>
        <span className="text-sm text-slate-400 font-medium">km/h</span>
      </div>

      <div className="space-y-2 text-xs border-b border-slate-800/60 pb-4">
        <div className="flex justify-between">
          <span className="text-slate-400">Sur (202°)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Ráfaga máx.</span>
          <span className="font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">15.5 km/h</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 mt-9">
        Open-Meteo · 10m · km/h · 08:45 a. m.
      </div>
    </div>
  );
};

// 3. COMPONENTE: MAREAS
const TidesCard = () => {
  return (
    <div className="bg-[#0f172a]/60 border border-slate-800 rounded-xl p-6 text-slate-300 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        <span className="text-blue-400">🌊</span> Mareas
      </div>

      <div className="space-y-4 text-xs border-b border-slate-800/60 pb-4">
        <div className="flex justify-between items-start">
          <span className="text-slate-400 font-medium">Pleamar</span>
          <div className="text-right">
            <p className="font-bold text-white text-sm">05:09 p. m.</p>
            <p className="text-cyan-400 text-[11px]">2.2m</p>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-slate-400 font-medium">Bajamar</span>
          <div className="text-right">
            <p className="font-bold text-slate-300 text-sm">10:52 p. m.</p>
            <p className="text-slate-400 text-[11px]">0.9m</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
          <span className="text-slate-400">Altura actual</span>
          <span className="font-black text-sm text-white bg-slate-800 px-2 py-0.5 rounded">1.3m</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 mt-4">
        tablademareas.com · 7 abr 2026
      </div>
    </div>
  );
};

// 4. COMPONENTE: PRESIÓN
const PressureCard = () => {
  return (
    <div className="bg-[#0f172a]/60 border border-slate-800 rounded-xl p-6 text-slate-300 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        <span className="text-slate-400">🌐</span> Presión
      </div>

      <div className="flex flex-col mb-4">
        <span className="text-5xl font-black text-rose-500 tracking-tight">1024</span>
        <span className="text-xs text-slate-400 font-medium mt-1">hPa</span>
      </div>

      <div className="space-y-2 text-xs border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span>→</span> <span className="font-medium">Estable</span>
        </div>
        <div className="text-slate-400 leading-relaxed">
          Actividad normal de peces
        </div>
      </div>

      <div className="text-[10px] text-slate-500 mt-4">
        Open-Meteo · nivel del mar · 08:45 a. m.
      </div>
    </div>
  );
};

// COMPONENTE CONTENEDOR PRINCIPAL
function Measurements() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      {/* Encabezado superior */}
      <div className="mb-8 border-b border-slate-800 pb-4">
        <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
          Condiciones en
        </div>
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
          El baño de la Ulagos
        </h1>
      </div>

      {/* Grid Responsivo que renderiza las 4 secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <WeatherCard />
        <WindCard />
        <TidesCard />
        <PressureCard />
      </div>
    </div>
  );
}

export default Measurements;