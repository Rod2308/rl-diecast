import { Product, SyncLog, ProductStatus } from './types';
import { getDatabase, saveDatabase } from './storage';
import { calculatePricing } from './pricing';
import { generateStandardTitle, generateStandardDescription } from './ads-generator';

export interface RawSupplierItem {
  sku: string;
  mgtCode?: string;
  brand: string;
  scale?: string;
  vehicleModel: string;
  colorOrEdition?: string;
  costPrice: number;
  isPreOrder?: boolean;
  arrivalForecast?: string;
  stock?: number;
  imageUrl?: string;
  packagingType?: string;
  material?: string;
  sourceUrl?: string;
}

export interface SyncResult {
  log: SyncLog;
  processedItems: Product[];
}

export function syncSupplierProducts(
  rawItems: RawSupplierItem[],
  source: 'MINI_GT_BRASIL_API' | 'FEED_URL' | 'CSV_UPLOAD' | 'MANUAL',
  mode: 'AUTO' | 'MANUAL' | 'CRON_15M' | 'CRON_1H' | 'CRON_DAILY' | 'WEBHOOK' = 'MANUAL'
): SyncResult {
  const db = getDatabase();
  const config = db.supplierConfig;
  const pricingRules = db.pricingRules;

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const changes: SyncLog['changes'] = [];
  const processedProducts: Product[] = [];

  for (const item of rawItems) {
    if (!item.sku || !item.vehicleModel) {
      skippedCount++;
      continue;
    }

    const brand = item.brand || 'Mini GT';
    const scale = item.scale || '1:64';
    const isPreOrder = item.isPreOrder ?? true;
    const costPrice = Number(item.costPrice) || 50;

    // Calcular preço de venda e entrada com base nas regras configuradas para a marca
    const pricing = calculatePricing(costPrice, brand, pricingRules[brand] || pricingRules.DEFAULT);

    // Gerar título e descrição técnica padronizados
    const title = generateStandardTitle({
      brand,
      scale,
      vehicleModel: item.vehicleModel,
      colorOrEdition: item.colorOrEdition,
      code: item.mgtCode || item.sku,
      isPreOrder,
    });

    const description = generateStandardDescription({
      brand,
      scale,
      vehicleModel: item.vehicleModel,
      colorOrEdition: item.colorOrEdition,
      code: item.mgtCode || item.sku,
      isPreOrder,
      material: item.material,
      packagingType: item.packagingType,
      arrivalForecast: item.arrivalForecast,
      salePrice: pricing.salePrice,
      downPaymentValue: pricing.downPaymentValue,
      balanceValue: pricing.balanceValue,
      stockLimit: item.stock || 24,
    });

    // Buscar se já existe por SKU, mgtCode ou Marca + Modelo
    const existingIndex = db.products.findIndex(
      (p) =>
        p.sku.toLowerCase() === item.sku.toLowerCase() ||
        (item.mgtCode && p.mgtCode && p.mgtCode.toLowerCase() === item.mgtCode.toLowerCase())
    );

    if (existingIndex >= 0) {
      // PRODUTO JÁ EXISTE: ATUALIZAR DADOS E DETECTAR DIFERENÇAS
      const existing = db.products[existingIndex];
      let hasChanges = false;

      if (existing.costPrice !== pricing.costPrice) {
        changes.push({
          sku: item.sku,
          field: 'costPrice',
          oldValue: existing.costPrice,
          newValue: pricing.costPrice,
        });
        existing.costPrice = pricing.costPrice;
        existing.salePrice = pricing.salePrice;
        existing.downPaymentValue = pricing.downPaymentValue;
        existing.balanceValue = pricing.balanceValue;
        hasChanges = true;
      }

      if (item.arrivalForecast && existing.arrivalForecast !== item.arrivalForecast) {
        changes.push({
          sku: item.sku,
          field: 'arrivalForecast',
          oldValue: existing.arrivalForecast,
          newValue: item.arrivalForecast,
        });
        existing.arrivalForecast = item.arrivalForecast;
        hasChanges = true;
      }

      if (item.stock !== undefined && existing.stock !== item.stock) {
        changes.push({
          sku: item.sku,
          field: 'stock',
          oldValue: existing.stock,
          newValue: item.stock,
        });
        existing.stock = item.stock;
        if (existing.stock <= 0 && existing.status !== 'ESGOTADO') {
          existing.status = 'ESGOTADO';
        }
        hasChanges = true;
      }

      existing.lastSyncedAt = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();

      if (hasChanges) {
        updatedCount++;
      } else {
        skippedCount++;
      }
      processedProducts.push(existing);
    } else {
      // NOVO PRODUTO: DEFINIR STATUS CONFORME POLÍTICA DE PUBLICAÇÃO DO ADMIN
      let status: ProductStatus = 'PRE_VENDA';
      if (!isPreOrder) status = 'PRONTA_ENTREGA';

      if (config.publishMode === 'REQUIRE_APPROVAL') {
        status = 'AGUARDANDO_APROVACAO';
      } else if (config.publishMode === 'DRAFT_ONLY') {
        status = 'RASCUNHO';
      }

      const slug = `${brand}-${item.vehicleModel}-${item.sku}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const images = item.imageUrl
        ? [
            {
              id: `img-sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url: item.imageUrl,
              isMain: true,
              order: 0,
            },
          ]
        : [
            {
              id: `img-default-${Date.now()}`,
              url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
              isMain: true,
              order: 0,
            },
          ];

      const newProduct: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sku: item.sku,
        mgtCode: item.mgtCode || item.sku,
        title,
        slug,
        brand,
        scale,
        vehicleModel: item.vehicleModel,
        colorOrEdition: item.colorOrEdition || '',
        material: item.material || 'Diecast metal c/ pneus de borracha',
        packagingType: item.packagingType || 'Caixa de colecionador lacrada',
        description,
        costPrice: pricing.costPrice,
        salePrice: pricing.salePrice,
        isPreOrder,
        downPaymentValue: pricing.downPaymentValue,
        balanceValue: pricing.balanceValue,
        arrivalForecast: item.arrivalForecast || 'Previsão do lote oficial',
        stock: item.stock || 24,
        status,
        images,
        isFeatured: false,
        isNewRelease: isPreOrder,
        sourceSupplier: 'MINI_GT_BRASIL',
        sourceUrl: item.sourceUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      };

      db.products.unshift(newProduct);
      addedCount++;
      processedProducts.push(newProduct);

      // Adicionar notificação para o administrador
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: config.publishMode === 'REQUIRE_APPROVAL' ? 'Novo Produto Aguardando Aprovação' : 'Novo Lançamento Publicado',
        message: `${newProduct.title} foi importado com sucesso via sincronização.`,
        type: 'NEW_RELEASE',
        link: '/admin/produtos',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Registrar Log de Sincronização
  const syncLog: SyncLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source,
    mode,
    status: 'SUCCESS',
    itemsProcessed: rawItems.length,
    itemsAdded: addedCount,
    itemsUpdated: updatedCount,
    itemsSkipped: skippedCount,
    changes,
  };

  db.syncLogs.unshift(syncLog);
  db.supplierConfig.lastSuccessfulSync = new Date().toISOString();

  saveDatabase(db);

  return {
    log: syncLog,
    processedItems: processedProducts,
  };
}

