'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Falta .env.local. Guarda el archivo y reinicia npm run dev.');
  }
  return createClient(url, key);
}

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
  activo: boolean;
};

function nombreCategoria(c: Record<string, unknown>) {
  return String(c.nombre ?? c.name ?? c.titulo ?? c.id ?? '');
}

export const InventarioTabla = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [columnas, setColumnas] = useState<string[]>([]);
  const [filtro, setFiltro] = useState('');
  const [categoriaId, setCategoriaId] = useState('todas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const campoActivo = columnas.includes('activo')
    ? 'activo'
    : columnas.includes('estado')
      ? 'estado'
      : columnas.includes('disponible')
        ? 'disponible'
        : null;
  const tieneActivo = Boolean(campoActivo);

  const cargar = useCallback(async () => {
    setError('');
    try {
      const supabase = getDb();

      const [resCat, resProd] = await Promise.all([
        supabase.from('categorias').select('*'),
        supabase.from('productos').select('*').order('nombre', { ascending: true }),
      ]);

      if (resProd.error) {
        setError(resProd.error.message);
        setProductos([]);
        setCargando(false);
        return;
      }
      if (resCat.error) {
        setError('Productos ok, categorías no: ' + resCat.error.message);
      }

      const cats = (resCat.data ?? []).map((c) => ({
        id: String((c as { id: string }).id),
        nombre: nombreCategoria(c as Record<string, unknown>),
      }));
      setCategorias(cats);

      const filas = resProd.data ?? [];
      if (filas.length > 0) setColumnas(Object.keys(filas[0]));

      const porId = Object.fromEntries(cats.map((c) => [c.id, c.nombre]));

      setProductos(
        filas.map((p) => {
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
            activo: Boolean(row.activo ?? row.estado ?? row.disponible ?? true),
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

  const lista = useMemo(() => {
    return productos.filter((p) => {
      const texto = `${p.sku} ${p.nombre}`.toLowerCase();
      const okTexto = texto.includes(filtro.toLowerCase());
      const okCat = categoriaId === 'todas' || p.categoria_id === categoriaId;
      return okTexto && okCat;
    });
  }, [productos, filtro, categoriaId]);

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const data = new FormData(e.currentTarget);
    const item: Record<string, unknown> = {
      nombre: String(data.get('nombre')),
      precio: Number(data.get('precio')),
      stock: Number(data.get('stock')),
      categoria_id: String(data.get('categoria_id')),
    };

    if (columnas.includes('sku') || columnas.length === 0) item.sku = String(data.get('sku'));
    if (columnas.includes('codigo')) item.codigo = String(data.get('sku'));
    if (campoActivo) item[campoActivo] = editando?.activo ?? true;

    try {
      const supabase = getDb();
      const query = editando?.id
        ? supabase.from('productos').update(item).eq('id', editando.id)
        : supabase.from('productos').insert(item);

      const { error: errorDb } = await query;
      if (errorDb) {
        setError(errorDb.message);
        return;
      }

      setMostrarForm(false);
      setEditando(null);
      await cargar();
    } catch {
      setError('No se pudo guardar. Revisa .env.local y la tabla productos.');
    }
  };

  const borrar = async (id?: string) => {
    if (!id) return;
    try {
      const supabase = getDb();
      const { error: errorDb } = await supabase.from('productos').delete().eq('id', id);
      if (errorDb) {
        setError(errorDb.message);
        return;
      }
      await cargar();
    } catch {
      setError('No se pudo borrar.');
    }
  };

  const cambiarEstado = async (p: Producto) => {
    if (!p.id) return;
    // el switch queda para despues: en productos no hay columna activo
    if (!campoActivo) return;
    try {
      const supabase = getDb();
      const { error: errorDb } = await supabase
        .from('productos')
        .update({ [campoActivo]: !p.activo })
        .eq('id', p.id);
      if (errorDb) {
        setError(errorDb.message);
        return;
      }
      await cargar();
    } catch {
      setError('No se pudo actualizar el estado.');
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
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar inventario..."
            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
        </div>

        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        >
          <option value="todas">todas las categorías</option>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-400 font-medium">
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
            {lista.map((p) => (
              <tr key={p.id ?? p.sku} className="border-t border-gray-100">
                <td className="py-3 px-4 text-gray-700">{p.sku}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-gray-200 shrink-0" />
                    <span className="font-medium text-gray-800">{p.nombre}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{p.categoria}</td>
                <td className="py-3 px-4 text-gray-800">Bs. {Number(p.precio).toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-800">{p.stock}</td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => cambiarEstado(p)}
                    title={tieneActivo ? 'Cambiar estado' : 'Estado: se conecta después'}
                    className={`w-10 h-6 rounded-full relative transition-colors ${
                      p.activo ? 'bg-[#f5c400]' : 'bg-gray-300'
                    } ${!tieneActivo ? 'opacity-70 cursor-default' : ''}`}
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
