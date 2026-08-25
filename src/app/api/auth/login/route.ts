import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Endpoint para autenticar usuarios mediante correo y contraseña.
 * Verifica las credenciales con Supabase Auth y devuelve los datos de la sesión.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();

    // Autenticación con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en el servidor' }, { status: 500 });
  }
}
