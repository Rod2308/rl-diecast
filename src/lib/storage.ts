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
  Banner,
  HomeSection,
  Category,
  ProductLot,
  SiteSettings,
  Customer,
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
  settings: SiteSettings;
  banners: Banner[];
  homeSections: HomeSection[];
  categories: Category[];
  lots: ProductLot[];
  customers?: (Customer & { passwordHash?: string })[];
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
      whatsappNumber: '5511987654321',
      instagramUrl: 'https://instagram.com/rldiecast',
      pixDiscountPercent: 5,
      freeShippingThreshold: 299.0,
      topBannerText: '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS • GARANTA COM ENTRADA A PARTIR DE R$ 15,00',
      topBannerActive: true,
      topBannerLink: '/pre-vendas',
    },
    banners: getInitialBanners(),
    homeSections: getInitialHomeSections(),
    categories: getInitialCategories(),
    lots: getInitialLots(products),
  };
}

export function getInitialBanners(): Banner[] {
  return [
    {
      id: 'banner-hero-1',
      title: 'A Garagem Mais Desejada em Escala 1:64',
      subtitle: 'Lotes Oficiais Mini GT Brasil Disponíveis',
      description: 'Garanta réplicas de precisão das maiores lendas automotivas. Pré-vendas com reserva facilitada a partir de R$ 15,00 e quitação apenas quando o produto chegar ao Brasil.',
      tag: 'LOTES OFICIAIS MINI GT BRASIL DISPONÍVEIS',
      desktopImageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
      mobileImageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      buttonText: 'Explorar Pré-Vendas Oficiais',
      buttonUrl: '/pre-vendas',
      buttonActive: true,
      secondaryButtonText: 'Ver Pronta-Entrega',
      secondaryButtonUrl: '/pronta-entrega',
      secondaryButtonActive: true,
      displayOrder: 1,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'banner-hero-2',
      title: 'Kaido House Pro Street Series',
      subtitle: 'Datsun 510, NSX e Skyline R34 Custom',
      description: 'Edições de altíssimo detalhamento com capô funcional, motores cromados e pinturas personalizadas projetadas por Jun Imai.',
      tag: 'EDIÇÕES ESPECIAIS COLECIONADOR',
      desktopImageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80',
      mobileImageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
      buttonText: 'Ver Linha Kaido House',
      buttonUrl: '/catalogo?marca=Kaido+House',
      buttonActive: true,
      secondaryButtonText: 'Ver Catálogo Geral',
      secondaryButtonUrl: '/catalogo',
      secondaryButtonActive: true,
      displayOrder: 2,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getInitialHomeSections(): HomeSection[] {
  return [
    {
      id: 'sec-hero',
      sectionKey: 'hero',
      title: 'Showroom Principal',
      subtitle: 'Banner e Destaque da Home',
      displayOrder: 1,
      active: true,
    },
    {
      id: 'sec-categories',
      sectionKey: 'categories',
      title: 'Marcas Especializadas',
      subtitle: 'Explore os catálogos dos maiores fabricantes mundiais',
      displayOrder: 2,
      active: true,
    },
    {
      id: 'sec-presales',
      sectionKey: 'presales',
      title: 'Pré-Vendas Abertas',
      subtitle: 'Garanta seu modelo no lote oficial pagando apenas a entrada',
      displayOrder: 3,
      active: true,
    },
    {
      id: 'sec-how-it-works',
      sectionKey: 'how_it_works',
      title: 'Como Funciona a Pré-Venda na RL Diecast?',
      subtitle: 'Sistema seguro e planejado para o colecionador nunca perder um lote raro',
      displayOrder: 4,
      active: true,
    },
    {
      id: 'sec-ready-to-ship',
      sectionKey: 'ready_to_ship',
      title: 'Pronta-Entrega Colecionáveis 1:64',
      subtitle: 'Modelos em estoque físico com despacho em até 24 horas úteis',
      displayOrder: 5,
      active: true,
    },
    {
      id: 'sec-featured',
      sectionKey: 'featured_products',
      title: 'Miniaturas em Destaque',
      subtitle: 'Seleção especial dos modelos mais cobiçados pelos colecionadores',
      displayOrder: 6,
      active: true,
    },
    {
      id: 'sec-garage',
      sectionKey: 'garage_cta',
      title: 'Minha Garagem',
      subtitle: 'Organize sua coleção 1:64 em um só lugar',
      displayOrder: 7,
      active: true,
    },
  ];
}

export function getInitialCategories(): Category[] {
  return [
    { id: 'cat-1', name: 'Mini GT', slug: 'mini-gt', displayOrder: 1, active: true },
    { id: 'cat-2', name: 'Kaido House', slug: 'kaido-house', displayOrder: 2, active: true },
    { id: 'cat-3', name: 'Tarmac Works', slug: 'tarmac-works', displayOrder: 3, active: true },
    { id: 'cat-4', name: 'BBR Models', slug: 'bbr-models', displayOrder: 4, active: true },
    { id: 'cat-5', name: 'Pop Race', slug: 'pop-race', displayOrder: 5, active: true },
    { id: 'cat-6', name: 'Inno64', slug: 'inno64', displayOrder: 6, active: true },
    { id: 'cat-7', name: 'Hot Wheels', slug: 'hot-wheels', displayOrder: 7, active: true },
    { id: 'cat-8', name: 'Dioramas', slug: 'dioramas', displayOrder: 8, active: true },
    { id: 'cat-9', name: 'Acessórios & Expositores', slug: 'acessorios', displayOrder: 9, active: true },
  ];
}

export function getInitialLots(products: Product[]): ProductLot[] {
  return products
    .filter((p) => p.isPreOrder)
    .map((p) => ({
      id: `lot-${p.id}-1`,
      productId: p.id,
      lotNumber: 1,
      lotName: 'Lote 01 Oficial',
      arrivalForecast: p.arrivalForecast || '2026',
      stockTotal: p.stock || 24,
      stockReserved: 0,
      downPaymentValue: p.downPaymentValue || 15.0,
      balanceValue: p.balanceValue || Math.max(0, p.salePrice - p.downPaymentValue),
      totalPrice: p.salePrice,
      status: 'ABERTO' as const,
      active: true,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
}

let inMemoryDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      inMemoryDb = JSON.parse(fileData);
      if (inMemoryDb) {
        if (!inMemoryDb.banners || inMemoryDb.banners.length === 0) inMemoryDb.banners = getInitialBanners();
        if (!inMemoryDb.homeSections || inMemoryDb.homeSections.length === 0) inMemoryDb.homeSections = getInitialHomeSections();
        if (!inMemoryDb.categories || inMemoryDb.categories.length === 0) inMemoryDb.categories = getInitialCategories();
        if (!inMemoryDb.lots || inMemoryDb.lots.length === 0) inMemoryDb.lots = getInitialLots(inMemoryDb.products || []);
        return inMemoryDb;
      }
    }
  } catch (err) {
    console.error('Erro ao ler DB persistente:', err);
  }

  if (inMemoryDb) {
    if (!inMemoryDb.banners) inMemoryDb.banners = getInitialBanners();
    if (!inMemoryDb.homeSections) inMemoryDb.homeSections = getInitialHomeSections();
    if (!inMemoryDb.categories) inMemoryDb.categories = getInitialCategories();
    if (!inMemoryDb.lots) inMemoryDb.lots = getInitialLots(inMemoryDb.products || []);
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

export function mapSupabaseBannerToBanner(row: any): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || undefined,
    description: row.description || undefined,
    tag: row.tag || undefined,
    desktopImageUrl: row.desktop_image_url,
    desktopStoragePath: row.desktop_storage_path || undefined,
    mobileImageUrl: row.mobile_image_url || undefined,
    mobileStoragePath: row.mobile_storage_path || undefined,
    buttonText: row.button_text || undefined,
    buttonUrl: row.button_url || undefined,
    buttonActive: row.button_active ?? true,
    secondaryButtonText: row.secondary_button_text || undefined,
    secondaryButtonUrl: row.secondary_button_url || undefined,
    secondaryButtonActive: row.secondary_button_active ?? true,
    displayOrder: Number(row.display_order || 1),
    active: Boolean(row.active),
    startsAt: row.starts_at || undefined,
    endsAt: row.ends_at || undefined,
    targetType: row.target_type || 'URL',
    targetId: row.target_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSupabaseHomeSectionToHomeSection(row: any): HomeSection {
  return {
    id: row.id,
    sectionKey: row.section_key,
    title: row.title,
    subtitle: row.subtitle || undefined,
    displayOrder: Number(row.display_order || 1),
    active: Boolean(row.active),
    settings: row.settings || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSupabaseCategoryToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    imageUrl: row.image_url || undefined,
    displayOrder: Number(row.display_order || 1),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSupabaseLotToLot(row: any): ProductLot {
  return {
    id: row.id,
    productId: row.product_id,
    lotNumber: Number(row.lot_number || 1),
    lotName: row.lot_name,
    arrivalForecast: row.arrival_forecast || undefined,
    stockTotal: Number(row.stock_total || 0),
    stockReserved: Number(row.stock_reserved || 0),
    downPaymentValue: Number(row.down_payment_value || 0),
    balanceValue: Number(row.balance_value || 0),
    totalPrice: Number(row.total_price || 0),
    status: row.status,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
