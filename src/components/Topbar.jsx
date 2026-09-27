function Topbar({ currentLabel }) {
  return (
    <header className="flex items-center justify-between h-[72px] bg-white border-b border-[#e6ebf1] px-[20px] md:px-[36px]">
      <div>
        <span className="text-[#9ba7b5] text-[11px] tracking-[0.5px] mr-[8px]">
          ULA MONITORS /
        </span>
        <strong className="text-[13px]">{currentLabel}</strong>
      </div>

      <div className="flex items-center gap-[25px]">
        <div className="hidden md:flex items-center gap-[7px] text-[#667487] text-[12px]">
          <span className="w-[7px] h-[7px] rounded-full bg-[#25c77a]"></span>
          Sistema operativo
        </div>

        <button className="relative bg-transparent border-0 text-[18px] cursor-pointer">
          🔔
          <span className="absolute -top-[5px] -right-[7px] flex items-center justify-center min-w-[16px] h-[16px] bg-[#ef4e5c] text-white text-[9px] rounded-full">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
export default Topbar