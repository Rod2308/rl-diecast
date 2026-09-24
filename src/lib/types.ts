export type ProductStatus =
  | 'PRONTA_ENTREGA'
  | 'PRE_VENDA'
  | 'ESGOTADO'
  | 'RASCUNHO'
  | 'AGUARDANDO_APROVACAO'
  | 'ENCERRADO';

export type PreOrderStatus =
  | 'ENTRADA_PENDENTE'
  | 'ENTRADA_PAGA'
  | 'AGUARDANDO_CHEGADA'
  | 'CHEGOU_ESTOQUE'
  | 'SALDO_PENDENTE'
  | 'QUITADO'
  | 'ENVIADO'
  | 'CANCELADO';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';

export type GarageStatus = 'TENHO' | 'QUERO_COMPRAR' | 'PROCURANDO' | 'FAVORITO';

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

export interface Product {
  id: string;
  sku: string;
  mgtCode?: string; // Código oficial Mini GT (ex: MGT01386)
  title: string;
  slug: string;
  brand: string; // Mini GT, Kaido House, Tarmac Works, Pop Race, etc.
  scale: string; // 1:64, 1:43, 1:18
  vehicleModel: string; // Ex: BMW Z3
  colorOrEdition?: string; // Ex: Hellrot, Chase Edition, Red Bull Racing
  material: string; // Diecast (Metal com partes em plástico e pneus de borracha)
  packagingType: string; // Blister, Caixa Fechada, Acrílico com Base
  description: string;
  technicalSpecs?: Record<string, string>;
  
  // Pricing
  costPrice: number;
  salePrice: number;
  isPreOrder: boolean;
  downPaymentValue: number; // Valor da entrada (ex: R$ 15,00)
  balanceValue: number; // Saldo restante (salePrice - downPaymentValue)
  
  // Pre-order timeline
  arrivalForecast?: string; // Ex: "Julho/2026"
  preOrderStartDate?: string;
  preOrderEndDate?: string;
  arrivalConfirmedDate?: string;
  
  // Inventory & Status
  stock: number;
  status: ProductStatus;
  images: ProductImage[];
  isFeatured?: boolean;
  isNewRelease?: boolean;
  
  // Origin & Supplier Link
  sourceSupplier?: string; // 'MINI_GT_BRASIL' | 'MANUAL' | 'CSV_IMPORT'
  sourceId?: string;
  sourceUrl?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingRule {
  brand: string; // 'DEFAULT' or specific brand like 'Mini GT', 'Kaido House'
  profitMarginPercent: number; // Ex: 35%
  fixedProfit: number; // Ex: R$ 10,00
  gatewayFeePercent: number; // Ex: 4.99%
  packagingCost: number; // Ex: R$ 5,00 (caixa reforçada, plástico bolha)
  safetyMargin: number; // Ex: R$ 5,00
  defaultDownPaymentPercent: number; // Ex: 15% (mínimo de entrada)
  minPrice?: number;
  maxPrice?: number;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  source: string; // 'MINI_GT_BRASIL_API' | 'FEED_URL' | 'CSV_UPLOAD' | 'MANUAL'
  mode: 'AUTO' | 'MANUAL' | 'CRON_15M' | 'CRON_1H' | 'CRON_DAILY' | 'WEBHOOK';
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  itemsProcessed: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errors?: string[];
  changes?: {
    sku: string;
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface SupplierConfig {
  supplierName: string;
  apiEndpoint: string;
  apiKey: string;
  feedUrl: string;
  syncFrequency: 'MANUAL' | '15M' | '1H' | 'DAILY' | 'WEBHOOK';
  publishMode: 'AUTO_PUBLISH' | 'REQUIRE_APPROVAL' | 'DRAFT_ONLY';
  lastSuccessfulSync?: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'CHECKING';
}

export interface PreOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  mgtCode?: string;
  totalPrice: number;
  downPaymentPaid: number;
  balancePending: number;
  arrivalForecast: string;
  status: PreOrderStatus;
  paymentMode: 'DOWN_PAYMENT_ONLY' | 'FULL_PAYMENT';
  balancePaymentDueDate?: string;
  balancePixCode?: string;
  trackingCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: {
    productId: string;
    title: string;
    mgtCode?: string;
    image: string;
    price: number;
    quantity: number;
    isPreOrder: boolean;
    payDownPaymentOnly: boolean;
    downPaymentValue: number;
    balanceValue: number;
  }[];
  subtotal: number;
  shippingCost: number;
  shippingService: string; // PAC, SEDEX, Transportadora
  discount: number;
  total: number;
  totalPaidNow: number;
  totalBalanceLater: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    pixQrCode?: string;
    pixCopiaECola?: string;
    installments?: number;
    boletoBarcode?: string;
    boletoUrl?: string;
  };
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GarageItem {
  id: string;
  productId: string;
  status: GarageStatus;
  userNote?: string;
  addedAt: string;
  product?: Product;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'PREORDER_ARRIVED' | 'NEW_RELEASE' | 'PAYMENT_CONFIRMED' | 'BALANCE_DUE' | 'ORDER_SHIPPED';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  desktopImageUrl: string;
  desktopStoragePath?: string;
  mobileImageUrl?: string;
  mobileStoragePath?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonActive?: boolean;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  secondaryButtonActive?: boolean;
  displayOrder: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  targetType?: 'URL' | 'PRODUCT' | 'CATEGORY' | 'PRESALE';
  targetId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeSection {
  id: string;
  sectionKey: 'hero' | 'categories' | 'presales' | 'ready_to_ship' | 'featured_products' | 'how_it_works' | 'garage_cta';
  title: string;
  subtitle?: string;
  displayOrder: number;
  active: boolean;
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductLot {
  id: string;
  productId: string;
  lotNumber: number;
  lotName: string;
  arrivalForecast?: string;
  stockTotal: number;
  stockReserved: number;
  downPaymentValue: number;
  balanceValue: number;
  totalPrice: number;
  status: 'ABERTO' | 'ESGOTADO' | 'EM_TRANSITO' | 'NO_BRASIL' | 'FINALIZADO' | 'CANCELADO';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  storeName: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  instagramUrl: string;
  pixDiscountPercent: number;
  freeShippingThreshold: number;
  topBannerText: string;
  topBannerActive: boolean;
  topBannerLink?: string;
  heroProductId?: string;
  featuredProductIds?: string[];
  featuredPreOrderIds?: string[];
}
