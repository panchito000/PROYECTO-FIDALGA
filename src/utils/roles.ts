export const ROL_ADMIN_ID = 'd9f76488-9905-459d-adde-0d0e87e5efd9';
export const ROL_EMPLEADO_ID = '703d17fd-bfb6-40d1-b378-98362e9cb3b0';

type PerfilRol = {
  rol?: string | null;
  rol_id?: string | null;
} | null;

type UsuarioRol = {
  user_metadata?: { rol?: string; rol_id?: string };
  email?: string | null;
} | null;

export async function leerPerfilRol(
  supabase: { from: (tabla: string) => any },
  userId?: string | null
): Promise<PerfilRol> {
  if (!userId) return null;

  const ambos = await supabase.from('perfiles_usuario').select('rol, rol_id').eq('id', userId).maybeSingle();
  if (!ambos.error) return ambos.data;

  const porId = await supabase.from('perfiles_usuario').select('rol_id').eq('id', userId).maybeSingle();
  if (!porId.error) return porId.data;

  const porTexto = await supabase.from('perfiles_usuario').select('rol').eq('id', userId).maybeSingle();
  return porTexto.data ?? null;
}

export function valorRol(perfil?: PerfilRol, user?: UsuarioRol) {
  return String(
    perfil?.rol_id ||
      user?.user_metadata?.rol_id ||
      perfil?.rol ||
      user?.user_metadata?.rol ||
      ''
  ).trim();
}

export function puedeEntrarAlPanel(perfil?: PerfilRol, user?: UsuarioRol) {
  const rol = valorRol(perfil, user);
  const texto = rol.toLowerCase();
  return (
    rol === ROL_ADMIN_ID ||
    rol === ROL_EMPLEADO_ID ||
    texto === 'admin' ||
    texto === 'empleado' ||
    Boolean(user?.email?.endsWith('@fidalga.com'))
  );
}

export function esRolEmpleado(perfil?: PerfilRol, user?: UsuarioRol) {
  const rol = valorRol(perfil, user);
  return rol === ROL_EMPLEADO_ID || rol.toLowerCase() === 'empleado';
}

export function esRolAdmin(perfil?: PerfilRol, user?: UsuarioRol) {
  const rol = valorRol(perfil, user);
  return (
    rol === ROL_ADMIN_ID ||
    rol.toLowerCase() === 'admin' ||
    Boolean(user?.email?.endsWith('@fidalga.com'))
  );
}
