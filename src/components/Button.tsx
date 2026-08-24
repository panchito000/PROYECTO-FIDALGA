import React from 'react';

// Botón reutilizable que acepta todas las props nativas de un <button>
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

// Componente Button: estilizado con clases y permite pasar className adicional o props (onClick, disabled, etc.)
export const Button = ({ children, className = '', ...props }: ButtonProps) => {
  return (
    // Se aplica un estilo base y se concatenan clases adicionales que pueda pasar el consumidor
    <button
      className={`w-full bg-[#009e2f] hover:bg-[#008226] text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 ${className}`}
      {...props} // permite pasar atributos nativos como onClick, type, disabled...
    >
      {children}
    </button>
  );
};