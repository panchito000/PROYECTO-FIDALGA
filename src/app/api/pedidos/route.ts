import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/pedidos
 *
 * Obtiene los pedidos registrados.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        cliente_id,
        nombre_completo,
        direccion_entrega,
        telefono,
        metodo_pago,
        estado_pedido,
        total,
        created_at,
        detalles_pedido (
          id,
          producto_id,
          cantidad,
          precio_unitario,
          productos (
            nombre
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("Error al obtener pedidos:", err);

    return NextResponse.json(
      {
        error: err?.message || "No se pudieron obtener los pedidos",
      },
      { status: 500 }
    );
  }
}


/**
 * POST /api/pedidos
 *
 * Crea un pedido y sus detalles.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createClient();

    // ----------------------------------------------------------
    // 1. Comprobar que existe un usuario autenticado
    // ----------------------------------------------------------

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }


    // ----------------------------------------------------------
    // 2. Obtener el perfil del usuario
    // ----------------------------------------------------------

    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles_usuario")
      .select(`
        id,
        nombre_completo,
        telefono,
        direccion
      `)
      .eq("id", user.id)
      .single();

    if (perfilError || !perfil) {
      console.error("Error al obtener perfil:", perfilError);

      return NextResponse.json(
        {
          error: "No se pudo obtener el perfil del usuario",
          detalle: perfilError?.message,
        },
        { status: 400 }
      );
    }


    // ----------------------------------------------------------
    // 3. Preparar los datos del pedido
    // ----------------------------------------------------------

    const direccionEntrega =
      body.direccion_entrega?.trim() ||
      perfil.direccion ||
      "";

    const nombreCompleto =
      body.nombre_completo?.trim() ||
      perfil.nombre_completo;

    const telefono =
      body.telefono?.trim() ||
      perfil.telefono ||
      null;

    const metodoPago = body.metodo_pago;

    const total = Number(body.total);

    const items = Array.isArray(body.items)
      ? body.items
      : [];


    // ----------------------------------------------------------
    // 4. Validaciones
    // ----------------------------------------------------------

    if (!nombreCompleto) {
      return NextResponse.json(
        { error: "El nombre completo es obligatorio" },
        { status: 400 }
      );
    }

    if (!direccionEntrega) {
      return NextResponse.json(
        { error: "La dirección de entrega es obligatoria" },
        { status: 400 }
      );
    }

    if (!metodoPago) {
      return NextResponse.json(
        { error: "El método de pago es obligatorio" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { error: "El total del pedido no es válido" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }


    // ----------------------------------------------------------
    // 5. Crear el pedido
    //
    // IMPORTANTE:
    // La tabla pedidos utiliza cliente_id,
    // NO usuario_id.
    // ----------------------------------------------------------

    const { data: pedidoData, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
        cliente_id: user.id,
        nombre_completo: nombreCompleto,
        direccion_entrega: direccionEntrega,
        telefono: telefono,
        metodo_pago: metodoPago,
        estado_pedido: "Pendiente",
        total: total,
      })
      .select()
      .single();

    if (pedidoError) {
      console.error("Error al crear pedido:", pedidoError);

      throw pedidoError;
    }


    // ----------------------------------------------------------
    // 6. Crear los detalles del pedido
    // ----------------------------------------------------------

    const detalles = items.map((item: any) => ({
      pedido_id: pedidoData.id,
      producto_id: item.producto_id,
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio_unitario),
    }));

    const { error: detallesError } = await supabase
      .from("detalles_pedido")
      .insert(detalles);

    if (detallesError) {
      console.error(
        "Error al crear detalles del pedido:",
        detallesError
      );

      // Si falla la creación de los detalles,
      // eliminamos el pedido que acabamos de crear.
      await supabase
        .from("pedidos")
        .delete()
        .eq("id", pedidoData.id);

      throw detallesError;
    }


    // ----------------------------------------------------------
    // 7. Pedido creado correctamente
    // ----------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        pedido: pedidoData,
        message: "¡Pedido realizado correctamente!",
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Error al procesar pedido:", err);

    return NextResponse.json(
      {
        error:
          err?.message ||
          "No se pudo crear el pedido",
      },
      { status: 500 }
    );
  }
}