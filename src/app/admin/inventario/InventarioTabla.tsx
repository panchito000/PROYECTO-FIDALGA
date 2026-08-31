'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAdminBusqueda } from '@/components/admin/useAdminBusqueda';

type Categoria = {
  id: string;
  nombre: string;
};

type Producto = {
  id?: string;
  sku: string;
  nombre: string;
  categoria_id: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  activo: boolean;
};

const POR_PAGINA = [10, 15, 20] as const;

function nombreCategoria(c: Record<string, unknown>) {
  return String(c.nombre ?? c.name ?? c.titulo ?? c.id ?? '');
}

// Componente para la gestión de productos del inventario
export const InventarioTabla = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState('todas');
  const { q } = useAdminBusqueda();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState<(typeof POR_PAGINA)[number]>(15);

  const supabase = createClient();

  // Cargar productos de la base de datos
  const cargar = useCallback(async () => {
    setError('');
    setCargando(true);
    try {
      const [resCat, resProd] = await Promise.all([
        supabase.from('categorias').select('*'),
        supabase.from('productos').select('*').order('nombre', { ascending: true }),
      ]);

      if (resProd.error) {
        setError('Error al cargar productos: ' + resProd.error.message);
        setProductos([]);
        setCargando(false);
        return;
      }

      const cats = (resCat.data ?? []).map((c) => ({
        id: String((c as { id: string }).id),
        nombre: nombreCategoria(c as Record<string, unknown>),
      }));
      setCategorias(cats);

      const porId = Object.fromEntries(cats.map((c) => [c.id, c.nombre]));

      setProductos(
        (resProd.data ?? []).map((p) => {
          const row = p as Record<string, unknown>;
          const catId = String(row.categoria_id ?? '');
          return {
            id: row.id != null ? String(row.id) : undefined,
            sku: String(row.sku ?? row.codigo ?? ''),
            nombre: String(row.nombre ?? row.name ?? ''),
            categoria_id: catId,
            categoria: porId[catId] ?? 'Sin categoría',
            precio: Number(row.precio ?? row.price ?? 0),
            stock: Number(row.stock ?? 0),
            imagen_url: String(row.imagen_url ?? row.imagen ?? ''),
            activo: row.estado !== undefined ? Boolean(row.estado) : Boolean(row.activo ?? true),
          };
        })
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo conectar con Supabase.';
      setError(msg);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Filtrar productos por búsqueda o categoría
  const lista = useMemo(() => {
    const busqueda = q.trim().toLowerCase();
    return productos.filter((p) => {
      const texto = `${p.sku} ${p.nombre}`.toLowerCase();
      const okTexto = !busqueda || texto.includes(busqueda);
      const okCat = categoriaId === 'todas' || p.categoria_id === categoriaId;
      return okTexto && okCat;
    });
  }, [productos, q, categoriaId]);

  useEffect(() => {
    setPagina(1);
  }, [q, categoriaId, porPagina]);

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

  // Guardar o actualizar producto
  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const data = new FormData(e.currentTarget);
    const nuevoStock = Number(data.get('stock'));
    const nuevoPrecio = Number(data.get('precio'));
    const nuevoNombre = String(data.get('nombre'));
    const nuevoSku = String(data.get('sku'));
    const nuevaCategoriaId = String(data.get('categoria_id'));
    const nuevaImagenUrl = String(data.get('imagen_url') || '').trim();

    const payload = {
      nombre: nuevoNombre,
      precio: nuevoPrecio,
      stock: nuevoStock,
      categoria_id: nuevaCategoriaId,
      imagen_url: nuevaImagenUrl || null,
      sku: nuevoSku,
    };

    try {
      if (editando?.id) {
        const res = await fetch('/api/productos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editando.id, ...payload }),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Error actualizando producto.');
        }
      } else {
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, estado: true }),
        });

        const json = await res.json();
        if (!res.ok || json.error) {
          throw new Error(json.error || 'Error creando producto.');
        }
      }

      setMostrarForm(false);
      setEditando(null);
      await cargar();
    } catch (err: any) {
      console.error('Error guardando producto:', err);
      setError(err.message || 'No se pudo guardar el producto.');
    }
  };

  // Eliminar producto
  const borrar = async (id?: string) => {
    if (!id || !confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/productos?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Error al eliminar producto.');
      }
      await cargar();
    } catch (err: any) {
      setError('No se pudo borrar: ' + err.message);
    }
  };

  // Cambiar disponibilidad (Disponible / Agotado)
  const cambiarEstado = async (p: Producto) => {
    if (!p.id) return;
    const nuevoEstado = !p.activo;

    setProductos((prev) =>
      prev.map((prod) => (prod.id === p.id ? { ...prod, activo: nuevoEstado } : prod))
    );

    try {
      const res = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: p.id,
          estado: nuevoEstado,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Error al cambiar estado.');
      }
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      setError('Error al cambiar estado: ' + err.message);
      await cargar();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Control de Inventario</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administración y consulta del catálogo de productos del supermercado.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-medium">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        >
          <option value="todas">Todas las Categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            setEditando(null);
            setMostrarForm(true);
          }}
          className="ml-auto bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-sm px-4 py-2.5 rounded-lg"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-auto max-h-[min(58vh,560px)]">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-gray-400 font-medium border-b border-gray-100">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4"></th>
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
                    No hay productos. Usa + Nuevo Producto.
                  </td>
                </tr>
              )}
              {!cargando && paginaItems.map((p) => (
                <tr key={p.id ?? p.sku} className="border-t border-gray-100">
                  <td className="py-3 px-4 text-gray-700">{p.sku}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded bg-gray-100 shrink-0 overflow-hidden border flex items-center justify-center">
                        {p.imagen_url ? (
                          <img
                            src={p.imagen_url}
                            alt={p.nombre}
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400">Img</span>
                        )}
                      </span>
                      <span className="font-medium text-gray-800">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.categoria}</td>
                  <td className="py-3 px-4 text-gray-800">Bs. {Number(p.precio).toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-800 font-semibold">{p.stock}</td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => cambiarEstado(p)}
                      title="Cambiar estado"
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        p.activo ? 'bg-[#f5c400]' : 'bg-gray-300'
                      }`}
                      aria-label="cambiar estado"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          p.activo ? 'translate-x-4' : ''
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(p);
                          setMostrarForm(true);
                        }}
                        className="w-8 h-8 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a2 2 0 000-2.828l-3.172-3.172a2 2 0 00-2.828 0L4.293 13.707A1 1 0 004 14.414V20z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => borrar(p.id)}
                        className="w-8 h-8 rounded-md bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3m-9 0h12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!cargando && lista.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <p>
              Mostrando {desde}–{hasta} de {lista.length} productos
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

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={guardar} className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">{editando ? 'Editar producto' : 'Nuevo Producto'}</h2>
            
            <label className="block text-sm font-semibold mb-1">SKU</label>
            <input name="sku" defaultValue={editando?.sku} required className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
            
            <label className="block text-sm font-semibold mb-1">Producto</label>
            <input name="nombre" defaultValue={editando?.nombre} required className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
            
            <label className="block text-sm font-semibold mb-1">Categoría</label>
            <select
              name="categoria_id"
              defaultValue={editando?.categoria_id ?? categorias[0]?.id ?? ''}
              required
              className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            
            <label className="block text-sm font-semibold mb-1">URL de la Imagen</label>
            <input
              name="imagen_url"
              defaultValue={editando?.imagen_url}
              placeholder="https://i.postimg.cc/..../foto.webp"
              className="w-full border rounded-lg px-3 py-2 mb-1 text-sm"
            />
            <p className="text-xs text-gray-400 mb-3">
              No pegues la página del producto. Entra a la foto, clic derecho → Copiar dirección de la imagen.
            </p>

            <label className="block text-sm font-semibold mb-1">Precio</label>
            <input name="precio" type="number" step="0.01" defaultValue={editando?.precio} required className="w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
            
            <label className="block text-sm font-semibold mb-1">Stock</label>
            <input name="stock" type="number" defaultValue={editando?.stock} required className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" />
            
            <div className="flex gap-2">
              <button type="button" onClick={() => { setMostrarForm(false); setEditando(null); }} className="flex-1 border rounded-lg py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-[#22c55e] text-white rounded-lg py-2 text-sm font-semibold">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
