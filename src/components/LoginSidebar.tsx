'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface LoginSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginSidebar = ({ isOpen, onClose }: LoginSidebarProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    } else {
      setLoading(false);
      onClose(); // Cerramos el panel al iniciar sesión con éxito
      // Aquí podrías recargar la página o actualizar el estado del usuario
    }
  };

  return (
    <>
      {/* Fondo oscuro transparente (Overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel Lateral */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-lg font-black text-gray-900 tracking-wide">INGRESAR</h2>
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded p-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Contenido del Formulario */}
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-gray-500 mb-6">
            Si ya esta registrado, por favor inicie sesión
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#00c653] focus:ring-1 focus:ring-[#00c653]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#00c653] focus:ring-1 focus:ring-[#00c653]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00c653] hover:bg-[#00a846] text-white font-bold py-3 rounded-full mt-2 transition-colors text-sm"
            >
              {loading ? 'Ingresando...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-4 mb-8">
            <a href="#" className="text-[#00c653] text-xs font-semibold hover:underline">
              ¿Olvidó su contraseña?
            </a>
          </div>

          <hr className="border-gray-200 mb-6" />

          <p className="text-xs text-gray-500 text-center mb-4 px-4">
            Crea tu cuenta y disfrute de nuestra nueva experiencia de compra
          </p>

          <button className="w-full bg-white border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-bold py-3 rounded-full transition-colors text-sm">
            Crear Cuenta
          </button>
        </div>
      </div>
    </>
  );
};