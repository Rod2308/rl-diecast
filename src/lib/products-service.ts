import { Product, Banner, HomeSection, Category, ProductLot, SiteSettings } from './types';
import {
  getDatabase,
  saveDatabase,
  mapSupabaseProductToProduct,
  mapSupabaseBannerToBanner,
  mapSupabaseHomeSectionToHomeSection,
  mapSupabaseCategoryToCategory,
  mapSupabaseLotToLot,
} from './storage';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';

export interface GetProductsOptions {
  onlyPublished?: boolean;
  status?: string;
  isPreOrder?: boolean;
  limit?: number;
  search?: string;
  brand?: string;
  scale?: string;
}

/**
 * ==============================================================================
 * 1. PRODUTOS & CATÁLOGO
 * ==============================================================================
 */
export async function getLiveProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  const {
    onlyPublished = false,
    status,
    isPreOrder,
    limit,
    search,
    brand,
    scale,
  } = options;

  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from('products').select('*');

      if (onlyPublished) {
        query = query.not('status', 'in', '(RASCUNHO,AGUARDANDO_APROVACAO,ENCERRADO)');
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (isPreOrder !== undefined) {
        query = query.eq('is_pre_order', isPreOrder);
      }

      if (brand) {
        query = query.ilike('brand', brand);
      }

      if (scale) {
        query = query.eq('scale', scale);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(
          `title.ilike.%${q}%,vehicle_model.ilike.%${q}%,sku.ilike.%${q}%,brand.ilike.%${q}%,mgt_code.ilike.%${q}%`
        );
      }

      query = query.order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseProductToProduct);
      }
    } catch (err) {
      console.warn('Erro ao consultar Supabase, usando banco local:', err);
    }
  }

  // Fallback local
  const db = getDatabase();
  let list = [...db.products];

  if (onlyPublished) {
    list = list.filter(
      (p) => p.status !== 'RASCUNHO' && p.status !== 'AGUARDANDO_APROVACAO' && p.status !== 'ENCERRADO'
    );
  }

  if (status) {
    list = list.filter((p) => p.status === status);
  }

  if (isPreOrder !== undefined) {
    list = list.filter((p) => p.isPreOrder === isPreOrder);
  }

  if (brand) {
    list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (scale) {
    list = list.filter((p) => p.scale === scale);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.vehicleModel.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.mgtCode && p.mgtCode.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  if (limit) {
    list = list.slice(0, limit);
  }

  return list;
}

export async function getLiveHeroProduct(allProducts?: Product[]): Promise<Product | null> {
  const products = allProducts || (await getLiveProducts({ onlyPublished: true }));

  if (!products || products.length === 0) {
    return null;
  }

  // 1. Tenta encontrar no Supabase quem tem technical_specs->isHeroMain = true
  if (isSupabaseConfigured()) {
    try {
      const { data: heroRows } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('technical_specs->>isHeroMain', 'true')
        .limit(1);

      if (heroRows && heroRows.length > 0) {
        const found = mapSupabaseProductToProduct(heroRows[0]);
        if (found.status !== 'RASCUNHO' && found.status !== 'ENCERRADO') {
          return found;
        }
      }
    } catch (e) {
      console.warn('Erro ao buscar Hero do Supabase:', e);
    }
  }

  // 2. Tenta encontrar pelo heroProductId configurado no settings
  const db = getDatabase();
  const heroId = db.settings?.heroProductId;
  if (heroId) {
    const foundById = products.find((p) => p.id === heroId || p.sku === heroId);
    if (foundById && foundById.status !== 'RASCUNHO') {
      return foundById;
    }
  }

  // 3. Fallback inteligente
  const heroFallback =
    products.find((p) => (p.technicalSpecs as any)?.isHeroMain) ||
    products.find((p) => p.isFeatured && p.isPreOrder && p.status === 'PRE_VENDA') ||
    products.find((p) => p.isFeatured && p.status !== 'RASCUNHO') ||
    products.find((p) => p.isPreOrder && p.status === 'PRE_VENDA') ||
    products[0];

  return heroFallback || null;
}

export async function setLiveHeroProduct(productId: string): Promise<boolean> {
  const db = getDatabase();
  if (!db.settings) {
    db.settings = {
      storeName: 'RL Diecast',
      contactEmail: 'contato@rldiecast.com.br',
      contactPhone: '(11) 98765-4321',
      whatsappNumber: '5511987654321',
      instagramUrl: 'https://instagram.com/rldiecast',
      pixDiscountPercent: 5,
      freeShippingThreshold: 299,
      topBannerText: '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS',
      topBannerActive: true,
    };
  }
  db.settings.heroProductId = productId;
  saveDatabase(db);

  if (isSupabaseConfigured()) {
    try {
      const { data: currentHeroes } = await supabaseAdmin
        .from('products')
        .select('id, technical_specs')
        .eq('technical_specs->>isHeroMain', 'true');

      if (currentHeroes && currentHeroes.length > 0) {
        for (const item of currentHeroes) {
          if (item.id !== productId) {
            await supabaseAdmin
              .from('products')
              .update({
                technical_specs: { ...(item.technical_specs || {}), isHeroMain: false },
              })
              .eq('id', item.id);
          }
        }
      }

      const { data: targetRows } = await supabaseAdmin
        .from('products')
        .select('id, technical_specs')
        .or(`id.eq.${productId},sku.eq.${productId}`)
        .limit(1);

      if (targetRows && targetRows.length > 0) {
        const target = targetRows[0];
        await supabaseAdmin
          .from('products')
          .update({
            is_featured: true,
            technical_specs: { ...(target.technical_specs || {}), isHeroMain: true },
          })
          .eq('id', target.id);
      }
      return true;
    } catch (e) {
      console.error('Erro ao atualizar Hero no Supabase:', e);
    }
  }

  return true;
}

/**
 * ==============================================================================
 * 2. BANNERS & CARROSSEL DA PÁGINA INICIAL
 * ==============================================================================
 */
export async function getLiveBanners(onlyActive: boolean = true): Promise<Banner[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from('banners').select('*');
      if (onlyActive) {
        query = query.eq('active', true);
      }
      query = query.order('display_order', { ascending: true });

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const now = new Date();
        const mapped = data.map(mapSupabaseBannerToBanner);
        if (onlyActive) {
          return mapped.filter((b) => {
            if (b.startsAt && new Date(b.startsAt) > now) return false;
            if (b.endsAt && new Date(b.endsAt) < now) return false;
            return true;
          });
        }
        return mapped;
      }
    } catch (e) {
      console.warn('Erro ao consultar banners no Supabase:', e);
    }
  }

  const db = getDatabase();
  let list = db.banners || [];
  if (onlyActive) {
    const now = new Date();
    list = list.filter((b) => {
      if (!b.active) return false;
      if (b.startsAt && new Date(b.startsAt) > now) return false;
      if (b.endsAt && new Date(b.endsAt) < now) return false;
      return true;
    });
  }
  return list.sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));
}

