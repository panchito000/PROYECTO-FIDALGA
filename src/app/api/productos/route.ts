import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

/**
 * Cliente de administración de Supabase en el servidor.
 * Usa service role si existe; si no, la sesión del admin logueado.
 */
async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false }
    });
  }
  return createClient();
}

function limpiarUrlImagen(valor: unknown) {
  if (valor == null) return null;
  const texto = String(valor).trim();
  if (!texto) return null;
  try {
    const url = new URL(texto);
    const directa = url.searchParams.get('imgurl') || url.searchParams.get('url');
    if (directa) return directa;
  } catch {
    return texto;
  }
  return texto;
}

function esUrlDeFoto(url: string) {
  return /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(url);
}

async function resolverUrlImagen(valor: unknown) {
  const limpia = limpiarUrlImagen(valor);
  if (!limpia || esUrlDeFoto(limpia)) return limpia;

  try {
    const res = await fetch(limpia, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Fidalga/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (og?.[1]) return og[1];
  } catch {
    return limpia;
  }

  return limpia;
}

/**
 * GET /api/productos
 * Obtiene el listado completo de productos ordenados alfabéticamente por nombre.
 */
export async function GET() {
  try {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(id, nombre)')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error GET productos:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/productos
 * Inserta un nuevo producto en la base de datos de productos.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await getAdminClient();

    // Mapear el campo 'activo' hacia 'estado' en caso de enviarse desde la UI
    if (body.activo !== undefined && body.estado === undefined) {
      body.estado = body.activo;
    }
    delete body.activo;
    if ('imagen_url' in body) {
      body.imagen_url = await resolverUrlImagen(body.imagen_url);
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([body])
      .select();

    if (error) {
      console.error('Error POST productos:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/productos
 * Actualiza los datos o el estado (disponible/agotado) de un producto existente.
 */
export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    if (updates.activo !== undefined && updates.estado === undefined) {
      updates.estado = updates.activo;
    }
    delete updates.activo;
    if ('imagen_url' in updates) {
      updates.imagen_url = await resolverUrlImagen(updates.imagen_url);
    }

    const supabase = await getAdminClient();

    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error PUT productos:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No se pudo guardar. En Supabase, la tabla productos necesita una política UPDATE para authenticated.' 
      }, { status: 400 });
    }

    return NextResponse.json(data[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/productos?id=...
 * Elimina un producto de la base de datos según su ID.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const supabase = await getAdminClient();
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error DELETE producto:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
