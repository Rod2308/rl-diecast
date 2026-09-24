import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { setLiveHeroProduct } from '@/lib/products-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const db = getDatabase();
  let heroProductId = db.settings?.heroProductId || db.products[0]?.id || '';

  if (isSupabaseConfigured()) {
    try {
      const { data: heroItem } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('technical_specs->>isHeroMain', 'true')
        .limit(1);

      if (heroItem && heroItem.length > 0 && heroItem[0]?.id) {
        heroProductId = heroItem[0].id;
      }
    } catch (e) {
      console.warn('Erro ao ler heroProductId do Supabase:', e);
    }
  }

  return NextResponse.json(
    {
      success: true,
      settings: {
        storeName: db.settings?.storeName || 'RL Diecast',
        contactEmail: db.settings?.contactEmail || 'contato@rldiecast.com.br',
        contactPhone: db.settings?.contactPhone || '(11) 98765-4321',
        pixDiscountPercent: db.settings?.pixDiscountPercent ?? 5,
        freeShippingThreshold: db.settings?.freeShippingThreshold ?? 299,
        bannerText:
          db.settings?.bannerText ||
          '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS • GARANTA COM ENTRADA A PARTIR DE R$ 15,00',
        heroProductId,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
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

    if (body.heroProductId) {
      await setLiveHeroProduct(body.heroProductId);
    }

    return NextResponse.json(
      {
        success: true,
        settings: db.settings,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
