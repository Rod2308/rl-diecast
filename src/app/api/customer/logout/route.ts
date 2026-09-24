import { NextResponse } from 'next/server';
import { clearCustomerSessionCookie } from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearCustomerSessionCookie();
  return NextResponse.json({
    success: true,
    message: 'Sessão encerrada com sucesso.',
  });
}
