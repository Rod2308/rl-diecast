import { NextResponse } from 'next/server';
import { getLiveCategories, saveLiveCategory, deleteLiveCategory } from '@/lib/products-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const onlyActive = searchParams.get('admin') !== 'true';

  const categories = await getLiveCategories(onlyActive);
  return NextResponse.json({ success: true, categories }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await saveLiveCategory(body);
    return NextResponse.json({ success: true, category }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'ID da categoria é obrigatório' }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    const category = await saveLiveCategory(body);
    return NextResponse.json({ success: true, category }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da categoria é obrigatório' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await deleteLiveCategory(id);
    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
