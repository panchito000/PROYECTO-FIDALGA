import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata = {
  title: 'Admin | Fidalga',
};

// sidebar + header se comparten en dashboard e inventario
export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
