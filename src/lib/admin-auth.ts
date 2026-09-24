import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'rl_admin_session';
const DEFAULT_PASSWORD = 'rldiecast2026';

function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD).trim();
}

function getSecretHash(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'rl-diecast-secret-salt-2026';
  return crypto.createHmac('sha256', secret).update(getAdminPassword()).digest('hex');
}

/**
 * Valida a senha fornecida pelo usuário contra a senha do administrador
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  const expected = getAdminPassword();
  return password.trim() === expected;
}

/**
 * Define o cookie de sessão do administrador (HTTP-only)
 */
export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = getSecretHash();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  });
}

/**
 * Remove o cookie de sessão do administrador
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Verifica se o usuário atual possui sessão válida de administrador
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie || !cookie.value) return false;

    const expected = getSecretHash();
    return cookie.value === expected;
  } catch {
    return false;
  }
}
