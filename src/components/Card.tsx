import React from 'react';

// Card es un contenedor visual con header opcional (title) y espacio para children
interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    // Clase base para fondo, bordes y padding. className permite extender estilos desde quien lo usa.
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Si se pasa title, se muestra como cabecera del card */}
      {title && <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>}
      {/* Zona principal del card donde se renderiza el contenido hijo */}
      {children}
    </div>
  );
};