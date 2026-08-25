'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
}

export const ProductCard = ({ id, nombre, precio, imagen_url }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id,
      title: nombre,
      price: precio,
      image: imagen_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="min-w-40 sm:min-w-50 bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="aspect-square w-full mb-3 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
        <img 
          src={imagen_url || 'https://via.placeholder.com/200'} 
          alt={nombre} 
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-1 leading-tight">
        {nombre}
      </h3>
      <div className="mt-auto">
        <span className="text-lg font-bold text-red-600 block mb-3">
          Bs{precio.toFixed(2)}
        </span>
        <button 
          onClick={handleAdd}
          className={`w-full font-semibold py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all ${
            added 
              ? 'bg-[#00c653] text-white border border-[#00c653]' 
              : 'border border-gray-800 text-gray-900 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {added ? '¡Agregado! ✓' : 'Agregar'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;