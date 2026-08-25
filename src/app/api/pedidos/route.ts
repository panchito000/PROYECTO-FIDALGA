import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/pedidos
 * Recupera el historial de pedidos incluyendo datos del cliente y los productos de cada orden.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        perfiles_usuario(nombre_completo, telefono),
        detalles_pedido(*, productos(nombre))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/pedidos
 * Procesa una nueva compra registrando la cabecera del pedido y el desglose de sus productos.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Insertar pedido en la tabla 'pedidos'
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{
        usuario_id: user?.id || body.usuario_id,
        direccion_entrega: body.direccion_entrega,
        metodo_pago: body.metodo_pago,
        total: body.total,
        estado_pedido: 'Pendiente',
      }])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // Insertar ítems del carrito en 'detalles_pedido'
    if (body.items && body.items.length > 0) {
      const detalles = body.items.map((item: any) => ({
        pedido_id: pedidoData.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      }));

      await supabase.from('detalles_pedido').insert(detalles);
    }

    return NextResponse.json(pedidoData, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
