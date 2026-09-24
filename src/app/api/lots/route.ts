import { NextResponse } from 'next/server';
import { getLiveLots, saveLiveLot, deleteLiveLot } from '@/lib/products-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') || undefined;

  const lots = await getLiveLots(productId);
  return NextResponse.json({ success: true, lots }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.productId) {
      return NextResponse.json({ success: false, error: 'productId é obrigatório' }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    const lot = await saveLiveLot(body);
    return NextResponse.json({ success: true, lot }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'ID do lote é obrigatório' }, { status: 400, headers: NO_CACHE_HEADERS });
    }
    const lot = await saveLiveLot(body);
    return NextResponse.json({ success: true, lot }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do lote é obrigatório' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await deleteLiveLot(id);
    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
