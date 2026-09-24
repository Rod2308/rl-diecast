import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getLiveSiteSettings, saveLiveSiteSettings, setLiveHeroProduct } from '@/lib/products-service';
import { isAdminAuthenticated, verifyAdminPassword } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  const settings = await getLiveSiteSettings();
  return NextResponse.json({ success: true, settings }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: Request) {
  try {
    const isAuth = await isAdminAuthenticated();
    const authHeader = request.headers.get('x-admin-password');
    const isHeaderValid = Boolean(authHeader && verifyAdminPassword(authHeader));

    if (!isAuth && !isHeaderValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acesso negado. Apenas o perfil administrador autenticado com senha pode alterar estas configurações.',
        },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const updated = await saveLiveSiteSettings(body);

    if (body.heroProductId) {
      await setLiveHeroProduct(body.heroProductId);
    }

    try {
      revalidatePath('/', 'page');
      revalidatePath('/', 'layout');
      revalidatePath('/admin/banners', 'page');
      revalidatePath('/admin/configuracoes', 'page');
    } catch (e) {
      console.warn('Aviso: revalidatePath:', e);
    }

    return NextResponse.json({ success: true, settings: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Erro ao salvar configurações' }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