/**
 * Consulta a API ao vivo do Mini GT Brasil (https://www.minigtbrasil.com.br/api/products)
 */
export async function fetchLiveMiniGtBrasilCatalog(): Promise<RawSupplierItem[]> {
  try {
    const res = await fetch('https://www.minigtbrasil.com.br/api/products', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn('API Mini GT Brasil retornou status:', res.status);
      return getSampleMiniGtBrasilCatalog();
    }
    const liveProds = await res.json();
    if (!Array.isArray(liveProds) || liveProds.length === 0) {
      return getSampleMiniGtBrasilCatalog();
    }

    const filtered = liveProds
      .filter((p: any) => {
        const brand = (p.brand || '').trim();
        const hasImg = p.imageUrl || (p.images && p.images.length > 0);
        return (
          hasImg &&
          (brand === 'MINI GT' ||
            brand === 'Mini GT' ||
            brand === 'Kaido House' ||
            brand === 'Tarmac Works' ||
            brand === 'BBR Models' ||
            brand === 'Pop Race')
        );
      })
      .slice(0, 100);

    return filtered.map((item: any) => {
      const brand = item.brand === 'MINI GT' ? 'Mini GT' : item.brand;
      const sku = item.sku || `MGT-${item.id.slice(-6)}`;
      const mgtCode = sku.split('-')[0];

      let costPrice = 60.0;
      if (brand === 'Kaido House') costPrice = 98.0;
      if (brand === 'Tarmac Works') costPrice = 82.0;
      if (brand === 'BBR Models') costPrice = 140.0;

      let arrivalForecast = 'Sob consulta';
      if (item.arrivalForecast) {
        const d = new Date(item.arrivalForecast);
        const months = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        arrivalForecast = `${months[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
      }

      let imageUrl = item.imageUrl || item.images?.[0]?.url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://minigtbrasil.com.br${imageUrl}`;
      }

      const cleanName = item.name ? item.name.replace(/1\/64/g, '').trim() : item.model || sku;

      return {
        sku,
        mgtCode,
        brand,
        scale: item.scale || '1:64',
        vehicleModel: item.model || cleanName,
        colorOrEdition: item.manufacturer || '',
        costPrice,
        isPreOrder: !item.readyStock,
        arrivalForecast,
        stock: item.readyStock ? 12 : 36,
        imageUrl,
        packagingType: item.packSize ? 'Caixa de colecionador lacrada' : 'Lacrado',
        material: 'Diecast metal c/ pneus de borracha',
        sourceUrl: `https://www.minigtbrasil.com.br/product/${item.id}`,
      };
    });
  } catch (err) {
    console.error('Falha ao consultar API ao vivo do Mini GT Brasil:', err);
    return getSampleMiniGtBrasilCatalog();
  }
}

