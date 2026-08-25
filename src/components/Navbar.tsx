'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, faUser, faCartShopping, faBars 
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/utils/supabase/client';

import { CategorySidebar } from './CategorySidebar';
import { LoginSidebar } from './LoginSidebar'; 
import { CartSidebar } from './CartSidebar';

export const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { cartCount } = useCart();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <header className="bg-[#00c653] w-full shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-3">
          
          {/* LADO IZQUIERDO: Botón de Menú y Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsCategorySidebarOpen(true)}
              className="text-white p-2 -ml-2 rounded-md hover:bg-white/20 transition-colors flex items-center justify-center"
              aria-label="Abrir menú de categorías"
            >
              <FontAwesomeIcon icon={faBars} className="text-xl sm:text-2xl" />
            </button>

            <Link href="/" className="flex items-center text-white font-black text-2xl md:text-3xl tracking-wider">
              FIDALGA
            </Link>
          </div>

          {/* CENTRO: Buscador Stylized */}
          <div className="w-full order-3 md:order-2 md:flex-1 md:max-w-2xl md:mx-8 relative">
            <input 
              type="text" 
              placeholder="Buscar en nuestra tienda..." 
              className="w-full py-2.5 pl-5 pr-12 rounded-full text-sm text-gray-900 bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all placeholder:text-gray-400"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-500 text-gray-900 flex items-center justify-center transition-colors shadow-xs">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
            </button>
          </div>

          {/* LADO DERECHO: Íconos */}
          <div className="flex items-center gap-4 sm:gap-6 order-2 md:order-3 text-white">
            <button onClick={() => setIsLoginOpen(true)} className="flex flex-col items-center gap-0.5 hover:text-gray-100 transition-colors">
              <FontAwesomeIcon icon={faUser} className="text-lg sm:text-xl" />
              <span className="text-[10px] sm:text-xs font-semibold">
                {user ? 'Mi Cuenta' : 'Registrarse'}
              </span>
            </button>
            
            <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-0.5 hover:text-gray-100 transition-colors relative">
              <FontAwesomeIcon icon={faCartShopping} className="text-lg sm:text-xl" />
              <span className="text-[10px] sm:text-xs font-semibold">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Sidebars */}
      <LoginSidebar isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <CategorySidebar isOpen={isCategorySidebarOpen} onClose={() => setIsCategorySidebarOpen(false)} />
    </>
  );
};