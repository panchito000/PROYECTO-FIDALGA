import { createClient } from '@/utils/supabase/client';

export interface OfertaData {
  id?: string;
  producto_id: string;
  porcentaje_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo?: boolean;
}

/**
 * Servicio para calcular y listar productos en promoción con descuento.
 */
export const ofertasService = {
  // Obtener ofertas vigentes por fecha y calcular su precio final
  async getOfertasActivas() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ofertas')
      .select(`
        id,
        porcentaje_descuento,
        fecha_inicio,
        fecha_fin,
        activo,
        productos ( id, nombre, precio, imagen_url )
      `)
      .eq('activo', true);

    if (error) throw error;

    const ahora = new Date();
    return (data || [])
      .filter((oferta: any) => {
        const inicio = new Date(oferta.fecha_inicio);
        const fin = new Date(oferta.fecha_fin);
        return ahora >= inicio && ahora <= fin;
      })
      .map((oferta: any) => {
        const prod = Array.isArray(oferta.productos) ? oferta.productos[0] : oferta.productos;
        if (!prod) return null;
        const precioOriginal = Number(prod.precio) || 0;
        const porcentaje = Number(oferta.porcentaje_descuento) || 0;
        const descuento = porcentaje / 100;

        return {
          id: prod.id,
          nombre: prod.nombre,
          imagen_url: prod.imagen_url,
          precioOriginal,
          precioDescuento: precioOriginal - (precioOriginal * descuento),
          porcentajeDescuento: porcentaje,
        };
      })
      .filter(Boolean);
  },

  // Registrar un descuento porcentual para un producto
  async crearOferta(oferta: OfertaData) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ofertas')
      .insert([oferta])
      .select();

    if (error) throw error;
    return data?.[0];
  },
};
