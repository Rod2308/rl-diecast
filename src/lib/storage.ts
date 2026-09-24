import fs from 'fs';
import path from 'path';
import {
  Product,
  Order,
  PreOrderItem,
  SupplierConfig,
  SyncLog,
  GarageItem,
  NotificationItem,
  PricingRule,
} from './types';
import { DEFAULT_PRICING_RULES } from './pricing';
import { generateStandardTitle, generateStandardDescription } from './ads-generator';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'rl_diecast_db.json');

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  preOrders: PreOrderItem[];
  supplierConfig: SupplierConfig;
  syncLogs: SyncLog[];
  garage: GarageItem[];
  notifications: NotificationItem[];
  pricingRules: Record<string, PricingRule>;
  settings: {
    storeName: string;
    contactEmail: string;
    contactPhone: string;
    pixDiscountPercent: number;
    freeShippingThreshold: number;
    bannerText: string;
  };
}

function getInitialProducts(): Product[] {
  const productsData = [
    {
      sku: 'MGT01386',
      mgtCode: 'MGT01386',
      brand: 'Mini GT',
      scale: '1:64',
      vehicleModel: 'BMW Z3',
      colorOrEdition: 'Hellrot',
      material: 'Diecast (Metal com partes plásticas e pneus de borracha)',
      packagingType: 'Caixa de colecionador lacrada (Box)',
      costPrice: 58.0,
      salePrice: 109.9,
      isPreOrder: true,
      downPaymentValue: 15.0,
      balanceValue: 94.9,
      arrivalForecast: 'Julho de 2026',
      stock: 36,
      status: 'PRE_VENDA' as const,
      isFeatured: true,
      isNewRelease: true,
      sourceSupplier: 'MINI_GT_BRASIL',
      images: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
        {
          id: 'img-2',
          url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          isMain: false,
          order: 1,
        },
      ],
    },
    {
      sku: 'KHMG045',
      mgtCode: 'KHMG045',
      brand: 'Kaido House',
      scale: '1:64',
      vehicleModel: 'Datsun 510 Pro Street',
      colorOrEdition: 'OG Orange c/ Capô Aberto',
      material: 'Diecast Premium (Metal / Pneus de borracha / Motor detalhado)',
      packagingType: 'Caixa de luxo especial Kaido House',
      costPrice: 95.0,
      salePrice: 179.9,
      isPreOrder: true,
      downPaymentValue: 25.0,
      balanceValue: 154.9,
      arrivalForecast: 'Agosto de 2026',
      stock: 24,
      status: 'PRE_VENDA' as const,
      isFeatured: true,
      isNewRelease: true,
      sourceSupplier: 'MINI_GT_BRASIL',
      images: [
        {
          id: 'img-3',
          url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ],
    },
    {
      sku: 'MGT00612',
      mgtCode: 'MGT00612',
      brand: 'Mini GT',
      scale: '1:64',
      vehicleModel: 'Nissan Skyline GT-R (R34) V-Spec II',
      colorOrEdition: 'Bayside Blue',
      material: 'Diecast metal com interior esportivo',
      packagingType: 'Blister Lacrado',
      costPrice: 62.0,
      salePrice: 119.9,
      isPreOrder: false,
      downPaymentValue: 0,
      balanceValue: 0,
      arrivalForecast: undefined,
      stock: 12,
      status: 'PRONTA_ENTREGA' as const,
      isFeatured: true,
      isNewRelease: false,
      sourceSupplier: 'MINI_GT_BRASIL',
      images: [
        {
          id: 'img-4',
          url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ],
    },
    {
      sku: 'T64-045-FAL',
      brand: 'Tarmac Works',
      scale: '1:64',
      vehicleModel: 'Porsche 911 GT3 R',
      colorOrEdition: 'Falken Motorsports Nürburgring 24h',
      material: 'Diecast com pintura tampográfica de alta precisão',
      packagingType: 'Cúpula de Acrílico com Base Expositora',
      costPrice: 80.0,
      salePrice: 154.9,
      isPreOrder: false,
      downPaymentValue: 0,
      balanceValue: 0,
      arrivalForecast: undefined,
      stock: 8,
      status: 'PRONTA_ENTREGA' as const,
      isFeatured: true,
      isNewRelease: false,
      sourceSupplier: 'CSV_IMPORT',
      images: [
        {
          id: 'img-5',
          url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ],
    },
    {
      sku: 'PR640108',
      brand: 'Pop Race',
      scale: '1:64',
      vehicleModel: 'Honda Civic Type R (FL5)',
      colorOrEdition: 'Spoon Sports Livery',
      material: 'Diecast metal c/ capo removível e motor B16/K20',
      packagingType: 'Caixa de colecionador lacrada',
      costPrice: 72.0,
      salePrice: 139.9,
      isPreOrder: true,
      downPaymentValue: 20.0,
      balanceValue: 119.9,
      arrivalForecast: 'Setembro de 2026',
      stock: 18,
      status: 'PRE_VENDA' as const,
      isFeatured: false,
      isNewRelease: true,
      sourceSupplier: 'MINI_GT_BRASIL',
      images: [
        {
          id: 'img-6',
          url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ],
    },
    {
      sku: 'MGT00720',
      mgtCode: 'MGT00720',
      brand: 'Mini GT',
      scale: '1:64',
      vehicleModel: 'Pagani Zonda R',
      colorOrEdition: 'Carbon Fiber Nero',
      material: 'Diecast com textura de fibra de carbono e asa móvel',
      packagingType: 'Caixa Box Lacrada',
      costPrice: 65.0,
      salePrice: 129.9,
      isPreOrder: false,
      downPaymentValue: 0,
      balanceValue: 0,
      arrivalForecast: undefined,
      stock: 3,
      status: 'PRONTA_ENTREGA' as const,
      isFeatured: false,
      isNewRelease: false,
      sourceSupplier: 'MINI_GT_BRASIL',
      images: [
        {
          id: 'img-7',
          url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ],
    },
  ];

  return productsData.map((p, index) => {
    const title = generateStandardTitle({
      brand: p.brand,
      scale: p.scale,
      vehicleModel: p.vehicleModel,
      colorOrEdition: p.colorOrEdition,
      code: p.mgtCode || p.sku,
      isPreOrder: p.isPreOrder,
    });

    const description = generateStandardDescription({
      brand: p.brand,
      scale: p.scale,
      vehicleModel: p.vehicleModel,
      colorOrEdition: p.colorOrEdition,
      code: p.mgtCode || p.sku,
      isPreOrder: p.isPreOrder,
      material: p.material,
      packagingType: p.packagingType,
      arrivalForecast: p.arrivalForecast,
      salePrice: p.salePrice,
      downPaymentValue: p.downPaymentValue,
      balanceValue: p.balanceValue,
      stockLimit: p.stock,
    });

    const slug = `${p.brand}-${p.vehicleModel}-${p.sku}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      id: `prod-${index + 1}`,
      ...p,
      title,
      slug,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };
  });
}

function getInitialDatabase(): DatabaseSchema {
  const products = getInitialProducts();

  return {
    products,
    orders: [
      {
        id: 'ord-101',
        code: 'RL-9281',
        customerName: 'Carlos Mendonça',
        customerEmail: 'carlos.mendonca@gmail.com',
        customerCpf: '123.456.789-00',
        customerPhone: '(11) 98765-4321',
        shippingAddress: {
          street: 'Av. Paulista',
          number: '1000',
          complement: 'Apto 102',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
        },
        items: [
          {
            productId: 'prod-1',
            title: products[0].title,
            mgtCode: 'MGT01386',
            image: products[0].images[0].url,
            price: products[0].salePrice,
            quantity: 1,
            isPreOrder: true,
            payDownPaymentOnly: true,
            downPaymentValue: 15.0,
            balanceValue: 94.9,
          },
        ],
        subtotal: 109.9,
        shippingCost: 18.5,
        shippingService: 'SEDEX Express',
        discount: 0,
        total: 128.4,
        totalPaidNow: 33.5, // Entrada R$ 15 + Frete R$ 18.50
        totalBalanceLater: 94.9,
        paymentMethod: 'PIX',
        paymentStatus: 'APPROVED',
        paymentDetails: {
          pixCopiaECola:
            '00020126580014br.gov.bcb.pix0136rldiecast-pix-key520400005303986540533.505802BR5910RL Diecast6009Sao Paulo62070503***6304E8A1',
        },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    preOrders: [
      {
        id: 'pre-201',
        orderId: 'ord-101',
        productId: 'prod-1',
        productTitle: products[0].title,
        productImage: products[0].images[0].url,
        mgtCode: 'MGT01386',
        totalPrice: 109.9,
        downPaymentPaid: 15.0,
        balancePending: 94.9,
        arrivalForecast: 'Julho de 2026',
        status: 'ENTRADA_PAGA',
        paymentMode: 'DOWN_PAYMENT_ONLY',
        customerName: 'Carlos Mendonça',
        customerEmail: 'carlos.mendonca@gmail.com',
        customerPhone: '(11) 98765-4321',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    supplierConfig: {
      supplierName: 'Mini GT Brasil (Distribuidor Autorizado)',
      apiEndpoint: 'https://api.minigtbrasil.com.br/v2/catalog',
      apiKey: 'mgt_live_sec_9948271049a8f2e',
      feedUrl: 'https://minigtbrasil.com.br/feeds/preorders.json',
      syncFrequency: '1H',
      publishMode: 'REQUIRE_APPROVAL',
      lastSuccessfulSync: new Date(Date.now() - 3600000 * 3).toISOString(),
      connectionStatus: 'CONNECTED',
    },
    syncLogs: [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        source: 'MINI_GT_BRASIL_API',
        mode: 'CRON_1H',
        status: 'SUCCESS',
        itemsProcessed: 14,
        itemsAdded: 2,
        itemsUpdated: 1,
        itemsSkipped: 11,
        changes: [
          {
            sku: 'MGT01386',
            field: 'arrivalForecast',
            oldValue: 'Junho/2026',
            newValue: 'Julho/2026',
          },
        ],
      },
    ],
    garage: [
      {
        id: 'gar-1',
        productId: 'prod-3',
        status: 'TENHO',
        userNote: 'Comprado na edição especial, modelo perfeito!',
        addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'gar-2',
        productId: 'prod-1',
        status: 'QUERO_COMPRAR',
        userNote: 'BMW Hellrot Z3 clássica, aguardando pré-venda',
        addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'gar-3',
        productId: 'prod-2',
        status: 'FAVORITO',
        userNote: 'Sonho de consumo Kaido House',
        addedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        title: 'Entrada Aprovada!',
        message: 'A entrada de R$ 15,00 para a pré-venda MGT01386 (BMW Z3) foi confirmada. Sua unidade está reservada!',
        type: 'PAYMENT_CONFIRMED',
        link: '/conta',
        read: false,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'notif-2',
        title: 'Novo Lançamento Mini GT Brasil',
        message: 'Novo lote da série Kaido House adicionado ao catálogo para pré-venda.',
        type: 'NEW_RELEASE',
        link: '/catalogo?marca=Kaido+House',
        read: true,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
    pricingRules: DEFAULT_PRICING_RULES,
    settings: {
      storeName: 'RL Diecast',
      contactEmail: 'contato@rldiecast.com.br',
      contactPhone: '(11) 98765-4321',
      pixDiscountPercent: 5,
      freeShippingThreshold: 299.0,
      bannerText: '🚀 PRÉ-VENDAS 2026 ABERTAS • GARANTA SEUS MODELOS MINI GT COM ENTRADA FACILITADA',
    },
  };
}

let inMemoryDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      inMemoryDb = JSON.parse(fileData);
      return inMemoryDb!;
    }
  } catch (err) {
    console.error('Erro ao ler DB persistente:', err);
  }

  if (inMemoryDb) {
    return inMemoryDb;
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  inMemoryDb = initial;
  return inMemoryDb;
}

export function saveDatabase(data: DatabaseSchema): void {
  inMemoryDb = data;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Aviso: Operação em sistema de arquivos somente-leitura (Vercel Serverless) ou sem permissão:', err);
  }
}

/**
 * Converte um registro do Supabase (snake_case) para a interface Product (camelCase)
 */
export function mapSupabaseProductToProduct(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    mgtCode: row.mgt_code || undefined,
    title: row.title,
    slug: row.slug,
    brand: row.brand,
    scale: row.scale,
    vehicleModel: row.vehicle_model,
    colorOrEdition: row.color_or_edition || undefined,
    material: row.material,
    packagingType: row.packaging_type,
    description: row.description,
    technicalSpecs: row.technical_specs || undefined,
    costPrice: Number(row.cost_price || 0),
    salePrice: Number(row.sale_price || 0),
    isPreOrder: Boolean(row.is_pre_order),
    downPaymentValue: Number(row.down_payment_value || 0),
    balanceValue: Number(row.balance_value || 0),
    arrivalForecast: row.arrival_forecast || undefined,
    arrivalConfirmedDate: row.arrival_confirmed_date || undefined,
    stock: Number(row.stock || 0),
    status: row.status,
    images: row.images || [],
    isFeatured: Boolean(row.is_featured),
    isNewRelease: Boolean(row.is_new_release),
    sourceSupplier: row.source_supplier || undefined,
    sourceId: row.source_id || undefined,
    sourceUrl: row.source_url || undefined,
    lastSyncedAt: row.last_synced_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