export async function saveLiveBanner(bannerData: Partial<Banner>): Promise<Banner> {
  const db = getDatabase();
  const id = bannerData.id || `banner-${Date.now()}`;
  const banner: Banner = {
    id,
    title: bannerData.title || 'Novo Banner RL Diecast',
    subtitle: bannerData.subtitle,
    description: bannerData.description,
    tag: bannerData.tag,
    desktopImageUrl:
      bannerData.desktopImageUrl ||
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
    desktopStoragePath: bannerData.desktopStoragePath,
    mobileImageUrl: bannerData.mobileImageUrl,
    mobileStoragePath: bannerData.mobileStoragePath,
    buttonText: bannerData.buttonText || 'Ver Catálogo',
    buttonUrl: bannerData.buttonUrl || '/catalogo',
    buttonActive: bannerData.buttonActive ?? true,
    secondaryButtonText: bannerData.secondaryButtonText || 'Ver Pronta-Entrega',
    secondaryButtonUrl: bannerData.secondaryButtonUrl || '/pronta-entrega',
    secondaryButtonActive: bannerData.secondaryButtonActive ?? true,
    displayOrder: bannerData.displayOrder !== undefined ? Number(bannerData.displayOrder) : (db.banners?.length || 0) + 1,
    active: bannerData.active ?? true,
    startsAt: bannerData.startsAt,
    endsAt: bannerData.endsAt,
    targetType: bannerData.targetType || 'URL',
    targetId: bannerData.targetId,
    createdAt: bannerData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Salva no Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('banners').upsert({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle || null,
        description: banner.description || null,
        tag: banner.tag || null,
        desktop_image_url: banner.desktopImageUrl,
        desktop_storage_path: banner.desktopStoragePath || null,
        mobile_image_url: banner.mobileImageUrl || null,
        mobile_storage_path: banner.mobileStoragePath || null,
        button_text: banner.buttonText || null,
        button_url: banner.buttonUrl || null,
        button_active: banner.buttonActive,
        secondary_button_text: banner.secondaryButtonText || null,
        secondary_button_url: banner.secondaryButtonUrl || null,
        secondary_button_active: banner.secondaryButtonActive,
        display_order: banner.displayOrder,
        active: banner.active,
        starts_at: banner.startsAt || null,
        ends_at: banner.endsAt || null,
        target_type: banner.targetType,
        target_id: banner.targetId || null,
        updated_at: banner.updatedAt,
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Erro ao salvar banner no Supabase:', e);
    }
  }

  // Salva no banco local
  if (!db.banners) db.banners = [];
  const idx = db.banners.findIndex((b) => b.id === banner.id);
  if (idx >= 0) {
    db.banners[idx] = banner;
  } else {
    db.banners.push(banner);
  }
  saveDatabase(db);

  return banner;
}

export async function deleteLiveBanner(id: string): Promise<boolean> {
  const db = getDatabase();
  db.banners = (db.banners || []).filter((b) => b.id !== id);
  saveDatabase(db);

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('banners').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao excluir banner no Supabase:', e);
    }
  }

  return true;
}

