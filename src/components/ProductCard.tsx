'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  className?: string;
  precioAnterior?: number;
  porcentaje?: number;
}

function formatearBs(n: number) {
  return `Bs ${n.toFixed(2).replace('.', ',')}`;
}

export const ProductCard = ({
  id,
  nombre,
  precio,
  imagen_url,
  className = '',
  precioAnterior,
  porcentaje,
}: ProductCardProps) => {
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
    <div className={`w-full min-w-0 h-full bg-white border border-gray-200 rounded-lg p-3 flex flex-col ${className}`}>
      <div className="relative w-full aspect-square mb-3 bg-gray-50 rounded-md overflow-hidden shrink-0">
        {porcentaje != null && porcentaje > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-[#ffe4e6] text-red-700 text-[11px] font-black px-1.5 py-0.5 rounded">
            -{Math.round(porcentaje)}%
          </span>
        )}
        <img 
          src={imagen_url || 'https://via.placeholder.com/200'} 
          alt={nombre} 
          className="absolute inset-0 w-full h-full object-contain p-2"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200?text=Sin+imagen';
          }}
        />
      </div>
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-10 mb-2 leading-tight">
        {nombre}
      </h3>
      <div className="mt-auto">
        {precioAnterior != null && precioAnterior > precio ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-3">
            <span className="text-xs text-gray-400 line-through">{formatearBs(precioAnterior)}</span>
            <span className="text-lg font-black text-red-600">{formatearBs(precio)}</span>
          </div>
        ) : (
          <span className="text-lg font-bold text-gray-900 block mb-3">
            {formatearBs(precio)}
          </span>
        )}
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
