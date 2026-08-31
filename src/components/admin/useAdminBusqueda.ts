'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const RUTAS_CON_LISTA = ['/admin/inventario', '/admin/pedidos', '/admin/ofertas'];

export function useAdminBusqueda() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get('q') || '';

  const aplicar = (valor: string) => {
    const texto = valor.trim();
    const qs = texto ? `?q=${encodeURIComponent(texto)}` : '';
    router.replace(`${pathname}${qs}`);
  };

  return { q, aplicar, pathname };
}
