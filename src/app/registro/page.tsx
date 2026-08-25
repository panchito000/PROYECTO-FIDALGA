'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons';

/**
 * Página para crear una nueva cuenta de cliente o administrador en Fidalga.
 */
export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [rol, setRol] = useState<'cliente' | 'admin'>('cliente');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [claveAdmin, setClaveAdmin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Procesar formulario de registro
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar clave de autorización para cuentas de administrador
    if (rol === 'admin' && claveAdmin && !['fidalga2026', 'admin', '1234'].includes(claveAdmin.toLowerCase()) && !email.endsWith('@fidalga.com')) {
      setError('Clave de autorización no válida. Usa: fidalga2026 o admin');
      setLoading(false);
      return;
    }

    try {
      // Registrar usuario en Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            rol: rol,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Crear o actualizar perfil en perfiles_usuario
      if (data.user) {
        try {
          await supabase
            .from('perfiles_usuario')
            .upsert({
              id: data.user.id,
              nombre_completo: nombreCompleto,
              rol: rol,
            });
        } catch {
          // Si existe un trigger automático en Supabase SQL, ignora la excepción
        }
      }

      router.push('/login?mensaje=cuenta-creada');

    } catch (err: any) {
      console.error('Error en el registro:', err.message);
      if (err.message?.includes('email rate limit exceeded')) {
        setError('Límite de solicitudes de correo alcanzado en Supabase. Espera un momento o desactiva "Confirm Email" en el panel de Supabase.');
      } else {
        setError('Hubo un problema al crear tu cuenta. ' + err.message);
      }
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
          Crear una Cuenta
        </h2>

        {/* Selección entre Cliente y Administrador */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 border border-gray-200">
          <button
            type="button"
            onClick={() => { setRol('cliente'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              rol === 'cliente' 
                ? 'bg-white text-[#00b24a] shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FontAwesomeIcon icon={faUser} />
            Cuenta Cliente
          </button>
          <button
            type="button"
            onClick={() => { setRol('admin'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              rol === 'admin' 
                ? 'bg-gray-900 text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FontAwesomeIcon icon={faUserShield} />
            Administrador
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#00b24a] focus:border-[#00b24a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="usuario@fidalga.com"
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
                minLength={6}
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

          {rol === 'admin' && (
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">
                Clave de Autorización Admin <span className="text-xs text-gray-400 font-normal">(opcional, ej: admin)</span>
              </label>
              <input
                type="text"
                placeholder="Ingresa 'admin' o déjalo vacío"
                value={claveAdmin}
                onChange={(e) => setClaveAdmin(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors bg-gray-50"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-2.5 rounded-md transition-colors mt-4 disabled:opacity-50 text-white ${
              rol === 'admin' 
                ? 'bg-gray-900 hover:bg-gray-800' 
                : 'bg-[#00b24a] hover:bg-[#009e42]'
            }`}
          >
            {loading ? 'Creando cuenta...' : rol === 'admin' ? 'Registrar Administrador' : 'Registrarme'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">¿Ya tienes cuenta? </span>
          <Link href="/login" className="text-sm text-[#00b24a] hover:underline font-bold">
            Ingresa aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
