import { Product } from './types';
import { getDatabase, saveDatabase, mapSupabaseProductToProduct } from './storage';
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
 * Busca produtos em tempo real (Supabase com fallback para JSON local)
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

  // Fallback local caso Supabase não esteja disponível
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

/**
 * Retorna o produto configurado como Hero Showroom da Home
 */
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
        // Garante que não está em Rascunho
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

  // 3. Fallback inteligente: Destaque de pré-venda ou primeiro publicado
  const heroFallback =
    products.find((p) => (p.technicalSpecs as any)?.isHeroMain) ||
    products.find((p) => p.isFeatured && p.isPreOrder && p.status === 'PRE_VENDA') ||
    products.find((p) => p.isFeatured && p.status !== 'RASCUNHO') ||
    products.find((p) => p.isPreOrder && p.status === 'PRE_VENDA') ||
    products[0];

  return heroFallback || null;
}

/**
 * Define um produto como Hero Showroom no Supabase e no banco local
 */
export async function setLiveHeroProduct(productId: string): Promise<boolean> {
  const db = getDatabase();
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
  db.settings.heroProductId = productId;
  saveDatabase(db);

  if (isSupabaseConfigured()) {
    try {
      // 1. Desmarca qualquer produto que seja Hero atualmente
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

      // 2. Define o novo produto como Hero Main
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
