import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    success: true,
    settings: db.settings || {
      storeName: 'RL Diecast',
      contactEmail: 'contato@rldiecast.com.br',
      contactPhone: '(11) 98765-4321',
      pixDiscountPercent: 5,
      freeShippingThreshold: 299,
      bannerText: '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS • GARANTA COM ENTRADA A PARTIR DE R$ 15,00',
      heroProductId: db.products[0]?.id || '',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    db.settings = {
      ...db.settings,
      ...body,
    };

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      settings: db.settings,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