/**
 * ==============================================================================
 * 3. SEÇÕES DA HOME (CMS DA PÁGINA INICIAL)
 * ==============================================================================
 */
export async function getLiveHomeSections(): Promise<HomeSection[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('home_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseHomeSectionToHomeSection);
      }
    } catch (e) {
      console.warn('Erro ao buscar seções da home no Supabase:', e);
    }
  }

  const db = getDatabase();
  return (db.homeSections || []).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveLiveHomeSections(sections: HomeSection[]): Promise<boolean> {
  const db = getDatabase();
  db.homeSections = sections;
  saveDatabase(db);

  if (isSupabaseConfigured()) {
    try {
      for (const sec of sections) {
        await supabaseAdmin.from('home_sections').upsert({
          id: sec.id,
          section_key: sec.sectionKey,
          title: sec.title,
          subtitle: sec.subtitle || null,
          display_order: sec.displayOrder,
          active: sec.active,
          settings: sec.settings || {},
          updated_at: new Date().toISOString(),
        }, { onConflict: 'section_key' });
      }
    } catch (e) {
      console.warn('Erro ao atualizar seções da home no Supabase:', e);
    }
  }

  return true;
}

/**
 * ==============================================================================
 * 4. CATEGORIAS DE COLECIONÁVEIS
 * ==============================================================================
 */
export async function getLiveCategories(onlyActive: boolean = true): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from('categories').select('*');
      if (onlyActive) {
        query = query.eq('active', true);
      }
      query = query.order('display_order', { ascending: true });

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseCategoryToCategory);
      }
    } catch (e) {
      console.warn('Erro ao consultar categorias no Supabase:', e);
    }
  }

  const db = getDatabase();
  let list = db.categories || [];
  if (onlyActive) {
    list = list.filter((c) => c.active);
  }
  return list.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveLiveCategory(categoryData: Partial<Category>): Promise<Category> {
  const db = getDatabase();
  const id = categoryData.id || `cat-${Date.now()}`;
  const slug =
    categoryData.slug ||
    (categoryData.name || 'categoria')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const category: Category = {
    id,
    name: categoryData.name || 'Nova Categoria',
    slug,
    description: categoryData.description,
    imageUrl: categoryData.imageUrl,
    displayOrder: categoryData.displayOrder !== undefined ? Number(categoryData.displayOrder) : (db.categories?.length || 0) + 1,
    active: categoryData.active ?? true,
    createdAt: categoryData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('categories').upsert({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || null,
        image_url: category.imageUrl || null,
        display_order: category.displayOrder,
        active: category.active,
        updated_at: category.updatedAt,
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Erro ao salvar categoria no Supabase:', e);
    }
  }

  if (!db.categories) db.categories = [];
  const idx = db.categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    db.categories[idx] = category;
  } else {
    db.categories.push(category);
  }
  saveDatabase(db);

  return category;
}

export async function deleteLiveCategory(id: string): Promise<boolean> {
  const db = getDatabase();
  db.categories = (db.categories || []).filter((c) => c.id !== id);
  saveDatabase(db);

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('categories').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao excluir categoria no Supabase:', e);
    }
  }

  return true;
}

/**
 * ==============================================================================
 * 5. LOTES DE PRÉ-VENDA (RELACIONAMENTO PRODUTO -> PRÉ-VENDA -> LOTES)
 * ==============================================================================
 */
export async function getLiveLots(productId?: string): Promise<ProductLot[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from('product_lots').select('*');
      if (productId) {
        query = query.eq('product_id', productId);
      }
      query = query.order('lot_number', { ascending: true });

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseLotToLot);
      }
    } catch (e) {
      console.warn('Erro ao consultar lotes no Supabase:', e);
    }
  }

  const db = getDatabase();
  let list = db.lots || [];
  if (productId) {
    list = list.filter((l) => l.productId === productId);
  }
  return list.sort((a, b) => a.lotNumber - b.lotNumber);
}

