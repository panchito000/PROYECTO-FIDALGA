'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { categoriasService, ofertasService, productosService } from '@/services';
import { esSeccionOfertas, normalizarNombreCategoria } from '@/services/categoriasService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWineBottle, faCheese, faBreadSlice, faBasketShopping, 
  faPumpSoap, faBabyCarriage, faBroom, faSnowflake, faTag,
  faChevronLeft, faChevronRight 
} from '@fortawesome/free-solid-svg-icons';

interface ProductoDisplay {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  precioAnterior?: number;
  porcentaje?: number;
}

export default function HomeLandingPage() {
  const [ofertas, setOfertas] = useState<ProductoDisplay[]>([]);
  const [novedades, setNovedades] = useState<ProductoDisplay[]>([]);
  const [nombresCategorias, setNombresCategorias] = useState<string[]>([]);
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
          precioAnterior: o.precioOriginal,
          porcentaje: o.porcentajeDescuento,
        })));

        const dataNovedades = await productosService.getNovedades(8);
        setNovedades(dataNovedades.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          precio: Number(p.precio) || 0,
          imagen_url: p.imagen_url,
        })));

        const cats = await categoriasService.getCategorias();
        if (cats.length > 0) {
          setNombresCategorias(cats.map((c) => c.nombre));
        }

      } catch (error) {
        console.error('Error cargando inicio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const iconClasses = "w-10 h-10 sm:w-12 sm:h-12 text-gray-500 group-hover:text-[#00c653] transition-colors duration-300";

  const iconoPorNombre = (nombre: string) => {
    const n = normalizarNombreCategoria(nombre);
    if (n.includes('bebida')) return faWineBottle;
    if (n.includes('lacteo')) return faCheese;
    if (n.includes('pan')) return faBreadSlice;
    if (n.includes('abarrote')) return faBasketShopping;
    if (n.includes('cuidado')) return faPumpSoap;
    if (n.includes('bebe')) return faBabyCarriage;
    if (n.includes('limpia')) return faBroom;
    if (n.includes('frio') || n.includes('congel') || n.includes('hielo')) return faSnowflake;
    if (n.includes('oferta')) return faTag;
    return faBasketShopping;
  };

  const categorias = ['Ofertas', ...(nombresCategorias.length > 0
    ? nombresCategorias.filter((n) => !esSeccionOfertas(n))
    : ['Bebidas', 'Lácteos', 'Panadería', 'Abarrotes', 'Cuidado', 'Bebés', 'Limpieza', 'Frío']
  )].map((name) => ({
    name,
    icon: <FontAwesomeIcon icon={iconoPorNombre(name)} className={iconClasses} />,
  }));

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
            <Link href="/categorias/Ofertas" className="text-sm text-gray-800 underline underline-offset-2 hover:text-[#00c653]">
              Ver Más
            </Link>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => scrollCarrusel(ofertasRef, 'left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 bg-white shadow-md border border-gray-100 rounded-full w-10 h-10 items-center justify-center text-gray-600 hover:text-[#00c653] hover:scale-110 transition-all hidden md:group-hover:flex"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div ref={ofertasRef} className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scroll">
              {loading && (
                <div className="py-10 w-full flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c653]" />
                </div>
              )}
              {!loading && ofertas.map((product) => (
                <div key={product.id} className="w-40 sm:w-48 shrink-0 snap-start">
                  <ProductCard
                    id={product.id}
                    nombre={product.nombre}
                    precio={product.precio}
                    imagen_url={product.imagen_url}
                    precioAnterior={product.precioAnterior}
                    porcentaje={product.porcentaje}
                  />
                </div>
              ))}
              {!loading && ofertas.length === 0 && <p className="text-gray-400 text-sm">No hay ofertas activas hoy.</p>}
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
                key={cat.name} 
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
              {loading && (
                <div className="py-10 w-full flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c653]" />
                </div>
              )}
              {!loading && novedades.map((product) => (
                <div key={product.id} className="w-40 sm:w-48 shrink-0 snap-start">
                  <ProductCard id={product.id} nombre={product.nombre} precio={product.precio} imagen_url={product.imagen_url} />
                </div>
              ))}
              {!loading && novedades.length === 0 && <p className="text-gray-400 text-sm">No hay novedades registradas.</p>}
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

      <Footer categorias={['Ofertas', ...nombresCategorias.filter((n) => !esSeccionOfertas(n))]} />

      <style dangerouslySetInnerHTML={{__html: `.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}
