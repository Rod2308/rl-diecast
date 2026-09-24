import { NextResponse } from 'next/server';
import { getLiveSiteSettings, saveLiveSiteSettings, setLiveHeroProduct } from '@/lib/products-service';

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
    const body = await request.json();
    const updated = await saveLiveSiteSettings(body);

    if (body.heroProductId) {
      await setLiveHeroProduct(body.heroProductId);
    }

    return NextResponse.json({ success: true, settings: updated }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
