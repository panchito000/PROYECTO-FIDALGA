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
  nit: string;
  razon_social: string;

  // T3: Productos que contiene el pedido
  items: DetallePedidoInput[];
}

async function crearPedidoDirecto(
  supabase: ReturnType<typeof createClient>,
  clienteId: string,
  input: PedidoInput,
  items: DetallePedidoInput[]
) {
  for (const item of items) {
    const { data: producto, error: prodError } = await supabase
      .from('productos')
      .select('id, stock, nombre')
      .eq('id', item.producto_id)
      .maybeSingle();

    if (prodError) throw new Error(prodError.message);
    if (!producto) throw new Error('Uno de los productos ya no existe.');

    const stock = Number(producto.stock ?? 0);
    if (item.cantidad > stock) {
      throw new Error(
        `No hay stock suficiente de ${producto.nombre || 'un producto'}. Disponible: ${stock}.`
      );
    }
  }

    const fila = {
    cliente_id: clienteId,
    nombre_completo: input.nombre_completo,
    telefono: input.telefono || null,
    direccion_entrega: input.direccion_entrega,
    metodo_pago: input.metodo_pago,
    estado: 'Pendiente',
    total: input.total,
    origen: 'web',
  };

  let { data: pedidoData, error: pedidoError } = await supabase
    .from('pedidos')
    .insert([fila])
    .select()
    .single();

  if (pedidoError && /origen/i.test(pedidoError.message)) {
    const { origen: _origen, ...sinOrigen } = fila;
    ({ data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([sinOrigen])
      .select()
      .single());
  }

  if (pedidoError && /estado/i.test(pedidoError.message)) {
    const { estado: _estado, ...resto } = fila;
    ({ data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([{ ...resto, estado_pedido: 'Pendiente' }])
      .select()
      .single());
  }

  if (pedidoError) throw new Error(pedidoError.message);
  if (!pedidoData) throw new Error('No se pudo crear el pedido.');

  const detalles = items.map((item) => ({
    pedido_id: pedidoData.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
  }));

  const { error: detallesError } = await supabase
    .from('detalles_pedido')
    .insert(detalles);

  if (detallesError) {
    await supabase.from('pedidos').delete().eq('id', pedidoData.id);
    throw new Error(detallesError.message);
  }

  for (const item of items) {
    const { data: producto } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', item.producto_id)
      .maybeSingle();

    const stockActual = Number(producto?.stock ?? 0);
    const { error: stockError } = await supabase
      .from('productos')
      .update({ stock: stockActual - item.cantidad })
      .eq('id', item.producto_id);

    if (stockError) {
      throw new Error(stockError.message);
    }
  }

  return pedidoData;
}

/**
 * Servicio para registrar compras y consultar pedidos realizados en el supermercado.
 */
export const pedidosService = {
  // Obtener el historial completo de pedidos registrados
  async getPedidos() {
    const supabase = createClient();

    // Lectura simple: si se pide el join a perfiles_usuario, la consulta
    // falla cuando la FK es cliente_id y la tabla queda vacía.
    let { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      ({ data, error } = await supabase.from('pedidos').select('*'));
    }

    if (error) throw error;

    const pedidos = data || [];
    const ids = pedidos.map((p) => p.id);

    let detallesPorPedido: Record<string, any[]> = {};
    if (ids.length > 0) {
      const { data: detalles } = await supabase
        .from('detalles_pedido')
        .select('pedido_id, cantidad, precio_unitario, productos ( nombre )')
        .in('pedido_id', ids);

      for (const d of detalles || []) {
        const key = String(d.pedido_id);
        if (!detallesPorPedido[key]) detallesPorPedido[key] = [];
        detallesPorPedido[key].push(d);
      }
    }

    return pedidos.map((p) => ({
      ...p,
      estado_pedido: p.estado_pedido || p.estado || 'Pendiente',
      detalles_pedido: detallesPorPedido[String(p.id)] || [],
    }));
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

    // T3 + T4 + T5: primero la función de A; si no está en Supabase, se inserta directo
    const { data, error } = await supabase.rpc(
      "crear_pedido_web",
      {
        p_cliente_id: user.id,
        p_nombre_completo: input.nombre_completo,
        p_telefono: input.telefono || null,
        p_direccion_entrega: input.direccion_entrega,
        p_metodo_pago: input.metodo_pago,
        p_total: input.total,
        p_nit: input.nit || "",
        p_razon_social: input.razon_social || "",
        p_items: items,
      }
    );

    if (!error) {
      return data;
    }

    const faltaFuncion = /schema cache|Could not find the function|does not exist/i.test(
      error.message || ''
    );

    if (!faltaFuncion) {
      console.error("Error al crear pedido:", error);
      throw new Error(error.message || "No se pudo crear el pedido.");
    }

    return crearPedidoDirecto(supabase, user.id, input, items);
  },

  // Actualizar el estado de entrega de un pedido
  async actualizarEstado(pedidoId: string, nuevoEstado: string) {
    const supabase = createClient();

    let { data, error } = await supabase
      .from('pedidos')
      .update({ estado_pedido: nuevoEstado })
      .eq('id', pedidoId)
      .select('id, estado_pedido')
      .maybeSingle();

    if (error && /column|schema cache|estado_pedido/i.test(error.message)) {
      ({ data, error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId)
        .select('id, estado, estado_pedido')
        .maybeSingle());
    }

    if (error) throw error;
    if (!data) {
      throw new Error(
        'El estado no se guardó en Supabase. En la tabla pedidos hace falta una política UPDATE para el rol authenticated.'
      );
    }

    return data;
  },
};
