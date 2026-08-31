import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OfertasClient from '@/app/admin/ofertas/OfertasClient';
import { esRolEmpleado, leerPerfilRol } from '@/utils/roles';

export default async function AdminOfertasPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const perfil = await leerPerfilRol(supabase, user?.id);

  if (esRolEmpleado(perfil, user)) {
    redirect('/admin');
  }

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
    <Suspense>
      <OfertasClient 
        initialOfertas={ofertas || []} 
        productos={productos || []} 
      />
    </Suspense>
  );
}
