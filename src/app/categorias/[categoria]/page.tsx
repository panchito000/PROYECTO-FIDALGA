'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { categoriasService, ofertasService, productosService } from '@/services';
import { esSeccionOfertas } from '@/services/categoriasService';
import { useParams } from 'next/navigation';

interface ProductoDB {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  precioAnterior?: number;
  porcentaje?: number;
}

export default function PaginaCategoria() {
  const params = useParams();
  const claveCategoria = decodeURIComponent(params.categoria as string);

  const [titulo, setTitulo] = useState(claveCategoria);
  const [productos, setProductos] = useState<ProductoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [sinCategoria, setSinCategoria] = useState(false);

  useEffect(() => {
    const fetchProductosPorCategoria = async () => {
      setLoading(true);
      setSinCategoria(false);
      try {
        if (esSeccionOfertas(claveCategoria)) {
          setTitulo('Ofertas');
          const ofertas = await ofertasService.getOfertasActivas();
          setProductos(
            ofertas.map((o: any) => ({
              id: String(o.id),
              nombre: String(o.nombre ?? ''),
              imagen_url: String(o.imagen_url ?? ''),
              precio: Number(o.precioDescuento ?? o.precio ?? 0),
              precioAnterior: Number(o.precioOriginal || 0) || undefined,
              porcentaje: Number(o.porcentajeDescuento || 0) || undefined,
            }))
          );
          return;
        }

        const categoria = await categoriasService.buscarCategoria(claveCategoria);
        if (!categoria) {
          setSinCategoria(true);
          setProductos([]);
          return;
        }

        setTitulo(categoria.nombre);
        const productosData = await productosService.getProductosPorCategoria(categoria.id);
        setProductos(
          (productosData || []).map((prod: Record<string, unknown>) => ({
            id: String(prod.id),
            nombre: String(prod.nombre ?? ''),
            imagen_url: String(prod.imagen_url ?? ''),
            precio: Number(prod.precio) || 0,
          }))
        );
      } catch (error) {
        console.error('Error cargando los productos:', error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductosPorCategoria();
  }, [claveCategoria]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c653]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full flex-1">
        
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 capitalize">
            {titulo}
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Explora todos los productos de la sección {titulo.toLowerCase()}.
          </p>
        </div>

        {productos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {productos.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id} 
                nombre={product.nombre} 
                precio={product.precio} 
                imagen_url={product.imagen_url}
                precioAnterior={product.precioAnterior}
                porcentaje={product.porcentaje}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl text-gray-600 font-medium">
              {sinCategoria
                ? 'No se encontró esta categoría.'
                : 'No se encontraron productos en esta categoría.'}
            </h2>
            <p className="text-gray-400 mt-2">Intenta volver más tarde o explora otras secciones.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