export async function saveLiveLot(lotData: Partial<ProductLot>): Promise<ProductLot> {
  const db = getDatabase();
  const id = lotData.id || `lot-${Date.now()}`;
  const lot: ProductLot = {
    id,
    productId: lotData.productId || '',
    lotNumber: lotData.lotNumber !== undefined ? Number(lotData.lotNumber) : 1,
    lotName: lotData.lotName || 'Lote 01 Oficial',
    arrivalForecast: lotData.arrivalForecast,
    stockTotal: Number(lotData.stockTotal || 24),
    stockReserved: Number(lotData.stockReserved || 0),
    downPaymentValue: Number(lotData.downPaymentValue || 15.0),
    balanceValue: Number(lotData.balanceValue || 94.9),
    totalPrice: Number(lotData.totalPrice || 109.9),
    status: lotData.status || 'ABERTO',
    active: lotData.active ?? true,
    createdAt: lotData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('product_lots').upsert({
        id: lot.id,
        product_id: lot.productId,
        lot_number: lot.lotNumber,
        lot_name: lot.lotName,
        arrival_forecast: lot.arrivalForecast || null,
        stock_total: lot.stockTotal,
        stock_reserved: lot.stockReserved,
        down_payment_value: lot.downPaymentValue,
        balance_value: lot.balanceValue,
        total_price: lot.totalPrice,
        status: lot.status,
        active: lot.active,
        updated_at: lot.updatedAt,
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Erro ao salvar lote no Supabase:', e);
    }
  }

  if (!db.lots) db.lots = [];
  const idx = db.lots.findIndex((l) => l.id === lot.id);
  if (idx >= 0) {
    db.lots[idx] = lot;
  } else {
    db.lots.push(lot);
  }
  saveDatabase(db);

  return lot;
}

export async function deleteLiveLot(id: string): Promise<boolean> {
  const db = getDatabase();
  db.lots = (db.lots || []).filter((l) => l.id !== id);
  saveDatabase(db);

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('product_lots').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao excluir lote no Supabase:', e);
    }
  }

  return true;
}

/**
 * ==============================================================================
 * 6. CONFIGURAÇÕES GERAIS DO SITE (SITE SETTINGS)
 * ==============================================================================
 */
export async function getLiveSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .select('*')
        .eq('id', 'current')
        .limit(1);

      if (!error && data && data.length > 0) {
        const s = data[0];
        return {
          storeName: s.store_name || 'RL Diecast',
          logoUrl: s.logo_url || undefined,
          faviconUrl: s.favicon_url || undefined,
          contactEmail: s.contact_email || 'contato@rldiecast.com.br',
          contactPhone: s.contact_phone || '(11) 98765-4321',
          whatsappNumber: s.whatsapp_number || '5511987654321',
          instagramUrl: s.instagram_url || 'https://instagram.com/rldiecast',
          pixDiscountPercent: Number(s.pix_discount_percent ?? 5),
          freeShippingThreshold: Number(s.free_shipping_threshold ?? 299),
          topBannerText: s.top_banner_text || '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS',
          topBannerActive: Boolean(s.top_banner_active ?? true),
          topBannerLink: s.top_banner_link || '/pre-vendas',
          heroProductId: s.hero_product_id || undefined,
          featuredProductIds: s.featured_product_ids || [],
          featuredPreOrderIds: s.featured_pre_order_ids || [],
        };
      }
    } catch (e) {
      console.warn('Erro ao buscar site_settings no Supabase:', e);
    }
  }

  const db = getDatabase();
  return (
    db.settings || {
      storeName: 'RL Diecast',
      contactEmail: 'contato@rldiecast.com.br',
      contactPhone: '(11) 98765-4321',
      whatsappNumber: '5511987654321',
      instagramUrl: 'https://instagram.com/rldiecast',
      pixDiscountPercent: 5,
      freeShippingThreshold: 299,
      topBannerText: '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS',
      topBannerActive: true,
      topBannerLink: '/pre-vendas',
    }
  );
}

export async function saveLiveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getLiveSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
  };

  const db = getDatabase();
  db.settings = updated;
  saveDatabase(db);

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('site_settings').upsert({
        id: 'current',
        store_name: updated.storeName,
        logo_url: updated.logoUrl || null,
        favicon_url: updated.faviconUrl || null,
        contact_email: updated.contactEmail,
        contact_phone: updated.contactPhone,
        whatsapp_number: updated.whatsappNumber,
        instagram_url: updated.instagramUrl,
        pix_discount_percent: updated.pixDiscountPercent,
        free_shipping_threshold: updated.freeShippingThreshold,
        top_banner_text: updated.topBannerText,
        top_banner_active: updated.topBannerActive,
        top_banner_link: updated.topBannerLink || null,
        hero_product_id: updated.heroProductId || null,
        featured_product_ids: updated.featuredProductIds || [],
        featured_pre_order_ids: updated.featuredPreOrderIds || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Erro ao salvar site_settings no Supabase:', e);
    }
  }

  return updated;
}
