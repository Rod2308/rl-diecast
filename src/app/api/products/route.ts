import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, mapSupabaseProductToProduct } from '@/lib/storage';
import { Product } from '@/lib/types';
import { generateStandardTitle, generateStandardDescription } from '@/lib/ads-generator';
import { calculatePricing } from '@/lib/pricing';
import { isSupabaseConfigured, supabaseAdmin, supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('marca');
  const scale = searchParams.get('escala');
  const status = searchParams.get('status');
  const isPreOrder = searchParams.get('preVenda');
  const search = searchParams.get('busca');
  const onlyPublished = searchParams.get('admin') !== 'true';

  // Se Supabase estiver configurado, tenta buscar em nuvem primeiro
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('products').select('*');

      if (onlyPublished) {
        query = query.not('status', 'in', '("RASCUNHO","AGUARDANDO_APROVACAO","ENCERRADO")');
      }

      if (brand) {
        query = query.ilike('brand', brand);
      }

      if (scale) {
        query = query.eq('scale', scale);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (isPreOrder === 'true') {
        query = query.eq('is_pre_order', true);
      } else if (isPreOrder === 'false') {
        query = query.eq('is_pre_order', false);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,vehicle_model.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const products = data.map(mapSupabaseProductToProduct);
        return NextResponse.json({
          total: products.length,
          products,
          source: 'supabase',
        });
      }
    } catch (err) {
      console.warn('Fallback para banco local:', err);
    }
  }

  // Fallback para banco local (data/rl_diecast_db.json)
  const db = getDatabase();
  let filtered = [...db.products];

  if (onlyPublished) {
    filtered = filtered.filter(
      (p) => p.status !== 'RASCUNHO' && p.status !== 'AGUARDANDO_APROVACAO' && p.status !== 'ENCERRADO'
    );
  }

  if (brand) {
    filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (scale) {
    filtered = filtered.filter((p) => p.scale === scale);
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (isPreOrder === 'true') {
    filtered = filtered.filter((p) => p.isPreOrder);
  } else if (isPreOrder === 'false') {
    filtered = filtered.filter((p) => !p.isPreOrder);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.vehicleModel.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.mgtCode && p.mgtCode.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    total: filtered.length,
    products: filtered,
    source: 'local',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const brand = body.brand || 'Mini GT';
    const scale = body.scale || '1:64';
    const isPreOrder = body.isPreOrder ?? true;
    const costPrice = Number(body.costPrice) || 50;

    const pricing = calculatePricing(
      costPrice,
      brand,
      db.pricingRules[brand] || db.pricingRules.DEFAULT,
      body.customDownPaymentPercent
    );

    const title =
      body.title ||
      generateStandardTitle({
        brand,
        scale,
        vehicleModel: body.vehicleModel,
        colorOrEdition: body.colorOrEdition,
        code: body.mgtCode || body.sku,
        isPreOrder,
      });

    const description =
      body.description ||
      generateStandardDescription({
        brand,
        scale,
        vehicleModel: body.vehicleModel,
        colorOrEdition: body.colorOrEdition,
        code: body.mgtCode || body.sku,
        isPreOrder,
        material: body.material,
        packagingType: body.packagingType,
        arrivalForecast: body.arrivalForecast,
        salePrice: body.salePrice || pricing.salePrice,
        downPaymentValue: body.downPaymentValue || pricing.downPaymentValue,
        balanceValue: body.balanceValue || pricing.balanceValue,
        stockLimit: body.stock || 24,
      });

    const slug = `${brand}-${body.vehicleModel}-${body.sku}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: body.sku,
      mgtCode: body.mgtCode || body.sku,
      title,
      slug,
      brand,
      scale,
      vehicleModel: body.vehicleModel,
      colorOrEdition: body.colorOrEdition || '',
      material: body.material || 'Diecast metal c/ pneus de borracha',
      packagingType: body.packagingType || 'Caixa de colecionador lacrada',
      description,
      costPrice,
      salePrice: body.salePrice || pricing.salePrice,
      isPreOrder,
      downPaymentValue: body.downPaymentValue || pricing.downPaymentValue,
      balanceValue: body.balanceValue || pricing.balanceValue,
      arrivalForecast: body.arrivalForecast || 'Sob consulta',
      stock: Number(body.stock) || 12,
      status: body.status || 'PRONTA_ENTREGA',
      images: body.images || [
        {
          id: `img-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ],
      isFeatured: !!body.isFeatured,
      isNewRelease: !!body.isNewRelease,
      sourceSupplier: 'MANUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salva localmente
    db.products.unshift(newProduct);
    saveDatabase(db);

    // Salva no Supabase se configurado
    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('products').upsert({
          id: newProduct.id,
          sku: newProduct.sku,
          mgt_code: newProduct.mgtCode,
          title: newProduct.title,
          slug: newProduct.slug,
          brand: newProduct.brand,
          scale: newProduct.scale,
          vehicle_model: newProduct.vehicleModel,
          color_or_edition: newProduct.colorOrEdition,
          material: newProduct.material,
          packaging_type: newProduct.packagingType,
          description: newProduct.description,
          cost_price: newProduct.costPrice,
          sale_price: newProduct.salePrice,
          is_pre_order: newProduct.isPreOrder,
          down_payment_value: newProduct.downPaymentValue,
          balance_value: newProduct.balanceValue,
          arrival_forecast: newProduct.arrivalForecast,
          stock: newProduct.stock,
          status: newProduct.status,
          images: newProduct.images,
          is_featured: newProduct.isFeatured,
          is_new_release: newProduct.isNewRelease,
          source_supplier: newProduct.sourceSupplier,
          created_at: newProduct.createdAt,
          updated_at: newProduct.updatedAt,
        });
      } catch (cloudErr) {
        console.warn('Erro ao replicar no Supabase:', cloudErr);
      }
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
