export default function Dashboard({ setActivePage }) {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[28px] gap-[15px] sm:gap-0">
        <div>
          <p className="text-[#1783d1] text-[10px] font-extrabold tracking-[1.8px] m-[0_0_7px]">MONITOREO GENERAL</p>
          <h2 className="text-[27px] tracking-[-0.5px] m-[0_0_7px]">Resumen operacional</h2>
          <p className="text-[#8190a1] m-0 text-[13px]">Supervisa el estado de los centros y sensores en tiempo real.</p>
        </div>
        <div className="flex flex-col text-right bg-white border border-[#e5eaf0] rounded-[10px] p-[11px_17px]">
          <span className="text-[#9aa7b5] text-[9px] font-bold">HOY</span>
          <strong className="text-[12px] mt-[3px]">24 SEP 2026</strong>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[18px] mb-[20px]">
        <StatCard icon="⌖" title="Centros de cultivo" value="12" description="Centros monitoreados" type="blue" />
        <StatCard icon="◉" title="Sensores activos" value="84" description="Sensores registrados" type="green" />
        {/* Aquí irían el resto de tus tarjetas */}
      </div>
      
      {/* Resto de paneles (Estado de sensores, Alertas, etc.) seguirían la misma lógica de utility classes */}
    </>
  );
}

// Subcomponente StatCard modularizado
export function StatCard({ icon, title, value, description, type, onClick }) {
  // Manejo de colores según el "type" de tu CSS original
  const typeStyles = {
    blue: 'text-[#1484d2] bg-[#e6f3fd]',
    green: 'text-[#20a866] bg-[#e5f8ef]',
    orange: 'text-[#e58b19] bg-[#fff3df]',
    red: 'text-[#e64755] bg-[#ffe9eb]',
  };

  return (
    <div 
      className="bg-white border border-[#e5eaf0] rounded-[13px] p-[21px] cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_10px_25px_rgba(20,45,70,0.08)]"
      onClick={onClick}
    >
      <div className="flex justify-between">
        <div className={`flex items-center justify-center w-[38px] h-[38px] rounded-[9px] text-[19px] ${typeStyles[type]}`}>
          {icon}
        </div>
        <span className="text-[#aeb8c4]">↗</span>
      </div>
      <div className="text-[29px] font-[750] mt-[20px]">{value}</div>
      <div className="text-[13px] font-bold mt-[3px]">{title}</div>
      <div className="text-[#9aa6b3] text-[11px] mt-[5px]">{description}</div>
    </div>
  );
}