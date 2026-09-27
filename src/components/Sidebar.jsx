function Sidebar({ activePage, setActivePage, menuItems }) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 z-10 flex flex-col w-[70px] md:w-[260px] min-h-screen bg-gradient-to-b from-[#071d35] to-[#092b4d] text-white px-[10px] md:px-[18px] py-[20px] md:py-[28px] transition-all">
      
      {/* LOGO */}
      <div className="flex items-center justify-center md:justify-start gap-[12px] px-0 md:px-[12px] pb-[25px] md:pb-[32px]">
        <div className="flex items-center justify-center w-[44px] h-[44px] rounded-[12px] bg-white/10 text-[23px]">
          🌊
        </div>
        <div className="hidden md:block">
          <h1 className="m-0 text-[22px] tracking-[3px] leading-none">ULA</h1>
          <span className="text-[10px] tracking-[3px] text-[#7fa4c8]">MONITORS</span>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1">
        <span className="hidden md:block text-[#6d91b5] text-[10px] font-bold tracking-[1.5px] px-[12px] pb-[10px]">
          MONITOREO
        </span>

        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center justify-center md:justify-start gap-[13px] p-[13px_0] md:p-[13px_14px] mb-[5px] rounded-[10px] text-left transition-colors duration-200 ${
              activePage === item.id
                ? 'bg-[#1479c9] text-white shadow-[0_6px_20px_rgba(20,121,201,0.25)]'
                : 'text-[#9bb4cc] bg-transparent hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="w-[22px] text-center text-[18px]">{item.icon}</span>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {/* USER */}
      <div>
        <button className="w-full flex items-center justify-center md:justify-start gap-[13px] p-[13px_0] md:p-[13px_14px] mb-[5px] rounded-[10px] text-left text-[#9bb4cc] bg-transparent hover:bg-white/10 hover:text-white transition-colors">
          <span className="w-[22px] text-center text-[18px]">⚙</span>
          <span className="hidden md:inline">Configuración</span>
        </button>

        <div className="flex items-center justify-center md:justify-start gap-[10px] p-[20px_5px_5px] border-t border-white/10 mt-[10px]">
          <div className="flex items-center justify-center w-[38px] h-[38px] bg-[#1686d9] rounded-full font-bold">
            A
          </div>
          <div className="hidden md:flex flex-col flex-1">
            <strong className="text-[13px]">Administrador</strong>
            <span className="text-[11px] text-[#7898b5] mt-[3px]">Sesión activa</span>
          </div>
          <span className="hidden md:block w-[8px] h-[8px] bg-[#28c76f] rounded-full"></span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar