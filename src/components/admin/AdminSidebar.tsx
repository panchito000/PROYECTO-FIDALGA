'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { esRolEmpleado, leerPerfilRol } from '@/utils/roles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, 
  faBoxesPacking, 
  faTag, 
  faReceipt, 
  faChartPie, 
  faArrowLeft, 
  faRightFromBracket,
  faStore
} from '@fortawesome/free-solid-svg-icons';

const items = [
  { href: '/admin', label: 'Inicio', exact: true, icon: faHouse },
  { href: '/admin/inventario', label: 'Inventario', exact: false, icon: faBoxesPacking },
  { href: '/admin/ofertas', label: 'Ofertas', exact: false, icon: faTag },
  { href: '/admin/pedidos', label: 'Pedidos', exact: false, icon: faReceipt },
  { href: '/admin/reportes', label: 'Reportes', exact: false, icon: faChartPie },
];

const rutasSoloAdmin = ['/admin/ofertas', '/admin/reportes'];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>('');
  const [esEmpleado, setEsEmpleado] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
      if (user?.id) {
        const perfil = await leerPerfilRol(supabase, user.id);
        setEsEmpleado(esRolEmpleado(perfil, user));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (esEmpleado && rutasSoloAdmin.some((ruta) => pathname.startsWith(ruta))) {
      router.replace('/admin');
    }
  }, [esEmpleado, pathname, router]);

  const menu = items.filter((item) => {
    if (esEmpleado && rutasSoloAdmin.includes(item.href)) {
      return false;
    }
    return true;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-55 shrink-0 bg-[#00c653] text-white flex flex-col justify-between min-h-screen shadow-lg">
      <div>
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-3 px-5 py-6 font-black text-xl tracking-wider border-b border-white/20">
          <FontAwesomeIcon icon={faStore} className="text-2xl text-amber-300" />
          <span>FIDALGA</span>
        </Link>

        {/* Navegación Principal */}
        <nav className="px-3 mt-4 flex flex-col gap-1">
          {menu.map((item) => {
            const activo = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activo 
                    ? 'bg-white text-gray-900 shadow-md translate-x-1' 
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className={`text-base ${activo ? 'text-[#00c653]' : 'text-white/80'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sección Inferior del Perfil y Logout */}
      <div className="p-3 border-t border-white/20 space-y-2 bg-black/10">
        {userEmail && (
          <div className="px-3 py-1.5 bg-white/10 rounded-xl">
            <p className="text-[10px] uppercase font-extrabold text-green-200">
              {esEmpleado ? 'Empleado' : 'Administrador'}
            </p>
            <p className="text-xs font-bold text-white truncate">{userEmail}</p>
          </div>
        )}

        <Link
          href="/"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/15 rounded-xl transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Volver a la Tienda</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-900 bg-white/20 hover:bg-white hover:text-red-600 rounded-xl transition-all shadow-xs"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
