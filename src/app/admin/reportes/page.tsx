export const dynamic = 'force-dynamic';

import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  UMBRAL_STOCK_BAJO,
  estadoDePedido,
  formatearBs,
  totalDePedido,
  varianteEstado,
} from '../formatoAdmin';
import { esRolEmpleado, leerPerfilRol } from '@/utils/roles';

type PedidoReporte = {
  estado?: string | null;
  estado_pedido?: string | null;
  total: number;
  origen?: string | null;
};

type ProductoStock = {
  id: string;
  nombre: string;
  stock: number;
};

function etiquetaOrigen(origen?: string | null) {
  if (!origen) return 'Sin origen';
  if (origen === 'web') return 'Web';
  if (origen === 'tienda') return 'Tienda';
  return origen;
}

export default async function ReportesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const perfil = await leerPerfilRol(supabase, user?.id);

  if (esRolEmpleado(perfil, user)) {
    redirect('/admin');
  }

  const { data: pedidosData } = await supabase.from('pedidos').select('*');
  const { data: stockData } = await supabase.from('productos').select('*');

  const pedidos = ((pedidosData || []) as PedidoReporte[]).map((p) => ({
    ...p,
    estado_pedido: estadoDePedido(p),
    total: totalDePedido(p),
  }));
  const vigentes = pedidos.filter((p) => p.estado_pedido !== 'Cancelado');
  const stockBajo = ((stockData || []) as ProductoStock[])
    .filter((p) => Number(p.stock ?? 0) <= UMBRAL_STOCK_BAJO)
    .sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0));
  const ventas = vigentes.reduce((suma, p) => suma + Number(p.total || 0), 0);
  const ticket = vigentes.length > 0 ? ventas / vigentes.length : 0;

  const porOrigen = vigentes.reduce<Record<string, { cantidad: number; total: number }>>((acc, p) => {
    const clave = etiquetaOrigen(p.origen);
    if (!acc[clave]) acc[clave] = { cantidad: 0, total: 0 };
    acc[clave].cantidad += 1;
    acc[clave].total += Number(p.total || 0);
    return acc;
  }, {});

  const porEstado = pedidos.reduce<Record<string, number>>((acc, p) => {
    const estado = p.estado_pedido || 'Sin estado';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card title="Ventas">
        {pedidos.length === 0 ? (
          <p className="py-6 text-center text-gray-400 text-sm">Sin pedidos aún</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-1">Total vendido</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{formatearBs(ventas)}</p>
            <p className="text-sm text-gray-500 mb-4">
              {vigentes.length} pedidos · promedio {formatearBs(ticket)}
            </p>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-400 font-medium">
                  <th className="py-3 px-2">Origen</th>
                  <th className="py-3 px-2">Pedidos</th>
                  <th className="py-3 px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(porOrigen).map(([origen, fila]) => (
                  <tr key={origen} className="border-t border-gray-100">
                    <td className="py-3.5 px-2 text-gray-800">{origen}</td>
                    <td className="py-3.5 px-2 text-gray-700">{fila.cantidad}</td>
                    <td className="py-3.5 px-2 font-semibold text-gray-900">{formatearBs(fila.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>

      <Card title="Stock bajo">
        <p className="text-sm text-gray-500 mb-4">
          Productos con {UMBRAL_STOCK_BAJO} unidades o menos.
        </p>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 font-medium">
                <th className="py-3 px-2">Producto</th>
                <th className="py-3 px-2">Stock</th>
              </tr>
            </thead>
            <tbody>
              {stockBajo.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-gray-400">
                    No hay productos con stock bajo
                  </td>
                </tr>
              )}
              {stockBajo.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-3.5 px-2 text-gray-800">{p.nombre}</td>
                  <td className="py-3.5 px-2 font-semibold text-gray-900">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Pedidos por estado">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 font-medium">
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(porEstado).length === 0 && (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-gray-400">
                    Sin pedidos aún
                  </td>
                </tr>
              )}
              {Object.entries(porEstado).map(([estado, cantidad]) => (
                <tr key={estado} className="border-t border-gray-100">
                  <td className="py-3.5 px-2">
                    <Badge variant={varianteEstado(estado)}>{estado}</Badge>
                  </td>
                  <td className="py-3.5 px-2 font-semibold text-gray-900">{cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
