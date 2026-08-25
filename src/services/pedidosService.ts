import { createClient } from '@/utils/supabase/client';

export interface DetallePedidoInput {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface PedidoInput {
  usuario_id?: string;
  direccion_entrega: string;
  metodo_pago: string;
  total: number;
  items: DetallePedidoInput[];
}

/**
 * Servicio para registrar compras y consultar pedidos realizados en el supermercado.
 */
export const pedidosService = {
  // Obtener el historial completo de pedidos registrados
  async getPedidos() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        estado_pedido,
        total,
        created_at,
        direccion_entrega,
        metodo_pago,
        perfiles_usuario ( nombre_completo, telefono ),
        detalles_pedido (
          cantidad,
          precio_unitario,
          productos ( nombre )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Registrar un pedido de compra en la base de datos
  async crearPedido(input: PedidoInput) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{
        usuario_id: user?.id || input.usuario_id,
        direccion_entrega: input.direccion_entrega,
        metodo_pago: input.metodo_pago,
        total: input.total,
        estado_pedido: 'Pendiente',
      }])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    if (input.items && input.items.length > 0) {
      const detallesFormateados = input.items.map((item) => ({
        pedido_id: pedidoData.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      }));

      const { error: detallesError } = await supabase
        .from('detalles_pedido')
        .insert(detallesFormateados);

      if (detallesError) throw detallesError;
    }

    return pedidoData;
  },

  // Actualizar el estado de entrega de un pedido
  async actualizarEstado(pedidoId: string, nuevoEstado: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado_pedido: nuevoEstado })
      .eq('id', pedidoId)
      .select();

    if (error) throw error;
    return data?.[0];
  },
};
