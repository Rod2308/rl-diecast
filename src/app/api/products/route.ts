import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, mapSupabaseProductToProduct } from '@/lib/storage';
import { Product } from '@/lib/types';
import { generateStandardTitle, generateStandardDescription } from '@/lib/ads-generator';
import { calculatePricing } from '@/lib/pricing';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { setLiveHeroProduct } from '@/lib/products-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('marca');
  const scale = searchParams.get('escala');
  const status = searchParams.get('status');
  const isPreOrder = searchParams.get('preVenda');
  const search = searchParams.get('busca');
  const onlyPublished = searchParams.get('admin') !== 'true';

  // 1. Tenta buscar no Supabase
  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from('products').select('*');

      if (onlyPublished) {
        query = query.not('status', 'in', '(RASCUNHO,AGUARDANDO_APROVACAO,ENCERRADO)');
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

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(
          `title.ilike.%${q}%,vehicle_model.ilike.%${q}%,sku.ilike.%${q}%,brand.ilike.%${q}%,mgt_code.ilike.%${q}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        const products = data.map(mapSupabaseProductToProduct);
        return NextResponse.json(
          {
            total: products.length,
            products,
            source: 'supabase',
          },
          { headers: NO_CACHE_HEADERS }
        );
      }
    } catch (err) {
      console.warn('Fallback para banco local:', err);
    }
  }

  // 2. Fallback para banco local (data/rl_diecast_db.json)
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

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.vehicleModel.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.mgtCode && p.mgtCode.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(
    {
      total: filtered.length,
      products: filtered,
      source: 'local',
    },
    { headers: NO_CACHE_HEADERS }
  );
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
        : Math.max(0, Math.round((salePrice - downPaymentValue) * 100) / 100);

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

    const slug = `${brand}-${body.vehicleModel || title}-${body.sku || Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newId = body.id || `prod-${Date.now()}`;

    let images = body.images;
    if (body.imageUrl && typeof body.imageUrl === 'string') {
      images = [
        {
          id: `img-${Date.now()}`,
          url: body.imageUrl,
          isMain: true,
          order: 0,
        },
      ];
    } else if (!images || !Array.isArray(images) || images.length === 0) {
      images = [
        {
          id: `img-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ];
    }

    const technicalSpecs = body.technicalSpecs || body.technical_specs || {};
    if (body.setAsHero) {
      technicalSpecs.isHeroMain = true;
    }

    const newProduct: Product = {
      id: newId,
      sku: body.sku || `MGT${Math.floor(10000 + Math.random() * 90000)}`,
      mgtCode: body.mgtCode || body.sku,
      title,
      slug,
      brand,
      scale,
      vehicleModel: body.vehicleModel || title,
      colorOrEdition: body.colorOrEdition || '',
      material: body.material || 'Diecast metal c/ pneus de borracha',
      packagingType: body.packagingType || 'Caixa de colecionador lacrada',
      description,
      technicalSpecs,
      costPrice,
      salePrice,
      isPreOrder,
      downPaymentValue,
      balanceValue,
      arrivalForecast: body.arrivalForecast || 'Sob consulta',
      stock: Number(body.stock) || 12,
      status: body.status || (isPreOrder ? 'PRE_VENDA' : 'PRONTA_ENTREGA'),
      images,
      isFeatured: !!body.isFeatured || !!body.setAsHero,
      isNewRelease: body.isNewRelease !== undefined ? !!body.isNewRelease : true,
      sourceSupplier: 'MANUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
          material: newProduct.material || 'Diecast metal c/ pneus de borracha',
          packaging_type: newProduct.packagingType || 'Caixa de colecionador lacrada',
          description: newProduct.description || '',
          technical_specs: newProduct.technicalSpecs || {},
          cost_price: Number(newProduct.costPrice || 0),
          sale_price: Number(newProduct.salePrice || 0),
          is_pre_order: Boolean(newProduct.isPreOrder),
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
        }, { onConflict: 'id' });

        if (body.setAsHero) {
          await setLiveHeroProduct(newProduct.id);
        }
      } catch (cloudErr) {
        console.warn('Erro ao salvar no Supabase:', cloudErr);
      }
    }

    // Salva localmente como fallback
    db.products.unshift(newProduct);
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
      db.settings.heroProductId = newProduct.id;
    }
    saveDatabase(db);

    return NextResponse.json({ success: true, product: newProduct }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const targetId = body.id || body.sku;
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'ID ou SKU é obrigatório para atualização' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 1. Tenta carregar o produto atual do Supabase primeiro
    let current: Product | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: supaRows } = await supabaseAdmin
          .from('products')
          .select('*')
          .or(`id.eq.${body.id || ''},sku.eq.${body.sku || body.id || ''}`)
          .limit(1);

        if (supaRows && supaRows.length > 0) {
          current = mapSupabaseProductToProduct(supaRows[0]);
        }
      } catch (e) {
        console.warn('Erro ao buscar produto no Supabase:', e);
      }
    }

    // 2. Se não encontrou no Supabase, busca no banco local
    const localIndex = db.products.findIndex(
      (p) => p.id === body.id || (body.sku && p.sku === body.sku) || p.id === body.sku
    );

    if (!current && localIndex !== -1) {
      current = db.products[localIndex];
    }

    if (!current) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado para atualização' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Imagens
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

    // 4. Precificação e Valores
    const costPrice = body.costPrice !== undefined ? Number(body.costPrice) : current.costPrice;
    const salePrice = body.salePrice !== undefined ? Number(body.salePrice) : current.salePrice;
    const downPaymentValue =
      body.downPaymentValue !== undefined ? Number(body.downPaymentValue) : current.downPaymentValue;
    const balanceValue =
      body.balanceValue !== undefined
        ? Number(body.balanceValue)
        : Math.max(0, Math.round((salePrice - downPaymentValue) * 100) / 100);

    // 5. Technical Specs & Hero
    const currentSpecs = (current.technicalSpecs as any) || {};
    const updatedSpecs = {
      ...currentSpecs,
      ...(body.technicalSpecs || body.technical_specs || {}),
    };

    if (body.setAsHero !== undefined) {
      updatedSpecs.isHeroMain = Boolean(body.setAsHero);
    }

    const isPreOrder = body.isPreOrder !== undefined ? Boolean(body.isPreOrder) : current.isPreOrder;
    const isFeatured = body.isFeatured !== undefined ? Boolean(body.isFeatured) : (body.setAsHero ? true : current.isFeatured);

    const updatedProduct: Product = {
      ...current,
      ...body,
      images: updatedImages,
      costPrice,
      salePrice,
      downPaymentValue,
      balanceValue,
      stock: body.stock !== undefined ? Number(body.stock) : current.stock,
      status: body.status !== undefined ? body.status : current.status,
      isPreOrder,
      isFeatured,
      technicalSpecs: updatedSpecs,
      updatedAt: new Date().toISOString(),
    };

    // 6. Atualiza no Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('products').upsert({
          id: updatedProduct.id,
          sku: updatedProduct.sku,
          mgt_code: updatedProduct.mgtCode || null,
          title: updatedProduct.title,
          slug: updatedProduct.slug,
          brand: updatedProduct.brand,
          scale: updatedProduct.scale,
          vehicle_model: updatedProduct.vehicleModel,
          color_or_edition: updatedProduct.colorOrEdition || null,
          material: updatedProduct.material || 'Diecast metal c/ pneus de borracha',
          packaging_type: updatedProduct.packagingType || 'Caixa de colecionador lacrada',
          description: updatedProduct.description || '',
          technical_specs: updatedSpecs || {},
          cost_price: Number(updatedProduct.costPrice || 0),
          sale_price: Number(updatedProduct.salePrice || 0),
          is_pre_order: Boolean(updatedProduct.isPreOrder),
          down_payment_value: Number(updatedProduct.downPaymentValue || 0),
          balance_value: Number(updatedProduct.balanceValue || 0),
          arrival_forecast: updatedProduct.arrivalForecast || null,
          stock: Number(updatedProduct.stock || 0),
          status: updatedProduct.status || 'PRONTA_ENTREGA',
          images: updatedProduct.images || [],
          is_featured: updatedProduct.isFeatured,
          is_new_release: updatedProduct.isNewRelease,
          source_supplier: updatedProduct.sourceSupplier || 'MANUAL',
          updated_at: updatedProduct.updatedAt,
        }, { onConflict: 'id' });

        if (body.setAsHero) {
          await setLiveHeroProduct(updatedProduct.id);
        }
      } catch (cloudErr) {
        console.warn('Erro ao atualizar no Supabase:', cloudErr);
      }
    }

    // 7. Atualiza no banco local
    if (localIndex !== -1) {
      db.products[localIndex] = updatedProduct;
    } else {
      db.products.unshift(updatedProduct);
    }

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

    return NextResponse.json({ success: true, product: updatedProduct }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID obrigatório' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 1. Exclui no Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('products').delete().or(`id.eq.${id},sku.eq.${id}`);
      } catch (e) {
        console.warn('Erro ao excluir no Supabase:', e);
      }
    }

    // 2. Exclui no banco local
    const db = getDatabase();
    db.products = db.products.filter((p) => p.id !== id && p.sku !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: NO_CACHE_HEADERS });
  }
}
