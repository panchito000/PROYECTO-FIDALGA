'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaz del producto adaptada para leer el UUID (string) de tu base de datos
export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;

  // T3: permite vaciar todo el carrito después de guardar el pedido
  clearCart: () => void;

  cartCount: number;
  cartTotal: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('fidalga_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fidalga_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // T3: vacía completamente el carrito después de realizar un pedido correctamente
  const clearCart = () => {
    setItems([]);
  };

  // Agrega un producto o incrementa su cantidad si ya existe en el carrito
  const addToCart = (product: Omit<CartItem, 'qty'>) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, qty: 1 }];
    });
  };

  // Elimina un producto completamente del carrito usando su UUID
  const removeFromCart = (id: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  // Actualiza la cantidad exacta de un producto (evita que baje de 1)
  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, qty } : item
      )
    );
  };

  // Cálculos dinámicos: se actualizan solos cada vez que 'items' cambia
  const cartCount = items.reduce(
    (total, item) => total + item.qty,
    0
  );

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,

        // T3: exponemos clearCart para que checkout pueda
        // vaciar el carrito después de guardar el pedido correctamente
        clearCart,

        cartCount,
        cartTotal,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para consumir el carrito fácilmente en cualquier componente
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart debe usarse dentro de un CartProvider'
    );
  }

  return context;
};