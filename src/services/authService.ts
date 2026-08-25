import { createClient } from '@/utils/supabase/client';

export interface RegisterUserData {
  email: string;
  password: string;
  nombreCompleto: string;
  rol: 'cliente' | 'admin';
}

export interface LoginUserData {
  email: string;
  password: string;
}

/**
 * Servicio central de autenticación y gestión de usuarios en Supabase Auth.
 */
export const authService = {
  // Iniciar sesión y cargar el perfil de usuario
  async login({ email, password }: LoginUserData) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const perfil = await this.getProfile(data.user.id);
    return { user: data.user, perfil };
  },

  // Registrar una nueva cuenta de cliente o administrador
  async register({ email, password, nombreCompleto, rol }: RegisterUserData) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombreCompleto,
          rol,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      try {
        await supabase.from('perfiles_usuario').upsert({
          id: data.user.id,
          nombre_completo: nombreCompleto,
          rol,
        });
      } catch {
        // Ignorar si el disparador SQL de Supabase realiza la inserción automática
      }
    }

    return data;
  },

  // Cerrar la sesión activa del usuario
  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener el usuario autenticado actualmente y su perfil
  async getCurrentUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const perfil = await this.getProfile(user.id);
    return { ...user, perfil };
  },

  // Consultar el perfil guardado en la tabla perfiles_usuario
  async getProfile(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from('perfiles_usuario')
      .select('*')
      .eq('id', userId)
      .single();

    return data;
  },
};
