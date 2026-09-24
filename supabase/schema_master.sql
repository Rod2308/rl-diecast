-- ==============================================================================
-- RL DIECAST • SUPABASE MASTER DDL SCHEMA
-- Reestruturação Completa: Banners, CMS da Home, Categorias, Lotes e Storage
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE BANNERS / CARROSSEL DA PÁGINA INICIAL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  tag TEXT,
  desktop_image_url TEXT NOT NULL,
  desktop_storage_path TEXT,
  mobile_image_url TEXT,
  mobile_storage_path TEXT,
  button_text TEXT DEFAULT 'Ver Catálogo',
  button_url TEXT DEFAULT '/catalogo',
  button_active BOOLEAN DEFAULT TRUE,
  secondary_button_text TEXT DEFAULT 'Ver Pronta-Entrega',
  secondary_button_url TEXT DEFAULT '/pronta-entrega',
  secondary_button_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  target_type VARCHAR(50) DEFAULT 'URL',
  target_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE SEÇÕES DA PÁGINA INICIAL (CMS DA HOME)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_sections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  display_order INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_sections_key ON home_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_home_sections_order ON home_sections(display_order);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE CATEGORIAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(150) UNIQUE NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- ------------------------------------------------------------------------------
-- 4. TABELA DE LOTES DE PRÉ-VENDA (RELACIONAMENTO PRODUTO -> PRÉ-VENDA -> LOTES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_lots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_number INT NOT NULL DEFAULT 1,
  lot_name VARCHAR(150) NOT NULL,
  arrival_forecast VARCHAR(100),
  stock_total INT NOT NULL DEFAULT 24,
  stock_reserved INT NOT NULL DEFAULT 0,
  down_payment_value NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  balance_value NUMERIC(10,2) NOT NULL DEFAULT 94.90,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 109.90,
  status VARCHAR(50) NOT NULL DEFAULT 'ABERTO',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_lots_product_id ON product_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_status ON product_lots(status);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE CONFIGURAÇÕES GERAIS DO SITE (SITE SETTINGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  store_name VARCHAR(150) NOT NULL DEFAULT 'RL Diecast',
  logo_url TEXT,
  favicon_url TEXT,
  contact_email VARCHAR(255) DEFAULT 'contato@rldiecast.com.br',
  contact_phone VARCHAR(50) DEFAULT '(11) 98765-4321',
  whatsapp_number VARCHAR(50) DEFAULT '5511987654321',
  instagram_url VARCHAR(255) DEFAULT 'https://instagram.com/rldiecast',
  pix_discount_percent NUMERIC(5,2) DEFAULT 5.0,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 299.0,
  top_banner_text TEXT DEFAULT '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS • GARANTA COM ENTRADA A PARTIR DE R$ 15,00',
  top_banner_active BOOLEAN DEFAULT TRUE,
  top_banner_link TEXT DEFAULT '/pre-vendas',
  hero_product_id TEXT,
  featured_product_ids JSONB DEFAULT '[]'::jsonb,
  featured_pre_order_ids JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão caso não existam
INSERT INTO site_settings (id, store_name, top_banner_text, top_banner_link)
VALUES ('current', 'RL Diecast', '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS • GARANTA COM ENTRADA A PARTIR DE R$ 15,00', '/pre-vendas')
ON CONFLICT (id) DO NOTHING;

-- Inserir seções padrão da home caso não existam
INSERT INTO home_sections (section_key, title, subtitle, display_order, active)
VALUES
  ('hero', 'Showroom Principal', 'Destaque e Banner Principal', 1, true),
  ('categories', 'Marcas Especializadas', 'Explore os catálogos dos maiores fabricantes mundiais', 2, true),
  ('presales', 'Pré-Vendas Abertas', 'Garanta seu modelo no lote oficial pagando apenas a entrada', 3, true),
  ('how_it_works', 'Como Funciona a Pré-Venda na RL Diecast?', 'Sistema seguro e planejado para o colecionador nunca perder um lote raro', 4, true),
  ('ready_to_ship', 'Pronta-Entrega', 'Modelos em estoque físico com despacho em até 24 horas úteis', 5, true),
  ('featured_products', 'Miniaturas em Destaque', 'Seleção especial dos modelos mais cobiçados pelos colecionadores', 6, true),
  ('garage_cta', 'Minha Garagem', 'Organize sua coleção 1:64 em um só lugar', 7, true)
ON CONFLICT (section_key) DO NOTHING;

-- Inserir categorias padrão caso não existam
INSERT INTO categories (name, slug, display_order, active)
VALUES
  ('Mini GT', 'mini-gt', 1, true),
  ('Kaido House', 'kaido-house', 2, true),
  ('Tarmac Works', 'tarmac-works', 3, true),
  ('BBR Models', 'bbr-models', 4, true),
  ('Pop Race', 'pop-race', 5, true),
  ('Inno64', 'inno64', 6, true),
  ('Hot Wheels', 'hot-wheels', 7, true),
  ('Dioramas', 'dioramas', 8, true),
  ('Acessórios & Expositores', 'acessorios', 9, true)
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Public banners read') THEN
    CREATE POLICY "Public banners read" ON banners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Admin banners all') THEN
    CREATE POLICY "Admin banners all" ON banners FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'home_sections' AND policyname = 'Public home_sections read') THEN
    CREATE POLICY "Public home_sections read" ON home_sections FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'home_sections' AND policyname = 'Admin home_sections all') THEN
    CREATE POLICY "Admin home_sections all" ON home_sections FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public categories read') THEN
    CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Admin categories all') THEN
    CREATE POLICY "Admin categories all" ON categories FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_lots' AND policyname = 'Public product_lots read') THEN
    CREATE POLICY "Public product_lots read" ON product_lots FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_lots' AND policyname = 'Admin product_lots all') THEN
    CREATE POLICY "Admin product_lots all" ON product_lots FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public site_settings read') THEN
    CREATE POLICY "Public site_settings read" ON site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admin site_settings all') THEN
    CREATE POLICY "Admin site_settings all" ON site_settings FOR ALL USING (true);
  END IF;
END $$;
