'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { leerPerfilRol, puedeEntrarAlPanel } from '@/utils/roles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'no-admin' 
      ? 'No tienes permisos de administrador para ingresar al panel.' 
      : null
  );
  const [mensaje, setMensaje] = useState<string | null>(
    searchParams.get('mensaje') === 'cuenta-creada'
      ? '¡Cuenta creada con éxito! Por favor inicia sesión.'
      : null
  );

  // Iniciar sesión y verificar rol del usuario
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMensaje(null);

    try {
      // Autenticar credenciales en Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) throw signInError;

      const user = data.user;

      const perfil = await leerPerfilRol(supabase, user.id);

      if (puedeEntrarAlPanel(perfil, user)) {
        router.push('/admin');
      } else {
        router.push('/');
      }

      router.refresh();

    } catch (err: any) {
      console.error('Error en login:', err.message);
      setError(err.message || 'Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md">
        
        {/* Logo Fidalga */}
        <div className="flex justify-center mb-4">
          <img 
            src="https://i.postimg.cc/65JCqBPG/Logo-Fidalga.png" 
            alt="Logo Fidalga" 
            className="w-24 h-auto object-contain drop-shadow-sm"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Acceso al Sistema
        </h2>



        {mensaje && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm text-center font-medium">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00b24a] focus:border-[#00b24a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00b24a] focus:border-[#00b24a] transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-2.5 rounded-md transition-colors mt-4 disabled:opacity-50 text-white bg-[#00b24a] hover:bg-[#009e42] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} spin />
                Cargando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <div className="text-sm text-gray-500 pt-2 border-t border-gray-100">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-[#00b24a] hover:underline font-bold">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
