import Link from 'next/link';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { createClient } from '@/utils/supabase/server';
import {
  ESTADOS_POR_DESPACHAR,
  UMBRAL_STOCK_BAJO,
  estadoDePedido,
  formatearBs,
  formatearFecha,
  nombreCliente,
  totalDePedido,
  varianteEstado,
} from './formatoAdmin';
import { esRolEmpleado, leerPerfilRol } from '@/utils/roles';

export const dynamic = 'force-dynamic';
type PedidoResumen = {
  id: string;
  nombre_completo?: string | null;
  estado?: string | null;
  estado_pedido?: string | null;
  total: number;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const perfil = await leerPerfilRol(supabase, user?.id);

  const esEmpleado = esRolEmpleado(perfil, user);

  const { data: pedidosData } = await supabase
    .from('pedidos')
    .select('*');

  const { data: stockData } = await supabase
    .from('productos')
    .select('*');

  const pedidos = ((pedidosData || []) as PedidoResumen[])
    .map((p) => ({
      ...p,
      estado_pedido: estadoDePedido(p),
      total: totalDePedido(p),
    }))
    .sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });
  const stockBajo = (stockData || []).filter(
    (p: { stock?: number }) => Number(p.stock ?? 0) <= UMBRAL_STOCK_BAJO
  );
  const porDespachar = pedidos.filter((p) =>
    ESTADOS_POR_DESPACHAR.includes(p.estado_pedido)
  );
  const ventas = pedidos
    .filter((p) => p.estado_pedido !== 'Cancelado')
    .reduce((suma, p) => suma + Number(p.total || 0), 0);

  const kpis = esEmpleado
    ? [
        { label: 'Por despachar', valor: String(porDespachar.length) },
        { label: 'Listos para despacho', valor: String(pedidos.filter((p) => p.estado_pedido === 'Listo para despacho').length) },
        { label: 'Stock bajo', valor: String(stockBajo.length) },
      ]
    : [
        { label: 'Ventas', valor: formatearBs(ventas) },
        { label: 'Pedidos', valor: String(pedidos.length) },
        { label: 'Stock bajo', valor: String(stockBajo.length) },
      ];

  const tabla = esEmpleado ? porDespachar : pedidos.slice(0, 8);
  const tituloTabla = esEmpleado ? 'Por despachar' : 'Últimos Pedidos';
  const vacio = esEmpleado ? 'No hay pedidos por despachar' : 'Sin pedidos aún';

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

      {esEmpleado && (
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            href="/admin/pedidos"
            className="bg-[#00c653] hover:bg-[#00a846] text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
          >
            Ir a Pedidos
          </Link>
          <Link
            href="/admin/inventario"
            className="bg-white border border-gray-200 hover:border-[#00c653] text-gray-800 text-sm font-semibold px-4 py-2.5 rounded-lg"
          >
            Ir a Inventario
          </Link>
        </div>
      )}

      <Card title={tituloTabla}>
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
              {tabla.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    {vacio}
                  </td>
                </tr>
              )}
              {tabla.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-3.5 px-2 font-medium text-gray-800">
                    #{String(p.id).slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-2 text-gray-700">{nombreCliente(p.nombre_completo)}</td>
                  <td className="py-3.5 px-2 text-gray-600">{formatearFecha(p.created_at)}</td>
                  <td className="py-3.5 px-2">
                    <Badge variant={varianteEstado(p.estado_pedido)}>{p.estado_pedido}</Badge>
                  </td>
                  <td className="py-3.5 px-2 text-gray-800">{formatearBs(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
