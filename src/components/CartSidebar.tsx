'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { items, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const router = useRouter();

  const handleProceedCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {/* Overlay semitransparente */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} />}

      {/* Contenedor lateral */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Cabecera del sidebar */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            MI CARRITO ({cartCount})
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Lista de items */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <p className="font-semibold text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative">
                <button onClick={() => removeFromCart(item.id)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-400 hover:text-red-500 shadow-sm border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-contain" /> : 'Img'}
                </div>
                
                <div className="flex flex-col justify-between flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-lg font-black text-red-600">Bs{(item.price * item.qty).toFixed(2)}</span>
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full font-bold shadow-sm text-gray-700 hover:bg-gray-200">-</button>
                      <span className="text-sm font-bold text-gray-800">{item.qty}</span>
                      <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full font-bold shadow-sm text-gray-700 hover:bg-gray-200">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie del sidebar */}
        <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-semibold text-sm">Subtotal</span>
            <span className="text-xl font-black text-gray-900">Bs{cartTotal.toFixed(2)}</span>
          </div>
          <button 
            disabled={items.length === 0} 
            onClick={handleProceedCheckout}
            className="w-full bg-[#00c653] hover:bg-[#00a846] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-full transition-colors text-sm shadow-md"
          >
            Proceder al Pago
          </button>
        </div>
      </div>
    </>
  );
};