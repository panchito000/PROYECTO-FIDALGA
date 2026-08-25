'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTag, 
  faTrash, 
  faPercent, 
  faCalendarDays, 
  faCheckCircle, 
  faTimesCircle,
  faBoxOpen 
} from '@fortawesome/free-solid-svg-icons';

interface ProductoOpt {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
}

interface OfertaItem {
  id: string;
  producto_id: string;
  porcentaje_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  productos?: {
    nombre: string;
    precio: number;
    imagen_url?: string;
  };
}

interface OfertasClientProps {
  initialOfertas: OfertaItem[];
  productos: ProductoOpt[];
}

// Gestión de ofertas y descuentos
export default function OfertasClient({ initialOfertas, productos }: OfertasClientProps) {
  const [ofertas, setOfertas] = useState<OfertaItem[]>(initialOfertas);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const [productoId, setProductoId] = useState('');
  const [porcentaje, setPorcentaje] = useState(15);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [activo, setActivo] = useState(true);

  const supabase = createClient();

  // Recargar ofertas desde Supabase
  const reloadOfertas = async () => {
    const { data } = await supabase
      .from('ofertas')
      .select(`
        id,
        producto_id,
        porcentaje_descuento,
        fecha_inicio,
        fecha_fin,
        activo,
        productos ( nombre, precio, imagen_url )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setOfertas(data as any);
    }
  };

  // Crear nueva oferta
  const handleCrearOferta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoId) {
      setError('Por favor selecciona un producto.');
      return;
    }

    setLoading(true);
    setError(null);
    setExito(null);

    try {
      const { error: insertError } = await supabase
        .from('ofertas')
        .insert([{
          producto_id: productoId,
          porcentaje_descuento: Number(porcentaje),
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          activo: activo,
        }]);

      if (insertError) throw insertError;

      setExito('¡Oferta creada exitosamente!');
      setMostrarForm(false);
      setProductoId('');
      setPorcentaje(15);
      await reloadOfertas();

    } catch (err: any) {
      console.error('Error creando oferta:', err);
      setError(err.message || 'No se pudo crear la oferta.');
    } finally {
      setLoading(false);
    }
  };

  // Activar o desactivar oferta
  const toggleEstado = async (oferta: OfertaItem) => {
    try {
      const { error } = await supabase
        .from('ofertas')
        .update({ activo: !oferta.activo })
        .eq('id', oferta.id);

      if (error) throw error;
      await reloadOfertas();
    } catch (err: any) {
      alert('Error cambiando estado de oferta: ' + err.message);
    }
  };

  // Eliminar oferta
  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;

    try {
      const { error } = await supabase
        .from('ofertas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await reloadOfertas();
    } catch (err: any) {
      alert('Error al eliminar la oferta: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FontAwesomeIcon icon={faTag} className="text-[#00c653]" />
            Módulo de Ofertas y Promociones
          </h1>
          <p className="text-gray-500 text-sm mt-1">Crea y gestiona descuentos temporales aplicados a los productos.</p>
        </div>

        <button
          onClick={() => { setMostrarForm(!mostrarForm); setError(null); setExito(null); }}
          className="bg-[#00c653] hover:bg-[#00a846] text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all shadow-sm flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>{mostrarForm ? 'Cancelar' : 'Nueva Oferta'}</span>
        </button>
      </div>

      {exito && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{exito}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
          <FontAwesomeIcon icon={faTimesCircle} />
          <span>{error}</span>
        </div>
      )}

      {mostrarForm && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
            <FontAwesomeIcon icon={faPercent} className="text-amber-500" />
            Configurar Nueva Oferta
          </h2>

          <form onSubmit={handleCrearOferta} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Seleccionar Producto *
              </label>
              <select
                required
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#00c653]"
              >
                <option value="">-- Elige un producto del catálogo --</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Precio Normal: Bs. {Number(p.precio).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Porcentaje de Descuento (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="95"
                  required
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00c653] pr-10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Estado Inicial
              </label>
              <select
                value={activo ? 'true' : 'false'}
                onChange={(e) => setActivo(e.target.value === 'true')}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#00c653]"
              >
                <option value="true">Activa (Publicada)</option>
                <option value="false">Inactiva (Borrador)</option>
              </select>
            </div>

            <div>
              <label className="flex text-xs font-bold text-gray-700 uppercase mb-2 items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400" />
                Fecha de Inicio *
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00c653]"
              />
            </div>

            <div>
              <label className="flex text-xs font-bold text-gray-700 uppercase mb-2 items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400" />
                Fecha de Finalización *
              </label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00c653]"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-[#00c653] hover:bg-[#00a846] text-white rounded-full font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Publicar Oferta'}
              </button>
            </div>

          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Ofertas Registradas ({ofertas.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 border-b border-gray-100">Producto</th>
                <th className="p-4 border-b border-gray-100">Descuento</th>
                <th className="p-4 border-b border-gray-100">Precio Final</th>
                <th className="p-4 border-b border-gray-100">Vigencia</th>
                <th className="p-4 border-b border-gray-100">Estado</th>
                <th className="p-4 border-b border-gray-100 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {ofertas.length > 0 ? (
                ofertas.map((o) => {
                  const prod = Array.isArray(o.productos) ? o.productos[0] : o.productos;
                  const precioOriginal = Number(prod?.precio) || 0;
                  const descuento = Number(o.porcentaje_descuento) || 0;
                  const precioFinal = precioOriginal - (precioOriginal * (descuento / 100));

                  return (
                    <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center border">
                            {prod?.imagen_url ? (
                              <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-contain" />
                            ) : (
                              <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{prod?.nombre || 'Producto No Encontrado'}</p>
                            <p className="text-xs text-gray-400">Normal: Bs. {precioOriginal.toFixed(2)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-black text-red-600">
                        <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full text-xs font-black">
                          -{descuento}% OFF
                        </span>
                      </td>

                      <td className="p-4 font-black text-gray-900">
                        Bs. {precioFinal.toFixed(2)}
                      </td>

                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {o.fecha_inicio} al {o.fecha_fin}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => toggleEstado(o)}
                          className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                            o.activo 
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {o.activo ? 'Activa ✓' : 'Inactiva ✕'}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEliminar(o.id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center ml-auto"
                          title="Eliminar Oferta"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                    No hay ofertas registradas. Haz clic en "Nueva Oferta" para agregar una.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
