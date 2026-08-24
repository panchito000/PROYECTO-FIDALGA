import React from 'react';

// Props del componente Badge: recibe contenido (children) y un 'variant' opcional
interface BadgeProps {
  children: React.ReactNode;
  // variant determina la paleta de colores del badge (por defecto 'info')
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

// Componente visual pequeño usado para mostrar etiquetas o estados (ej. "Nuevo", "En oferta")
export const Badge = ({ children, variant = 'info' }: BadgeProps) => {
  // Mapa simple que asocia cada variante a clases de Tailwind para color y fondo
  const colors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    // Se combinan clases comunes con las específicas según la variante seleccionada
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[variant]}`}>
      {children}
    </span>
  );
};