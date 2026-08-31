import { createClient } from '@/utils/supabase/client';
import { categoriasService, coincideCategoria } from '@/services/categoriasService';

export interface ProductoData {
  id?: string;
  sku?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria_id?: string;
  imagen_url?: string;
  estado?: boolean;
}

/**
 * Servicio para la consulta y manipulación del catálogo de productos e inventario.
 */
export const productosService = {
  // Obtener el catálogo completo de productos con sus categorías asociadas
  async getProductos() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias ( id, nombre )')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener los productos recién agregados para la portada del sitio
  async getNovedades(limit = 8) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, imagen_url, estado')
      .eq('estado', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Filtrar y retornar productos pertenecientes a una categoría específica
  async getProductosPorCategoria(nombreCategoria: string) {
    const categoria = await categoriasService.buscarCategoria(nombreCategoria);
    if (!categoria) return [];

    const res = await fetch('/api/productos');
    const data = await res.json();
    if (!res.ok || !Array.isArray(data)) return [];

    return data.filter((p: Record<string, unknown>) => {
      const rel = p.categorias as { id?: string; nombre?: string } | null;
      return (
        String(p.categoria_id ?? '') === String(categoria.id) ||
        String(rel?.id ?? '') === String(categoria.id) ||
        coincideCategoria(String(rel?.nombre ?? ''), categoria.nombre)
      );
    });
  },

  // Insertar un nuevo producto en el catálogo
  async crearProducto(producto: ProductoData) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Actualizar los datos de un producto (precio, stock, imagen, etc.)
  async actualizarProducto(id: string, cambios: Partial<ProductoData>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('productos')
      .update(cambios)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Eliminar un producto del inventario por su ID
  async eliminarProducto(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
