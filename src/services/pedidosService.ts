import { createClient } from '@/utils/supabase/client';

export interface DetallePedidoInput {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface PedidoInput {
  // T3: Datos del cliente que realizará el pedido
  cliente_id?: string;
  nombre_completo: string;
  telefono?: string;

  // T3: Datos de entrega y pago
  direccion_entrega: string;
  metodo_pago: string;
  total: number;

  // T3: Productos que contiene el pedido
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
        cliente_id,
        nombre_completo,
        telefono,
        estado_pedido,
        total,
        created_at,
        direccion_entrega,
        metodo_pago,
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

  // T3: Registrar un pedido de compra en la base de datos
  async crearPedido(input: PedidoInput) {
    const supabase = createClient();

    // T3: Obtener el usuario actualmente autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // T3: Si no existe una sesión, no permitimos crear el pedido
    if (!user) {
      throw new Error('Debes iniciar sesión para realizar un pedido.');
    }

    // T3: Obtener los datos del perfil del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles_usuario')
      .select('id, nombre_completo, telefono')
      .eq('id', user.id)
      .single();

    if (perfilError) {
      throw new Error(
        `No se pudo obtener el perfil del usuario: ${perfilError.message}`
      );
    }

    // T3: Crear la cabecera del pedido utilizando
    // las columnas que realmente existen en la tabla 'pedidos'
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([
        {
          cliente_id: perfil.id,
          nombre_completo: input.nombre_completo || perfil.nombre_completo,
          telefono: input.telefono || perfil.telefono,
          direccion_entrega: input.direccion_entrega,
          metodo_pago: input.metodo_pago,
          total: input.total,
          estado_pedido: 'Pendiente',
        },
      ])
      .select()
      .single();

    if (pedidoError) {
      throw new Error(
        `No se pudo crear el pedido: ${pedidoError.message}`
      );
    }

    // T3: Registrar cada producto del carrito
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

      if (detallesError) {
        throw new Error(
          `El pedido se creó, pero no se pudieron guardar sus productos: ${detallesError.message}`
        );
      }
    }

    // T3: Devolver el pedido creado
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