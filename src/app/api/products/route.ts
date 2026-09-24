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

    const salePrice =
      body.salePrice !== undefined && body.salePrice !== null
        ? Number(body.salePrice)
        : pricing.salePrice;
    const downPaymentValue =
      body.downPaymentValue !== undefined && body.downPaymentValue !== null
        ? Number(body.downPaymentValue)
        : pricing.downPaymentValue;
    const balanceValue =
      body.balanceValue !== undefined && body.balanceValue !== null
        ? Number(body.balanceValue)
        : Math.max(0, salePrice - downPaymentValue);

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
        salePrice,
        downPaymentValue,
        balanceValue,
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
      salePrice,
      isPreOrder,
      downPaymentValue,
      balanceValue,
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const productIndex = db.products.findIndex(
      (p) => p.id === body.id || (body.sku && p.sku === body.sku)
    );

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado para atualização' },
        { status: 404 }
      );
    }

    const current = db.products[productIndex];

    // Trata atualização de imagens se enviada como string única ou array
    let updatedImages = current.images || [];
    if (body.imageUrl && typeof body.imageUrl === 'string') {
      updatedImages = [
        {
          id: `img-${Date.now()}`,
          url: body.imageUrl,
          isMain: true,
          order: 0,
        },
        ...(current.images?.filter((_, i) => i > 0) || []),
      ];
    } else if (Array.isArray(body.images)) {
      updatedImages = body.images;
    }

    const updatedProduct: Product = {
      ...current,
      ...body,
      images: updatedImages,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : current.costPrice,
      salePrice: body.salePrice !== undefined ? Number(body.salePrice) : current.salePrice,
      downPaymentValue:
        body.downPaymentValue !== undefined
          ? Number(body.downPaymentValue)
          : current.downPaymentValue,
      balanceValue:
        body.balanceValue !== undefined ? Number(body.balanceValue) : current.balanceValue,
      stock: body.stock !== undefined ? Number(body.stock) : current.stock,
      isPreOrder: body.isPreOrder !== undefined ? Boolean(body.isPreOrder) : current.isPreOrder,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : current.isFeatured,
      updatedAt: new Date().toISOString(),
    };

    db.products[productIndex] = updatedProduct;

    // Se marcado como destaque principal da Home (Hero)
    if (body.setAsHero) {
      if (!db.settings) {
        db.settings = {
          storeName: 'RL Diecast',
          contactEmail: 'contato@rldiecast.com.br',
          contactPhone: '(11) 98765-4321',
          pixDiscountPercent: 5,
          freeShippingThreshold: 299,
          bannerText: '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS',
        };
      }
      db.settings.heroProductId = updatedProduct.id;
    }

    saveDatabase(db);

    // Se Supabase estiver conectado, atualiza na nuvem
    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('products').upsert({
          id: updatedProduct.id,
          sku: updatedProduct.sku,
          mgt_code: updatedProduct.mgtCode,
          title: updatedProduct.title,
          slug: updatedProduct.slug,
          brand: updatedProduct.brand,
          scale: updatedProduct.scale,
          vehicle_model: updatedProduct.vehicleModel,
          color_or_edition: updatedProduct.colorOrEdition,
          material: updatedProduct.material,
          packaging_type: updatedProduct.packagingType,
          description: updatedProduct.description,
          cost_price: updatedProduct.costPrice,
          sale_price: updatedProduct.salePrice,
          is_pre_order: updatedProduct.isPreOrder,
          down_payment_value: updatedProduct.downPaymentValue,
          balance_value: updatedProduct.balanceValue,
          arrival_forecast: updatedProduct.arrivalForecast,
          stock: updatedProduct.stock,
          status: updatedProduct.status,
          images: updatedProduct.images,
          is_featured: updatedProduct.isFeatured,
          is_new_release: updatedProduct.isNewRelease,
          source_supplier: updatedProduct.sourceSupplier,
          updated_at: updatedProduct.updatedAt,
        });
      } catch (cloudErr) {
        console.warn('Erro ao atualizar produto no Supabase:', cloudErr);
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    }

    const db = getDatabase();
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Erro ao excluir no Supabase:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
