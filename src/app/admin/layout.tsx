import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

const ADMIN_ROL_ID = 'd9f76488-9905-459d-adde-0d0e87e5efd9';
const EMPLEADO_ROL_ID = '703d17fd-bfb6-40d1-b378-98362e9cb3b0';

export const metadata = {
  title: 'Admin | Fidalga',
};

// Layout del panel de administración con protección de rutas
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Validar sesión activa
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=no-admin');
  }

  // Verificar rol en Supabase
  const { data: perfil } = await supabase
    .from('perfiles_usuario')
    .select('rol_id')
    .eq('id', user.id)
    .single();

  const esAdmin = perfil?.rol_id === ADMIN_ROL_ID || perfil?.rol_id === EMPLEADO_ROL_ID || user.user_metadata?.rol_id === ADMIN_ROL_ID || user.email?.endsWith('@fidalga.com');

  if (!esAdmin) {
    redirect('/login?error=no-admin');
  }

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] text-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <AdminHeader />
        {children}
      </div>
    </div>
  );
}
