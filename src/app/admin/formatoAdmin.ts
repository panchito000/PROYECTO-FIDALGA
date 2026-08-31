export const UMBRAL_STOCK_BAJO = 5;

export const ESTADOS_POR_DESPACHAR = [
  'Pendiente',
  'Preparando',
  'Listo para despacho',
];

export function formatearBs(n: number) {
  return `Bs. ${Number(n || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function varianteEstado(estado: string) {
  const e = (estado || '').toLowerCase();
  if (e === 'entregado') return 'success' as const;
  if (e === 'pendiente' || e === 'preparando') return 'warning' as const;
  if (e === 'cancelado') return 'danger' as const;
  return 'info' as const;
}

export function nombreCliente(nombre?: string | null) {
  return nombre?.trim() || 'Sin nombre';
}

export function estadoDePedido(p: { estado_pedido?: string | null; estado?: string | null }) {
  return p.estado_pedido || p.estado || 'Pendiente';
}

export function totalDePedido(p: { total?: number | null; monto?: number | null }) {
  return Number(p.total ?? p.monto ?? 0);
}
