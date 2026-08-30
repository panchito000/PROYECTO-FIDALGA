'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Navbar } from '@/components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSave, faBoxOpen, faCalendar, faMoneyBillWave, faTruck, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const [perfil, setPerfil] = useState({
    nombre_completo: '',
    telefono: '',
    direccion: ''
  });

  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        cargarDatos();
      } else if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const cargarDatos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email || '');

      // Cargar Perfil
      const { data: perfilData } = await supabase
        .from('perfiles_usuario')
        .select('*')
        .eq('id', user.id)
        .single();

      if (perfilData) {
        setPerfil({
          nombre_completo: perfilData.nombre_completo || '',
          telefono: perfilData.telefono || '',
          direccion: perfilData.direccion || ''
        });
      }

      // Cargar Pedidos
      const { data: pedidosData } = await supabase
        .from('pedidos')
        .select(`
          id, estado_pedido, total, created_at, direccion_entrega,
          detalles_pedido ( cantidad, precio_unitario, productos ( nombre, imagen_url ) )
        `)
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });

      if (pedidosData) {
        setPedidos(pedidosData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setSaving(true);
    setMensaje(null);

    try {
      const { error } = await supabase
        .from('perfiles_usuario')
        .update({
          nombre_completo: perfil.nombre_completo,
          telefono: perfil.telefono,
          direccion: perfil.direccion
        })
        .eq('id', userId);

      if (error) throw error;
      setMensaje({ tipo: 'exito', texto: '¡Perfil actualizado correctamente!' });
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: error.message || 'Hubo un error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00b24a]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Formulario de Perfil */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-green-100 text-[#00b24a] rounded-full flex items-center justify-center text-xl">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Mi Perfil</h2>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-[#00b24a] transition-colors"
                    title="Editar perfil"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-lg" />
                  </button>
                )}
              </div>

              {mensaje && (
                <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {mensaje.texto}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleGuardarPerfil} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={perfil.nombre_completo}
                      onChange={(e) => setPerfil({...perfil, nombre_completo: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#00b24a] focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={perfil.telefono}
                      onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/[^0-9]/g, '');
                        setPerfil({...perfil, telefono: soloNumeros});
                      }}
                      placeholder="Ej: 77712345"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#00b24a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Dirección Principal</label>
                    <textarea
                      rows={3}
                      value={perfil.direccion}
                      onChange={(e) => setPerfil({...perfil, direccion: e.target.value})}
                      placeholder="Calle, Barrio, Número de casa..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#00b24a] focus:outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-[#00b24a] hover:bg-[#009e42] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faSave} />
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Correo Electrónico</p>
                    <p className="text-sm font-semibold text-gray-900">{userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Nombre Completo</p>
                    <p className="text-sm font-semibold text-gray-900">{perfil.nombre_completo || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Teléfono</p>
                    <p className="text-sm font-semibold text-gray-900">{perfil.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Dirección Principal</p>
                    <p className="text-sm font-semibold text-gray-900">{perfil.direccion || 'No especificada'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Historial de Pedidos */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Mis Pedidos</h2>
                  <p className="text-sm text-gray-500">Historial de compras realizadas</p>
                </div>
              </div>

              {pedidos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-3xl">
                    <FontAwesomeIcon icon={faBoxOpen} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Aún no tienes pedidos</h3>
                  <p className="text-gray-500 text-sm">Cuando realices tu primera compra, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                            <span className="font-medium">{new Date(pedido.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
                            <span className="font-bold text-gray-900">Bs. {Number(pedido.total).toFixed(2)}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                          pedido.estado_pedido === 'Entregado' ? 'bg-green-100 text-green-700' :
                          pedido.estado_pedido === 'En camino' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          <FontAwesomeIcon icon={faTruck} className="mr-1.5" />
                          {pedido.estado_pedido}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {pedido.detalles_pedido?.map((detalle: any, index: number) => {
                          const productoInfo = Array.isArray(detalle.productos) ? detalle.productos[0] : detalle.productos;
                          return (
                            <div key={index} className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                {productoInfo?.imagen_url ? (
                                  <img src={productoInfo.imagen_url} alt="Producto" className="w-full h-full object-contain mix-blend-multiply" />
                                ) : (
                                  <FontAwesomeIcon icon={faBoxOpen} className="text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{productoInfo?.nombre || 'Producto Desconocido'}</h4>
                                <p className="text-xs text-gray-500">Cant: {detalle.cantidad} x Bs. {Number(detalle.precio_unitario).toFixed(2)}</p>
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                Bs. {(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
