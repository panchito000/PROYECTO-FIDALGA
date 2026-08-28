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

  
  // T3 + T4 + T5: Crear pedido, guardar detalles y descontar stock
  async crearPedido(input: PedidoInput) {
    const supabase = createClient();

    // Obtener usuario autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(
        "Debes iniciar sesión para realizar un pedido."
      );
    }

    if (!input.items || input.items.length === 0) {
      throw new Error("El carrito está vacío.");
    }

    // Preparar productos para Supabase
    const items = input.items.map((item) => ({
      producto_id: item.producto_id,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio_unitario),
    }));

    // Validar cantidades
    for (const item of items) {
      if (!item.producto_id) {
        throw new Error("Uno de los productos del pedido no tiene un ID válido.");
      }

      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new Error(
          "La cantidad de uno de los productos no es válida."
        );
      }

      if (!Number.isFinite(item.precio_unitario) || item.precio_unitario < 0) {
        throw new Error(
          "El precio de uno de los productos no es válido."
        );
      }
    }

    // T3 + T4 + T5:
    // La función de Supabase crea el pedido,
    // registra sus detalles,
    // guarda origen = 'web'
    // y descuenta el stock de forma segura.
    const { data, error } = await supabase.rpc(
      "crear_pedido_web",
      {
        p_cliente_id: user.id,
        p_nombre_completo: input.nombre_completo,
        p_telefono: input.telefono || null,
        p_direccion_entrega: input.direccion_entrega,
        p_metodo_pago: input.metodo_pago,
        p_total: input.total,
        p_items: items,
      }
    );

    if (error) {
      console.error(
        "Error al crear pedido:",
        error
      );

      throw new Error(
        error.message ||
          "No se pudo crear el pedido."
      );
    }

    return data;
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