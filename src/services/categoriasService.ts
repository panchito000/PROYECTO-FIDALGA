import { createClient } from '@/utils/supabase/client';

export interface CategoriaData {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at?: string;
}

export function normalizarNombreCategoria(nombre: string) {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function coincideCategoria(a: string, b: string) {
  const na = normalizarNombreCategoria(a);
  const nb = normalizarNombreCategoria(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function esSeccionOfertas(nombre: string) {
  return normalizarNombreCategoria(nombre).includes('oferta');
}

export const categoriasService = {
  // Obtener todas las categorías ordenadas
  async getCategorias(): Promise<CategoriaData[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Obtener categoría individual por ID
  async getCategoriaById(id: string): Promise<CategoriaData | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async buscarCategoria(clave: string): Promise<CategoriaData | null> {
    const cats = await this.getCategorias();
    const exacta = cats.find((c) => String(c.id) === clave);
    if (exacta) return exacta;

    const normalizada = normalizarNombreCategoria(clave);
    return (
      cats.find((c) => normalizarNombreCategoria(c.nombre) === normalizada) ||
      cats.find((c) => coincideCategoria(c.nombre, clave)) ||
      null
    );
  },
};
