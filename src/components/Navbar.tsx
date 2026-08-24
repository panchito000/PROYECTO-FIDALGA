'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoginSidebar } from './LoginSidebar';
import { CartSidebar } from './CartSidebar';
import { useCart } from '@/context/CartContext';


export const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const { cartCount } = useCart();

  // Envía al usuario a la página de resultados atrapando el texto escrito
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <header className="bg-[#00c653] w-full">
        {/* Contenedor principal: flex-wrap permite que el buscador baje en móviles */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-4">
          
          {/* 1. Logo (Orden 1 siempre) */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl md:text-2xl tracking-wide">
            <span>FIDALGA</span>
          </Link>

          {/* 2. Buscador (En móvil baja a la fila 2 ocupando 100%, en PC va al centro) */}
<div className="w-full order-3 md:order-2 md:flex-1 md:max-w-2xl px-0 md:px-8">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Buscar en nuestra tienda" 
                className="w-full py-2.5 pl-4 pr-10 rounded-full bg-white text-gray-800 focus:outline-none shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {/* Botón de búsqueda con efecto hover, escala y transición suave */}
              <button 
                type="submit" 
                className="absolute right-3 top-2 text-[#ffb000] hover:text-[#e59e00] hover:scale-110 hover:bg-slate-200 rounded-md transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
          {/* 3. Íconos de Acción (En móvil orden 2 al lado del logo, en PC orden 3 a la derecha) */}
          <div className="flex items-center gap-4 sm:gap-6 text-white text-xs font-medium order-2 md:order-3">
{/* Botón Registrarse */}
            <button 
              onClick={() => setIsLoginOpen(true)} 
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:text-white hover:bg-[#06bd52] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="hidden sm:block">Registrarse</span>
            </button>

            {/* Botón Carrito */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:text-white hover:bg-[#06bd52] transition-colors relative"
            >
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 sm:right-1 bg-[#ffb000] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span className="hidden sm:block">Carrito</span>
            </button>
          </div>
        </div>

        {/* Menú inferior escondido en móviles muy pequeños */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-2 items-center justify-between text-white text-sm font-semibold">
          <nav className="flex gap-6">
            <Link href="/" className="hover:underline">Inicio</Link>
            <Link href="/categorias" className="hover:underline">Categorías</Link>
          </nav>
        </div>
      </header>

      {/* Renderizado de Sidebars (Menús laterales) */}
      <LoginSidebar isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};