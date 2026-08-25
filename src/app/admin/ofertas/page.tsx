import { createClient } from '@/utils/supabase/server';
import OfertasClient from '@/app/admin/ofertas/OfertasClient';

export default async function AdminOfertasPage() {
  const supabase = await createClient();

  // Fetch productos para el selector
  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, precio, imagen_url')
    .order('nombre', { ascending: true });

  // Fetch ofertas registradas
  const { data: ofertas } = await supabase
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

  return (
    <OfertasClient 
      initialOfertas={ofertas || []} 
      productos={productos || []} 
    />
  );
}
