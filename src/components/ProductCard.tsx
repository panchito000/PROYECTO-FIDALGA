'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  id: string; // UUID referencial
  nombre: string;
  precio: number;
  imagen_url?: string;
}

export const ProductCard = ({ id, nombre, precio, imagen_url }: ProductCardProps) => {
  const { addToCart } = useCart();

  // Función puente: Adapta los datos del producto a la estructura del carrito
  const handleAddToCart = () => {
    addToCart({ id, title: nombre, price: precio, image: imagen_url });
  };

  return (
    // min-w-50 para que no se estiren demasiado en carrusel de móvil
    <div className="bg-white border border-gray-200 p-3 sm:p-4 flex flex-col h-full hover:shadow-lg transition-shadow relative min-w-50 snap-start rounded-lg">
      
      {/* Contenedor de imagen responsivo */}
      <div className="aspect-square bg-gray-50 mb-3 flex items-center justify-center p-2 overflow-hidden">
        {imagen_url ? (
          <img src={imagen_url} alt={nombre} className="object-contain w-full h-full" />
        ) : (
          <span className="text-xs text-gray-400">Img</span>
        )}
      </div>
      
      {/* line-clamp-2 asegura que títulos largos no rompan la tarjeta */}
      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-4 line-clamp-2 min-h-10">{nombre}</h3>
      
      <div className="flex items-center gap-2 mb-4 mt-auto">
        <span className="text-base sm:text-lg font-black text-red-600">Bs{precio.toFixed(2)}</span>
      </div>
      
      {/* Botón de acción */}
      <button 
        onClick={handleAddToCart}
        className="w-full border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold py-1.5 sm:py-2 px-2 rounded-full transition-colors text-xs sm:text-sm"
      >
        Agregar
      </button>
    </div>
  );
};