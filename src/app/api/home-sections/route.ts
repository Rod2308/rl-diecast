import { NextResponse } from 'next/server';
import { getLiveHomeSections, saveLiveHomeSections } from '@/lib/products-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  const sections = await getLiveHomeSections();
  return NextResponse.json({ success: true, sections }, { headers: NO_CACHE_HEADERS });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.sections)) {
      return NextResponse.json({ success: false, error: 'Array de seções é obrigatório' }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    await saveLiveHomeSections(body.sections);
    return NextResponse.json({ success: true, sections: body.sections }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  return PUT(request);
}
