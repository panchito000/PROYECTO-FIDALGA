export const AdminHeader = () => {
  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div className="relative flex-1 max-w-xl">
        <svg
          className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar en el sistema..."
          className="w-full bg-white rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Admin Mike</p>
          <p className="text-xs text-[#22c55e] font-medium">Superusuario</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#f5c400] text-white font-bold flex items-center justify-center">
          M
        </div>
      </div>
    </header>
  );
};
