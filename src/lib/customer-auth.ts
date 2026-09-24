import { cookies } from 'next/headers';
import crypto from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { getDatabase, saveDatabase } from './storage';
import { Customer } from './types';

const COOKIE_NAME = 'rl_customer_session';

function getSecretKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'rl-diecast-customer-salt-2026';
}

function signPayload(payloadStr: string): string {
  const secret = getSecretKey();
  const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  return `${Buffer.from(payloadStr).toString('base64url')}.${signature}`;
}

function verifyAndDecodePayload(token: string): any | null {
  try {
    const [b64, signature] = token.split('.');
    if (!b64 || !signature) return null;

    const payloadStr = Buffer.from(b64, 'base64url').toString('utf-8');
    const secret = getSecretKey();
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    if (signature !== expectedSignature) return null;
    return JSON.parse(payloadStr);
  } catch {
    return null;
  }
}

/**
 * Cria uma nova conta de cliente (no Supabase Auth e no banco local)
 */
export async function createCustomerAccount(params: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  cpf?: string;
}): Promise<{ customer: Customer }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const cleanPhone = params.phone ? params.phone.trim() : '';
  const cleanCpf = params.cpf ? params.cpf.trim() : '';

  let customerId = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1. Cria usuário no Supabase Auth se configurado
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: params.password,
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          phone: cleanPhone,
          cpf: cleanCpf,
        },
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          throw new Error('Este e-mail já possui cadastro. Faça login ou use outro e-mail.');
        }
        throw new Error(error.message);
      }

      if (data?.user) {
        customerId = data.user.id;
      }
    } catch (err: any) {
      if (err.message?.includes('já possui cadastro')) {
        throw err;
      }
      console.warn('Aviso: erro ao criar no Supabase Auth, usando fallback local:', err);
    }
  }

  const customer: Customer = {
    id: customerId,
    email: cleanEmail,
    name: cleanName,
    phone: cleanPhone,
    cpf: cleanCpf,
    createdAt: new Date().toISOString(),
    addresses: [],
  };

  // 2. Salva no banco local de contingência
  const db = getDatabase();
  if (!(db as any).customers) {
    (db as any).customers = [];
  }
  const existing = (db as any).customers.find((c: Customer) => c.email === cleanEmail);
  if (existing) {
    throw new Error('Este e-mail já possui cadastro. Faça login ou recupere o acesso.');
  }

  // Hash simples da senha local para fallback
  const passwordHash = crypto.createHash('sha256').update(params.password).digest('hex');
  (db as any).customers.push({ ...customer, passwordHash });
  saveDatabase(db);

  return { customer };
}

/**
 * Autentica cliente com email e senha
 */
export async function authenticateCustomer(params: {
  email: string;
  password: string;
}): Promise<{ customer: Customer }> {
  const cleanEmail = params.email.trim().toLowerCase();

  // 1. Tenta autenticação no Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password,
      });

      if (!error && data?.user) {
        const u = data.user;
        const meta = u.user_metadata || {};
        return {
          customer: {
            id: u.id,
            email: u.email || cleanEmail,
            name: meta.name || cleanEmail.split('@')[0],
            phone: meta.phone,
            cpf: meta.cpf,
            createdAt: u.created_at || new Date().toISOString(),
            addresses: meta.addresses || [],
          },
        };
      }
    } catch (e) {
      console.warn('Tentando fallback local para login:', e);
    }
  }

  // 2. Fallback no banco local
  const db = getDatabase();
  const customers = (db as any).customers || [];
  const found = customers.find((c: any) => c.email === cleanEmail);

  if (!found) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const inputHash = crypto.createHash('sha256').update(params.password).digest('hex');
  if (found.passwordHash && found.passwordHash !== inputHash) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const { passwordHash: _, ...customerData } = found;
  return { customer: customerData };
}

/**
 * Define o cookie de sessão do cliente
 */
export async function setCustomerSessionCookie(customer: Customer): Promise<void> {
  const cookieStore = await cookies();
  const token = signPayload(JSON.stringify(customer));

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias de sessão
    path: '/',
  });
}

/**
 * Limpa o cookie de sessão do cliente
 */
export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Retorna o cliente atualmente autenticado (ou null)
 */
export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie || !cookie.value) return null;

    const customer = verifyAndDecodePayload(cookie.value);
    return customer || null;
  } catch {
    return null;
  }
}
