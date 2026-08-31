'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { pedidosService } from '@/services/pedidosService';
import { useAdminBusqueda } from '@/components/admin/useAdminBusqueda';

const ESTADOS = [
  'Pendiente',
  'Preparando',
  'Listo para despacho',
  'Despachado',
  'Entregado',
  'Cancelado',
];

const POR_PAGINA = [10, 15, 20] as const;

type Perfil = { nombre_completo?: string | null };
type ProductoRel = { nombre?: string | null };
type Detalle = {
  cantidad: number;
  productos: ProductoRel | ProductoRel[] | null;
};

export type PedidoFila = {
  id: string;
  estado_pedido: string;
  total: number;
  created_at: string;
  origen?: string | null;
  nombre_completo?: string | null;
  perfiles_usuario: Perfil | Perfil[] | null;
  detalles_pedido: Detalle[] | null;
};

function uno<T>(valor: T | T[] | null | undefined): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? valor[0] ?? null : valor;
}

function nombreCliente(pedido: PedidoFila) {
  const directo = pedido.nombre_completo?.trim();
  if (directo) return directo;
  return uno(pedido.perfiles_usuario)?.nombre_completo?.trim() || 'Sin nombre';
}

function textoProductos(pedido: PedidoFila) {
  const detalles = pedido.detalles_pedido ?? [];
  if (detalles.length === 0) return '—';
  return detalles
    .map((d) => {
      const nombre = uno(d.productos)?.nombre || 'Producto';
      return `${nombre} ×${d.cantidad}`;
    })
    .join(', ');
}

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatearBs(n: number) {
  return `Bs. ${Number(n).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function etiquetaOrigen(origen?: string | null) {
  if (!origen) return '—';
  if (origen === 'web') return 'Web';
  if (origen === 'tienda') return 'Tienda';
  return origen;
}

function varianteEstado(estado: string) {
  const e = estado.toLowerCase();
  if (e === 'entregado') return 'success' as const;
  if (e === 'pendiente' || e === 'preparando') return 'warning' as const;
  if (e === 'cancelado') return 'danger' as const;
  return 'info' as const;
}

// Tabla de pedidos del panel, conectada a Supabase
export const PedidosTabla = () => {
  const [pedidos, setPedidos] = useState<PedidoFila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroOrigen, setFiltroOrigen] = useState('todos');
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState<(typeof POR_PAGINA)[number]>(15);
  const { q } = useAdminBusqueda();

  const cargar = useCallback(async () => {
    setError('');
    setCargando(true);
    try {
      const data = await pedidosService.getPedidos();
      setPedidos((data as PedidoFila[]) || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudieron cargar los pedidos.';
      setError(msg);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const lista = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return pedidos.filter((p) => {
      const okEstado = filtroEstado === 'todos' || p.estado_pedido === filtroEstado;
      const origen = (p.origen || '').toLowerCase();
      const okOrigen =
        filtroOrigen === 'todos' ||
        origen === filtroOrigen ||
        (filtroOrigen === 'sin-origen' && !p.origen);
      if (!texto) return okEstado && okOrigen;
      const hay = `${nombreCliente(p)} ${p.id} ${textoProductos(p)} ${p.estado_pedido}`.toLowerCase();
      return okEstado && okOrigen && hay.includes(texto);
    });
  }, [pedidos, filtroEstado, filtroOrigen, q]);

  useEffect(() => {
    setPagina(1);
  }, [filtroEstado, filtroOrigen, porPagina, q]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  const desde = lista.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const hasta = Math.min(paginaActual * porPagina, lista.length);
  const paginaItems = useMemo(
    () => lista.slice((paginaActual - 1) * porPagina, paginaActual * porPagina),
    [lista, paginaActual, porPagina]
  );

  const cambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
    setError('');
    setGuardandoId(pedidoId);
    try {
      const guardado = await pedidosService.actualizarEstado(pedidoId, nuevoEstado);
      const estadoGuardado = guardado.estado_pedido || nuevoEstado;
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, estado_pedido: estadoGuardado } : p))
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar el estado.';
      setError(msg);
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <Card title="Pedidos">
      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-medium">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <select
          value={filtroOrigen}
          onChange={(e) => setFiltroOrigen(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        >
          <option value="todos">Todos los orígenes</option>
          <option value="web">Web</option>
          <option value="tienda">Tienda</option>
          <option value="sin-origen">Sin origen</option>
        </select>
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-xl -mx-2">
        <div className="overflow-auto max-h-[min(58vh,560px)]">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-gray-400 font-medium border-b border-gray-100">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Cliente</th>
                <th className="py-3 px-2">Fecha</th>
                <th className="py-3 px-2">Origen</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2">Productos</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Cargando...
                  </td>
                </tr>
              )}
              {!cargando && lista.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    {pedidos.length === 0
                      ? 'La app no recibió filas. Si en Supabase sí hay pedidos, revisa las políticas RLS de la tabla pedidos (SELECT para authenticated).'
                      : 'No hay pedidos con esos filtros'}
                  </td>
                </tr>
              )}
              {!cargando &&
                paginaItems.map((p) => {
                  const productos = textoProductos(p);
                  return (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="py-3.5 px-2 font-medium text-gray-800">
                        #{String(p.id).slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-2 text-gray-700">{nombreCliente(p)}</td>
                      <td className="py-3.5 px-2 text-gray-600">{formatearFecha(p.created_at)}</td>
                      <td className="py-3.5 px-2 text-gray-600">{etiquetaOrigen(p.origen)}</td>
                      <td className="py-3.5 px-2 text-gray-800">{formatearBs(p.total)}</td>
                      <td className="py-3.5 px-2">
                        <div className="flex flex-col gap-1.5 min-w-44">
                          <Badge variant={varianteEstado(p.estado_pedido)}>{p.estado_pedido}</Badge>
                          <select
                            value={ESTADOS.includes(p.estado_pedido) ? p.estado_pedido : 'Pendiente'}
                            disabled={guardandoId === p.id}
                            onChange={(e) => cambiarEstado(p.id, e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c55e] disabled:opacity-50"
                          >
                            {ESTADOS.map((estado) => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-gray-600 max-w-56 truncate" title={productos}>
                        {productos}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!cargando && lista.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 border-t border-gray-100 text-sm text-gray-600">
            <p>
              Mostrando {desde}–{hasta} de {lista.length} pedidos
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <span>Por página</span>
                <select
                  value={porPagina}
                  onChange={(e) => setPorPagina(Number(e.target.value) as (typeof POR_PAGINA)[number])}
                  className="bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                >
                  {POR_PAGINA.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={paginaActual <= 1}
                  onClick={() => setPagina(paginaActual - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-2 text-gray-500">
                  {paginaActual} / {totalPaginas}
                </span>
                <button
                  type="button"
                  disabled={paginaActual >= totalPaginas}
                  onClick={() => setPagina(paginaActual + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
