'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { ofertasService, productosService } from '@/services';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWineBottle, faCheese, faBreadSlice, faBasketShopping, 
  faPumpSoap, faBabyCarriage, faBroom, faSnowflake,
  faChevronLeft, faChevronRight 
} from '@fortawesome/free-solid-svg-icons';

interface ProductoDisplay {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
}

export default function HomeLandingPage() {
  const [ofertas, setOfertas] = useState<ProductoDisplay[]>([]);
  const [novedades, setNovedades] = useState<ProductoDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const ofertasRef = useRef<HTMLDivElement | null>(null);
  const novedadesRef = useRef<HTMLDivElement | null>(null);

  // Desplazamiento horizontal de los carruseles
  const scrollCarrusel = (ref: React.RefObject<HTMLDivElement | null>, direccion: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.75; 
      ref.current.scrollBy({
        left: direccion === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Cargar ofertas y novedades de la base de datos
  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true);
      try {
        const dataOfertas = await ofertasService.getOfertasActivas();
        setOfertas(dataOfertas.map((o: any) => ({
          id: o.id,
          nombre: o.nombre,
          precio: o.precioDescuento,
          imagen_url: o.imagen_url,
        })));

        const dataNovedades = await productosService.getNovedades(8);
        setNovedades(dataNovedades.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          precio: Number(p.precio) || 0,
          imagen_url: p.imagen_url,
        })));

      } catch (error) {
        console.error('Error cargando inicio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const iconClasses = "w-10 h-10 sm:w-12 sm:h-12 text-gray-500 group-hover:text-[#00c653] transition-colors duration-300";

  const categorias = [
    { id: 1, name: 'Bebidas', icon: <FontAwesomeIcon icon={faWineBottle} className={iconClasses} /> },
    { id: 2, name: 'Lácteos', icon: <FontAwesomeIcon icon={faCheese} className={iconClasses} /> },
    { id: 3, name: 'Panadería', icon: <FontAwesomeIcon icon={faBreadSlice} className={iconClasses} /> },
    { id: 4, name: 'Abarrotes', icon: <FontAwesomeIcon icon={faBasketShopping} className={iconClasses} /> },
    { id: 5, name: 'Cuidado', icon: <FontAwesomeIcon icon={faPumpSoap} className={iconClasses} /> },
    { id: 6, name: 'Bebés', icon: <FontAwesomeIcon icon={faBabyCarriage} className={iconClasses} /> },
    { id: 7, name: 'Limpieza', icon: <FontAwesomeIcon icon={faBroom} className={iconClasses} /> },
    { id: 8, name: 'Frío', icon: <FontAwesomeIcon icon={faSnowflake} className={iconClasses} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c653]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Banner Principal */}
      <section className="w-full bg-[#f3f4f6]">
        <img 
          src="https://i.postimg.cc/pdGy55fz/Fidalga-Banner.webp" 
          alt="Banner Fidalga" 
          className="w-full h-auto object-cover sm:max-h-170"
        />
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
        
        {/* Carrusel de Ofertas */}
        <section>
          <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-600">Ofertas</h2>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => scrollCarrusel(ofertasRef, 'left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 bg-white shadow-md border border-gray-100 rounded-full w-10 h-10 items-center justify-center text-gray-600 hover:text-[#00c653] hover:scale-110 transition-all hidden md:group-hover:flex"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div ref={ofertasRef} className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scroll">
              {ofertas.map((product) => (
                <ProductCard key={product.id} id={product.id} nombre={product.nombre} precio={product.precio} imagen_url={product.imagen_url} />
              ))}
              {ofertas.length === 0 && <p className="text-gray-400 text-sm">No hay ofertas activas hoy.</p>}
            </div>

            <button 
              onClick={() => scrollCarrusel(ofertasRef, 'right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 bg-white shadow-md border border-gray-100 rounded-full w-10 h-10 items-center justify-center text-gray-600 hover:text-[#00c653] hover:scale-110 transition-all hidden md:group-hover:flex"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>

        {/* Sección de Categorías */}
        <section className="bg-gray-50 p-4 sm:p-8 rounded-2xl">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Categorías</h2>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 text-center">
            {categorias.map(cat => (
              <Link 
                key={cat.id} 
                href={`/categorias/${encodeURIComponent(cat.name)}`} 
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:-translate-y-1.5 group-hover:shadow-md group-hover:border-[#00c653]/30 transition-all duration-300">
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#00c653] transition-colors duration-300">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Carrusel de Novedades */}
        <section>
          <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Novedades</h2>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => scrollCarrusel(novedadesRef, 'left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 bg-white shadow-md border border-gray-100 rounded-full w-10 h-10 items-center justify-center text-gray-600 hover:text-[#00c653] hover:scale-110 transition-all hidden md:group-hover:flex"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div ref={novedadesRef} className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scroll">
              {novedades.map((product) => (
                <ProductCard key={product.id} id={product.id} nombre={product.nombre} precio={product.precio} imagen_url={product.imagen_url} />
              ))}
              {novedades.length === 0 && <p className="text-gray-400 text-sm">No hay novedades registradas.</p>}
            </div>

            <button 
              onClick={() => scrollCarrusel(novedadesRef, 'right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 bg-[#ffffff] shadow-md border border-gray-100 rounded-full w-10 h-10 items-center justify-center text-gray-600 hover:text-[#00c653] hover:scale-110 transition-all hidden md:group-hover:flex"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}
