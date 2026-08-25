'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faWineBottle, faCheese, faBreadSlice, faBasketShopping, 
  faPumpSoap, faBabyCarriage, faBroom, faSnowflake 
} from '@fortawesome/free-solid-svg-icons';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategorySidebar = ({ isOpen, onClose }: CategorySidebarProps) => {
  const categorias = [
    { id: 1, name: 'Bebidas', icon: faWineBottle },
    { id: 2, name: 'Lácteos', icon: faCheese },
    { id: 3, name: 'Panadería', icon: faBreadSlice },
    { id: 4, name: 'Abarrotes', icon: faBasketShopping },
    { id: 5, name: 'Cuidado', icon: faPumpSoap },
    { id: 6, name: 'Bebés', icon: faBabyCarriage },
    { id: 7, name: 'Limpieza', icon: faBroom },
    { id: 8, name: 'Frío', icon: faSnowflake },
  ];

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
                    <FontAwesomeIcon icon={cat.icon} className="text-xl" />
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