/**
 * Catálogo de exemplo oficial do Mini GT Brasil para simulação de sincronização automática / API
 */
export function getSampleMiniGtBrasilCatalog(): RawSupplierItem[] {
  return [
    {
      sku: 'MGT01399',
      mgtCode: 'MGT01399',
      brand: 'Mini GT',
      scale: '1:64',
      vehicleModel: 'Lamborghini Revuelto',
      colorOrEdition: 'Arancio Apodis (Laranja Metálico)',
      material: 'Diecast metal c/ detalhes de fibra de carbono',
      packagingType: 'Caixa de colecionador lacrada (Box)',
      costPrice: 62.0,
      isPreOrder: true,
      arrivalForecast: 'Outubro de 2026',
      stock: 48,
      imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80',
      sourceUrl: 'https://minigtbrasil.com.br/produtos/mgt01399',
    },
    {
      sku: 'KHMG058',
      mgtCode: 'KHMG058',
      brand: 'Kaido House',
      scale: '1:64',
      vehicleModel: 'Chevrolet Silverado Pro Street',
      colorOrEdition: 'Midnight Black Custom',
      material: 'Diecast Premium c/ capô basculante e motor V8 cromado',
      packagingType: 'Caixa de luxo especial Kaido House',
      costPrice: 98.0,
      isPreOrder: true,
      arrivalForecast: 'Novembro de 2026',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
      sourceUrl: 'https://minigtbrasil.com.br/produtos/khmg058',
    },
    {
      sku: 'MGT01386', // Produto que já existe no seed - atualizará previsão ou preço
      mgtCode: 'MGT01386',
      brand: 'Mini GT',
      scale: '1:64',
      vehicleModel: 'BMW Z3',
      colorOrEdition: 'Hellrot',
      material: 'Diecast',
      packagingType: 'Caixa Box Lacrada',
      costPrice: 59.0, // Houve leve alteração de custo
      isPreOrder: true,
      arrivalForecast: 'Julho de 2026',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      sourceUrl: 'https://minigtbrasil.com.br/produtos/mgt01386',
    },
    {
      sku: 'PR640122',
      brand: 'Pop Race',
      scale: '1:64',
      vehicleModel: 'Mazda RX-7 (FD3S) RE-Amemiya',
      colorOrEdition: 'Sunlight Yellow',
      material: 'Diecast metal c/ capô removível',
      packagingType: 'Caixa de colecionador lacrada',
      costPrice: 74.0,
      isPreOrder: true,
      arrivalForecast: 'Agosto de 2026',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      sourceUrl: 'https://minigtbrasil.com.br/produtos/pr640122',
    },
  ];
}

/**
 * Utilitário para parsear CSV recebido por upload ou texto
 */
export function parseCsvCatalog(csvText: string): RawSupplierItem[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const items: RawSupplierItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });

    if (obj.sku && obj.vehicleModel) {
      items.push({
        sku: obj.sku,
        mgtCode: obj.mgtCode || obj.sku,
        brand: obj.brand || 'Mini GT',
        scale: obj.scale || '1:64',
        vehicleModel: obj.vehicleModel,
        colorOrEdition: obj.colorOrEdition || '',
        costPrice: parseFloat(obj.costPrice) || 50,
        isPreOrder: obj.isPreOrder === 'true' || obj.isPreOrder === '1' || true,
        arrivalForecast: obj.arrivalForecast || 'Previsão oficial',
        stock: parseInt(obj.stock, 10) || 24,
        imageUrl: obj.imageUrl || '',
        packagingType: obj.packagingType || 'Caixa Box Lacrada',
        material: obj.material || 'Diecast metal',
      });
    }
  }

  return items;
}
