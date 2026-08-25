import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/ofertas
 * Obtiene la lista de ofertas vigentes y activas con los datos de los productos en promoción.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ofertas')
      .select('*, productos(id, nombre, precio, imagen_url)')
      .eq('activo', true);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/ofertas
 * Registra una nueva oferta de descuento para un producto.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ofertas')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
