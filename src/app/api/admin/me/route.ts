import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  return NextResponse.json(
    { authenticated: isAuth, role: isAuth ? 'admin' : 'guest' },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
