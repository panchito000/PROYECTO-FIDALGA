'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { createClient } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';

interface ProductoDB {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
}

export default function PaginaCategoria() {
  const params = useParams();
  const nombreCategoria = decodeURIComponent(params.categoria as string);

  const [productos, setProductos] = useState<ProductoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProductosPorCategoria = async () => {
      setLoading(true);
      try {
        const { data: categoriaData, error: catError } = await supabase
          .from('categorias')
          .select('id')
          .eq('nombre', nombreCategoria)
          .single(); 

        if (catError) {
          setLoading(false);
          return;
        }

        const { data: productosData, error: prodError } = await supabase
          .from('productos')
          .select('id, nombre, precio, imagen_url')
          .eq('estado', true)
          .eq('categoria_id', categoriaData.id);

        if (prodError) throw prodError;

        if (productosData) {
          const productosProcesados = productosData.map((prod: any) => ({
            id: prod.id,
            nombre: prod.nombre,
            imagen_url: prod.imagen_url,
            precio: Number(prod.precio) || 0,
          }));
          setProductos(productosProcesados as ProductoDB[]);
        }
      } catch (error) {
        console.error('Error cargando los productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductosPorCategoria();
  }, [nombreCategoria]);

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
            {nombreCategoria}
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Explora todos los productos de la sección {nombreCategoria.toLowerCase()}.
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl text-gray-600 font-medium">No se encontraron productos en esta categoría.</h2>
            <p className="text-gray-400 mt-2">Intenta volver más tarde o explora otras secciones.</p>
          </div>
        )}
      </main>
    </div>
  );
}
