import React from 'react';

// Input reutilizable con label y opción de icono dentro del campo (ej. icono para limpiar o mostrar contraseña)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

export const Input = ({ label, id, icon, onIconClick, className = '', ...props }: InputProps) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {/* Label vinculado al input mediante htmlFor/id */}
      <label htmlFor={id} className="text-sm font-bold text-gray-900 mb-1">
        {label}
      </label>
      <div className="relative">
        {/* El resto de props se pasan al input (value, onChange, type, placeholder...) */}
        <input
          id={id}
          className="w-full border border-gray-300 rounded-md px-3 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#009e2f] focus:border-transparent placeholder-gray-400"
          {...props}
        />
        {/* Si se pasa un icono, se muestra como botón absoluto dentro del campo */}
        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {icon}
          </button>
        )}
      </div>
    </div>
  );
};