import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';

const kpis = [
  { label: 'Ventas', valor: 'Bs. 142,580' },
  { label: 'Pedidos', valor: '1,284' },
  { label: 'Stock Bajo', valor: '23' },
];

const pedidos = [
  { id: '#PED-4921', cliente: 'Ana Martínez', fecha: '10 Jul 2026', estado: 'Entregado', total: 'Bs. 512' },
  { id: '#PED-4920', cliente: 'Carlos Ruiz', fecha: '10 Jul 2026', estado: 'Pendiente', total: 'Bs. 89' },
  { id: '#PED-4918', cliente: 'María López', fecha: '09 Jul 2026', estado: 'Entregado', total: 'Bs. 1,240' },
  { id: '#PED-4915', cliente: 'Jorge Pérez', fecha: '09 Jul 2026', estado: 'Cancelado', total: 'Bs. 45' },
  { id: '#PED-4912', cliente: 'Lucía Gómez', fecha: '08 Jul 2026', estado: 'Procesando', total: 'Bs. 150' },
];

function varianteEstado(estado: string) {
  if (estado === 'Entregado') return 'success' as const;
  if (estado === 'Pendiente') return 'warning' as const;
  if (estado === 'Cancelado') return 'danger' as const;
  return 'info' as const;
}

export default function AdminPage() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-sm text-gray-500 mb-3">{kpi.label}</p>
            <p className="text-3xl font-bold text-gray-900">{kpi.valor}</p>
          </Card>
        ))}
      </div>

      <Card title="Últimos Pedidos">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 font-medium">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Cliente</th>
                <th className="py-3 px-2">Fecha</th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-3.5 px-2 font-medium text-gray-800">{p.id}</td>
                  <td className="py-3.5 px-2 text-gray-700">{p.cliente}</td>
                  <td className="py-3.5 px-2 text-gray-600">{p.fecha}</td>
                  <td className="py-3.5 px-2">
                    {p.estado === 'Procesando' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {p.estado}
                      </span>
                    ) : (
                      <Badge variant={varianteEstado(p.estado)}>{p.estado}</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-gray-800">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
