"use client";

import { pedidosService } from "@/services/pedidosService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/Input";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";

type DeliveryMethod = "envio" | "retiro";
type PaymentMethod = "efectivo" | "qr";

export default function CheckoutPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nit, setNit] = useState("");
  const [razonSocial, setRazonSocial] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("envio");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("efectivo");

  const {
    items,
    cartTotal,
    updateQuantity,
    clearCart,
    isLoaded,
  } = useCart();

  // ============================================================
  // Redirigir al inicio si el carrito está vacío y ya cargó
  // ============================================================
  useEffect(() => {
    if (isLoaded && items.length === 0 && !orderSuccess) {
      router.replace("/");
    }
  }, [isLoaded, items.length, orderSuccess, router]);

  // ============================================================
  // T3: Verificar que exista una sesión antes de entrar al checkout
  // ============================================================
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Obtener el correo del usuario autenticado
      setEmail(user.email || "");

      // Obtener el perfil del usuario
      const {
        data: perfil,
        error: perfilError,
      } = await supabase
        .from("perfiles_usuario")
        .select(
          "nombre_completo, telefono, direccion"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (perfilError) {
        console.error(
          "Error al obtener el perfil:",
          perfilError
        );
      }

      // Cargar automáticamente los datos existentes
      // del perfil del usuario
      if (perfil) {
        setNombre(
          perfil.nombre_completo || ""
        );

        setTelefono(
          perfil.telefono || ""
        );

        setDireccion(
          perfil.direccion || ""
        );
      }

      setCheckingAuth(false);
    };

    checkUser();
  }, [router]);

  // ============================================================
  // T3 + T4 + T5: Finalizar pedido
  //
  // Utiliza pedidosService.crearPedido()
  //
  // T3:
  // - Guarda el pedido
  // - Guarda los detalles del pedido
  //
  // T4:
  // - Verifica el stock disponible
  // - Descuenta el stock comprado
  //
  // T5:
  // - Guarda origen = "web"
  //
  // El carrito solamente se vacía cuando todo termina
  // correctamente.
  // ============================================================
  const handleFinalizarPedido = async () => {
    // Limpiar cualquier error anterior
    setOrderError("");

    // ----------------------------------------------------------
    // Validaciones del carrito
    // ----------------------------------------------------------

    if (items.length === 0) {
      setOrderError(
        "Tu carrito está vacío."
      );
      return;
    }

    // ----------------------------------------------------------
    // Validaciones de datos obligatorios
    // ----------------------------------------------------------

    if (!nombre.trim()) {
      setOrderError(
        "Por favor, ingresa tu nombre completo."
      );
      return;
    }

    if (
      deliveryMethod === "envio" &&
      !direccion.trim()
    ) {
      setOrderError(
        "Por favor, ingresa una dirección de entrega."
      );
      return;
    }

    if (!telefono.trim()) {
      setOrderError(
        "Por favor, ingresa tu teléfono."
      );
      return;
    }

    if (!nit.trim()) {
      setOrderError(
        "Por favor, ingresa tu NIT o CI."
      );
      return;
    }

    if (!razonSocial.trim()) {
      setOrderError(
        "Por favor, ingresa la razón social."
      );
      return;
    }

    try {
      setProcessingOrder(true);

      // --------------------------------------------------------
      // Dirección final
      // --------------------------------------------------------

      const direccionFinal =
        deliveryMethod === "envio"
          ? direccion.trim()
          : "Retiro en tienda";

      // --------------------------------------------------------
      // Costo de envío
      // --------------------------------------------------------

      const costoEnvio =
        deliveryMethod === "envio"
          ? 12
          : 0;

      // --------------------------------------------------------
      // Total final
      // --------------------------------------------------------

      const totalFinal =
        cartTotal + costoEnvio;

      // --------------------------------------------------------
      // T3: Preparar productos del carrito
      //
      // Cada producto contiene:
      // - id
      // - cantidad
      // - precio
      // --------------------------------------------------------

      const pedidoItems = items.map(
        (item) => ({
          producto_id: item.id,
          cantidad: item.qty,
          precio_unitario: item.price,
        })
      );

      console.log(
        "Productos enviados al pedido:",
        pedidoItems
      );

      // --------------------------------------------------------
      // T3 + T4 + T5
      //
      // pedidosService.crearPedido se encarga de:
      //
      // T3 → Crear pedido y detalles
      // T4 → Validar y descontar stock
      // T5 → Guardar origen = "web"
      // --------------------------------------------------------

      const pedido =
        await pedidosService.crearPedido({
          nombre_completo:
            nombre.trim(),

          telefono:
            telefono.trim(),

          direccion_entrega:
            direccionFinal,

          metodo_pago:
            paymentMethod,

          total:
            totalFinal,

          nit:
            nit.trim(),

          razon_social:
            razonSocial.trim(),

          items:
            pedidoItems,
        });

      console.log(
        "Pedido creado correctamente:",
        pedido
      );

      // --------------------------------------------------------
      // IMPORTANTE:
      //
      // El carrito solamente se vacía después de que
      // crearPedido haya terminado correctamente.
      // --------------------------------------------------------

      clearCart();

      // --------------------------------------------------------
      // Mostrar mensaje verde de éxito
      // --------------------------------------------------------

      setOrderSuccess(true);

      // --------------------------------------------------------
      // Volver al inicio después de unos segundos
      // --------------------------------------------------------

      setTimeout(() => {
        router.push("/");
      }, 2500);

    } catch (error: any) {
      console.error(
        "Error al crear pedido:",
        error
      );

      // --------------------------------------------------------
      // Mostrar error en rojo dentro del checkout
      // --------------------------------------------------------

      const mensaje =
        error?.message ||
        "No se pudo realizar el pedido.";

      setOrderError(mensaje);

    } finally {
      setProcessingOrder(false);
    }
  };

  // ============================================================
  // T3: Pantalla mientras verificamos la sesión o el carrito
  // ============================================================
  if (checkingAuth || !isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          Verificando sesión...
        </p>
      </div>
    );
  }

  // ============================================================
  // T3: Mensaje de éxito después de guardar el pedido
  // ============================================================
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />

        <main className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="text-center">

            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl text-[#00c653]">
                ✓
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              ¡Pedido realizado correctamente!
            </h1>

            <p className="text-gray-500 text-sm mt-3">
              Tu pedido ha sido registrado correctamente.
            </p>

            <p className="text-gray-400 text-xs mt-2">
              Volviendo al inicio...
            </p>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <Navbar />

      <main className="w-full max-w-[1200px] mx-auto px-6 md:px-10 py-10">

        <button 
          onClick={() => router.back()} 
          className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-[#00c653] transition-colors w-fit"
        >
          ← Volver atrás
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

          {/* ======================================================
              COLUMNA IZQUIERDA
          ====================================================== */}

          <section className="w-full">

            {/* ==================================================
                CONTACTO
            ================================================== */}

            <div className="pb-7 border-b border-gray-200">

              <h2 className="text-[22px] font-bold text-gray-900 mb-5">
                Contacto
              </h2>

              <Input
                id="email"
                label="Correo electrónico"
                placeholder="nombre@ejemplo.com"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            {/* ==================================================
                ENTREGA
            ================================================== */}

            <div className="py-7 border-b border-gray-200">

              <h2 className="text-[22px] font-bold text-gray-900 mb-5">
                Entrega
              </h2>

              {/* Envío / Retiro */}

              <div className="flex w-full mb-5">

                <button
                  type="button"
                  onClick={() =>
                    setDeliveryMethod("envio")
                  }
                  className={`w-1/2 h-10 font-semibold text-sm rounded-l-md transition-colors ${
                    deliveryMethod === "envio"
                      ? "bg-[#00c653] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Envío
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeliveryMethod("retiro")
                  }
                  className={`w-1/2 h-10 font-semibold text-sm rounded-r-md transition-colors ${
                    deliveryMethod === "retiro"
                      ? "bg-[#00c653] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Retiro
                </button>

              </div>

              {deliveryMethod === "envio" ? (
                <>

                  <Input
                    id="nombre"
                    label="Nombre Completo"
                    placeholder="Juan Pérez"
                    value={nombre}
                    onChange={(e) =>
                      setNombre(e.target.value)
                    }
                  />

                  <Input
                    id="direccion"
                    label="Dirección de entrega"
                    placeholder="Calle Principal 123, Depto 4B"
                    value={direccion}
                    onChange={(e) =>
                      setDireccion(e.target.value)
                    }
                  />

                  <Input
                    id="telefono"
                    label="Teléfono celular"
                    placeholder="+591 7 123 4567"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(e.target.value)
                    }
                  />

                </>
              ) : (
                <>

                  <Input
                    id="nombre-retiro"
                    label="Nombre Completo"
                    placeholder="Juan Pérez"
                    value={nombre}
                    onChange={(e) =>
                      setNombre(e.target.value)
                    }
                  />

                  <Input
                    id="telefono-retiro"
                    label="Teléfono celular"
                    placeholder="+591 7 123 4567"
                    value={telefono}
                    onChange={(e) =>
                      setTelefono(e.target.value)
                    }
                  />

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">

                    <p className="text-sm font-semibold text-gray-800">
                      Retiro en tienda
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Podrás recoger tu pedido en una tienda Fidalga.
                    </p>

                  </div>

                </>
              )}

            </div>

            {/* ==================================================
                FACTURACIÓN
            ================================================== */}

            <div className="py-7 border-b border-gray-200">

              <h2 className="text-[22px] font-bold text-gray-900 mb-5">
                Facturación
              </h2>

              <Input
                id="nit"
                label="NIT o CI"
                placeholder="1234567890"
                value={nit}
                onChange={(e) =>
                  setNit(e.target.value)
                }
              />

              <Input
                id="razon"
                label="Razón Social (Nombre para Factura)"
                placeholder="Empresa S.A."
                value={razonSocial}
                onChange={(e) =>
                  setRazonSocial(e.target.value)
                }
              />

            </div>

            {/* ==================================================
                MÉTODO DE PAGO
            ================================================== */}

            <div className="py-7">

              <h2 className="text-[22px] font-bold text-gray-900 mb-5">
                Método de pago
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("efectivo")
                  }
                  className={`h-12 rounded-lg font-semibold transition-colors ${
                    paymentMethod === "efectivo"
                      ? "border-2 border-[#00c653] bg-green-50 text-gray-800"
                      : "border-2 border-gray-200 bg-white text-gray-800 hover:border-[#00c653]"
                  }`}
                >
                  Efectivo
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("qr")
                  }
                  className={`h-12 rounded-lg font-semibold transition-colors ${
                    paymentMethod === "qr"
                      ? "border-2 border-[#00c653] bg-green-50 text-gray-800"
                      : "border-2 border-gray-200 bg-white text-gray-800 hover:border-[#00c653]"
                  }`}
                >
                  QR
                </button>

              </div>

            </div>

          </section>

          {/* ======================================================
              COLUMNA DERECHA
          ====================================================== */}

          <aside className="w-full">

            <div className="bg-[#f4f5f6] rounded-xl p-6 shadow-sm">

              <h2 className="text-[17px] font-bold text-gray-900 pb-4 border-b border-gray-200">
                Resumen del Pedido
              </h2>

              {items.length === 0 ? (

                <div className="py-8">

                  <p className="text-gray-500 text-sm text-center">
                    Tu carrito está vacío
                  </p>

                </div>

              ) : (

                <div>

                  {/* ==================================================
                      PRODUCTOS
                  ================================================== */}

                  <div className="py-5 border-b border-gray-200">

                    {items.map((item) => (

                      <div
                        key={item.id}
                        className="flex gap-4 items-start mb-5 last:mb-0"
                      >

                        {/* Imagen */}

                        <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">

                          {item.image ? (

                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              Sin imagen
                            </div>

                          )}

                        </div>

                        {/* Información */}

                        <div className="flex-1 min-w-0">

                          <div className="flex justify-between gap-3">

                            <div>

                              <p className="text-sm font-bold text-gray-800 leading-tight">
                                {item.title}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                Cantidad: {item.qty}
                              </p>

                            </div>

                            <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                              Bs.{" "}
                              {(
                                item.price *
                                item.qty
                              ).toFixed(2)}
                            </span>

                          </div>

                          {/* Cantidad */}

                          <div className="flex items-center gap-3 mt-3">

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.qty + 1
                                )
                              }
                              className="w-6 h-6 rounded-full border border-gray-400 bg-white flex items-center justify-center text-gray-700 text-sm font-bold hover:bg-gray-100"
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>

                            <span className="text-sm font-semibold text-gray-700">
                              {item.qty}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.qty - 1
                                )
                              }
                              disabled={item.qty <= 1}
                              className="w-6 h-6 rounded-full border border-gray-400 bg-white flex items-center justify-center text-gray-700 text-sm font-bold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Disminuir cantidad"
                            >
                              −
                            </button>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                  {/* ==================================================
                      SUBTOTAL
                  ================================================== */}

                  <div className="py-3">

                    <div className="flex justify-between items-center text-sm">

                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <span className="font-semibold text-gray-700">
                        Bs.{" "}
                        {cartTotal.toFixed(2)}
                      </span>

                    </div>

                    <div className="flex justify-between items-center text-sm mt-3">

                      <span className="text-gray-500">
                        Costo de Envío
                      </span>

                      <span className="font-semibold text-gray-700">
                        Bs.{" "}
                        {deliveryMethod === "envio"
                          ? "12.00"
                          : "0.00"}
                      </span>

                    </div>

                  </div>

                  {/* ==================================================
                      TOTAL
                  ================================================== */}

                  <div className="flex justify-between items-center pt-2 pb-5">

                    <span className="text-lg font-bold text-gray-800">
                      Total
                    </span>

                    <span className="text-lg font-bold text-gray-800">
                      Bs.{" "}
                      {(
                        cartTotal +
                        (deliveryMethod === "envio"
                          ? 12
                          : 0)
                      ).toFixed(2)}
                    </span>

                  </div>

                  {/* ==================================================
                      ERROR
                  ================================================== */}

                  {orderError && (

                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">

                      <p className="text-sm font-semibold text-red-700">
                        No se pudo realizar el pedido
                      </p>

                      <p className="text-sm text-red-600 mt-1 break-words">
                        {orderError}
                      </p>

                    </div>

                  )}

                  {/* ==================================================
                      T3 + T4 + T5
                      FINALIZAR PEDIDO
                  ================================================== */}

                  <button
                    type="button"
                    onClick={handleFinalizarPedido}
                    disabled={processingOrder}
                    className="w-full h-10 bg-[#00c653] hover:bg-[#00b84c] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
                  >
                    {processingOrder
                      ? "Procesando pedido..."
                      : "Finalizar Pedido"}
                  </button>

                  {/* ==================================================
                      SEGURIDAD
                  ================================================== */}

                  <div className="flex justify-center items-center gap-2 mt-5">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-400"
                    >

                      <rect
                        width="16"
                        height="11"
                        x="4"
                        y="11"
                        rx="2"
                        ry="2"
                      />

                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />

                    </svg>

                    <p className="text-[11px] text-gray-400">
                      Pago 100% Seguro y Encriptado
                    </p>

                  </div>

                </div>

              )}

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}
