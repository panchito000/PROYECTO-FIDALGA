import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { leerPerfilRol, puedeEntrarAlPanel } from '@/utils/roles';

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

  const perfil = await leerPerfilRol(supabase, user.id);

  if (!puedeEntrarAlPanel(perfil, user)) {
    redirect('/login?error=no-admin');
  }

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] text-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <Suspense>
          <AdminHeader />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
