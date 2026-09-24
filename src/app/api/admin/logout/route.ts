import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({
    success: true,
    message: 'Sessão de administrador encerrada.',
  });
}
