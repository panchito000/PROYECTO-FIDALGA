import { createClient } from '@/utils/supabase/client';

export interface CategoriaData {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at?: string;
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
};
