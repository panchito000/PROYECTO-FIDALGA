'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faStore, 
  faUser, 
  faRightFromBracket,
  faUserShield 
} from '@fortawesome/free-solid-svg-icons';

export const AdminHeader = () => {
  const [user, setUser] = useState<any>(null);
  const [nombre, setNombre] = useState<string>('Administrador');
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: perfil } = await supabase
          .from('perfiles_usuario')
          .select('nombre_completo')
          .eq('id', user.id)
          .single();

        if (perfil?.nombre_completo) {
          setNombre(perfil.nombre_completo);
        } else if (user.user_metadata?.nombre_completo) {
          setNombre(user.user_metadata.nombre_completo);
        } else if (user.email) {
          setNombre(user.email.split('@')[0]);
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const inicial = nombre.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4 mb-8 relative">
      {/* Buscador Stylized */}
      <div className="relative flex-1 max-w-xl">
        <FontAwesomeIcon 
          icon={faMagnifyingGlass} 
          className="text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 text-sm"
        />
        <input
          type="text"
          placeholder="Buscar productos, clientes o pedidos..."
          className="w-full bg-white rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00c653] shadow-xs"
        />
      </div>

      {/* Perfil & Acciones Header */}
      <div className="flex items-center gap-3 shrink-0 relative">
        <Link 
          href="/" 
          className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#00c653] bg-white border border-gray-200 px-4 py-2 rounded-full transition-all shadow-xs hover:shadow-sm"
        >
          <FontAwesomeIcon icon={faStore} className="text-amber-500" />
          <span>Tienda Pública</span>
        </Link>

        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className="flex items-center gap-3 hover:opacity-90 transition-opacity focus:outline-none bg-white p-1.5 pl-3 rounded-full border border-gray-200 shadow-xs"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-tight">{nombre}</p>
            <p className="text-[10px] text-[#00c653] font-bold uppercase tracking-wider">Superusuario</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#00c653] text-white font-black text-sm flex items-center justify-center shadow-xs">
            {inicial}
          </div>
        </button>

        {/* Dropdown del Perfil */}
        {showMenu && (
          <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50 rounded-xl mb-1">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">Sesión Administrador</p>
              <p className="text-xs font-bold text-gray-900 truncate">{user?.email || 'Admin'}</p>
            </div>
            
            <div className="space-y-1">
              <Link 
                href="/perfil" 
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                <span>Ver Mi Perfil</span>
              </Link>

              <Link 
                href="/admin" 
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <FontAwesomeIcon icon={faUserShield} className="text-gray-400" />
                <span>Panel de Control</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
