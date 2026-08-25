'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/admin', label: 'Inicio', exact: true },
  { href: '/admin/inventario', label: 'Inventario', exact: false },
  { href: '/admin/pedidos', label: 'Pedidos', exact: false },
  { href: '/admin/reportes', label: 'Reportes', exact: false },
];

function Icono({ nombre }: { nombre: string }) {
  const cls = 'w-5 h-5';
  if (nombre === 'Inicio') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    );
  }
  if (nombre === 'Inventario') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  }
  if (nombre === 'Pedidos') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5h6M9 12h6m-7 7h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v11a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-6m4 6V7m4 10v-4M5 21h14a2 2 0 002-2V5" />
    </svg>
  );
}

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-[#22c55e] text-white flex flex-col min-h-screen">
      {/* logo como en el mockup */}
      <Link href="/admin" className="flex items-center gap-2 px-5 py-5 font-bold text-lg">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.63.63-.18 1.7.71 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Fidalga
      </Link>

      <nav className="px-3 mt-2 flex flex-col gap-1">
        {items.map((item) => {
          const activo = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activo ? 'bg-white text-gray-800' : 'text-white hover:bg-white/15'
              }`}
            >
              <Icono nombre={item.label} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
