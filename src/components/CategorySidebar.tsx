'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faTimes, faWineBottle, faCheese, faBreadSlice, faBasketShopping, 
  faPumpSoap, faBabyCarriage, faBroom, faSnowflake, faTag
} from '@fortawesome/free-solid-svg-icons';
import { categoriasService, esSeccionOfertas, normalizarNombreCategoria } from '@/services/categoriasService';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK = [
  { id: 'ofertas', name: 'Ofertas' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'lacteos', name: 'Lácteos' },
  { id: 'panaderia', name: 'Panadería' },
  { id: 'abarrotes', name: 'Abarrotes' },
  { id: 'cuidado', name: 'Cuidado' },
  { id: 'bebes', name: 'Bebés' },
  { id: 'limpieza', name: 'Limpieza' },
  { id: 'frio', name: 'Frío' },
];

function iconoDeCategoria(nombre: string): IconDefinition {
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
}

export const CategorySidebar = ({ isOpen, onClose }: CategorySidebarProps) => {
  const [categorias, setCategorias] = useState(FALLBACK);

  useEffect(() => {
    categoriasService
      .getCategorias()
      .then((rows) => {
        const desdeDb = rows
          .filter((c) => !esSeccionOfertas(c.nombre))
          .map((c) => ({ id: String(c.id), name: c.nombre }));
        setCategorias([{ id: 'ofertas', name: 'Ofertas' }, ...desdeDb]);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose}></div>
      )}

      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="bg-[#00c653] text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-wide">Categorías</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {categorias.map((cat) => (
              <li key={cat.id}>
                <Link 
                  href={`/categorias/${encodeURIComponent(cat.name)}`}
                  onClick={onClose}
                  className="flex items-center gap-4 px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-[#00c653] transition-colors group border-b border-gray-100 last:border-0"
                >
                  <div className="w-8 h-8 flex items-center justify-center text-gray-400 group-hover:text-[#00c653] transition-colors">
                    <FontAwesomeIcon icon={iconoDeCategoria(cat.name)} className="text-xl" />
                  </div>
                  <span className="font-medium text-sm">{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
