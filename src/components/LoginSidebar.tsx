'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginSidebar = ({ isOpen, onClose }: LoginSidebarProps) => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    if (isOpen) {
      checkUser();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    } else {
      setUser(data.user);
      setLoading(false);
      onClose();
      router.refresh();
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    onClose();
    router.refresh();
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
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-black text-gray-900 tracking-wide">
            {user ? 'MI CUENTA' : 'INGRESAR'}
          </h2>
          <button 
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-600 text-white rounded-full p-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Contenido del Sidebar */}
        <div className="p-6 overflow-y-auto flex-1">
          {user ? (
            /* Vista cuando el usuario YA inició sesión */
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="w-14 h-14 bg-[#00c653] text-white rounded-full flex items-center justify-center font-black text-xl shadow-sm">
                  {user.email ? user.email.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-400 uppercase font-bold">Sesión Activa</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/perfil"
                  onClick={onClose}
                  className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-gray-800 text-sm transition-colors"
                >
                  <span>Historial de Compras</span>
                  <span>&rarr;</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={onClose}
                  className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-gray-800 text-sm transition-colors"
                >
                  <span>Panel Administrativo</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <hr className="border-gray-100" />

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-full transition-colors text-sm border border-red-100 flex items-center justify-center gap-2"
              >
                {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          ) : (
            /* Vista de Formulario de Inicio de Sesión */
            <div>
              <p className="text-sm text-gray-500 mb-6">
                Si ya estás registrado, por favor inicia sesión con tu correo.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-2.5 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
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
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#00c653] focus:ring-1 focus:ring-[#00c653]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00c653] hover:bg-[#00a846] text-white font-bold py-3.5 rounded-full mt-2 transition-colors text-sm shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <hr className="border-gray-200 my-6" />

              <p className="text-xs text-gray-500 text-center mb-4 px-4">
                ¿No tienes cuenta? Crea una para disfrutar de la mejor experiencia.
              </p>

              <Link
                href="/registro"
                onClick={onClose}
                className="w-full bg-white border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-bold py-3 rounded-full transition-colors text-sm flex items-center justify-center"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};