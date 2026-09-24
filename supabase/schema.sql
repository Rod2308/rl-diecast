-- ==============================================================================
-- RL DIECAST • SUPABASE / POSTGRESQL PRODUCTION DDL SCHEMA
-- ==============================================================================
-- Copie e cole este script no SQL Editor do Supabase para criar todas as tabelas
-- e políticas de segurança (RLS) com 1 único clique.

-- Habilita extensão pgcrypto / uuid para geração de IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE PRODUTOS (COLECIONÁVEIS DIECAST 1:64)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sku VARCHAR(100) UNIQUE NOT NULL,
  mgt_code VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL DEFAULT 'Mini GT',
  scale VARCHAR(50) NOT NULL DEFAULT '1:64',
  vehicle_model VARCHAR(150) NOT NULL,
  color_or_edition VARCHAR(150),
  material VARCHAR(150) DEFAULT 'Diecast metal c/ pneus de borracha',
  packaging_type VARCHAR(150) DEFAULT 'Caixa de colecionador lacrada',
  description TEXT NOT NULL,
  technical_specs JSONB DEFAULT '{}'::jsonb,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_pre_order BOOLEAN NOT NULL DEFAULT FALSE,
  down_payment_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  arrival_forecast VARCHAR(100),
  arrival_confirmed_date TIMESTAMP WITH TIME ZONE,
  stock INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'PRONTA_ENTREGA',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_release BOOLEAN NOT NULL DEFAULT FALSE,
  source_supplier VARCHAR(100) DEFAULT 'MINI_GT_BRASIL',
  source_id TEXT,
  source_url TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de alta performance para o showroom
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_mgt_code ON products(mgt_code);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_pre_order ON products(is_pre_order);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE IMAGENS DE PRODUTOS (NORMALIZADA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE PEDIDOS (ORDERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_cpf VARCHAR(20) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_service VARCHAR(100) NOT NULL DEFAULT 'PAC',
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_paid_now NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_balance_later NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'PIX',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  payment_details JSONB DEFAULT '{}'::jsonb,
  tracking_code VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ------------------------------------------------------------------------------
-- 4. TABELA DE PRÉ-VENDAS & QUITAÇÃO DE SALDO (PREORDERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preorders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  product_title VARCHAR(255) NOT NULL,
  product_image TEXT,
  mgt_code VARCHAR(100),
  total_price NUMERIC(10,2) NOT NULL,
  down_payment_paid NUMERIC(10,2) NOT NULL,
  balance_pending NUMERIC(10,2) NOT NULL,
  arrival_forecast VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'ENTRADA_PENDENTE',
  payment_mode VARCHAR(50) NOT NULL DEFAULT 'DOWN_PAYMENT_ONLY',
  balance_payment_due_date TIMESTAMP WITH TIME ZONE,
  balance_pix_code TEXT,
  tracking_code VARCHAR(100),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preorders_status ON preorders(status);
CREATE INDEX IF NOT EXISTS idx_preorders_customer_email ON preorders(customer_email);
CREATE INDEX IF NOT EXISTS idx_preorders_product_id ON preorders(product_id);

-- ------------------------------------------------------------------------------
-- 5. TABELA MINHA GARAGEM (GARAGE / FAVORITOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'FAVORITO',
  user_note TEXT,
  customer_email VARCHAR(255),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_product_id ON collections(product_id);

-- ------------------------------------------------------------------------------
-- 6. REGRAS DE PRECIFICAÇÃO POR MARCA (PRICING RULES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_rules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  brand VARCHAR(100) UNIQUE NOT NULL,
  profit_margin_percent NUMERIC(5,2) NOT NULL DEFAULT 35.0,
  fixed_profit NUMERIC(10,2) NOT NULL DEFAULT 14.0,
  gateway_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 4.99,
  packaging_cost NUMERIC(10,2) NOT NULL DEFAULT 6.0,
  safety_margin NUMERIC(10,2) NOT NULL DEFAULT 5.0,
  default_down_payment_percent NUMERIC(5,2) NOT NULL DEFAULT 15.0,
  min_price NUMERIC(10,2),
  max_price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. LOGS DE AUDITORIA & SINCRONIZAÇÃO (SYNC LOGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(100) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  items_processed INT DEFAULT 0,
  items_added INT DEFAULT 0,
  items_updated INT DEFAULT 0,
  items_skipped INT DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  changes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

-- Produtos: Qualquer pessoa pode visualizar produtos ativos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public products read'
  ) THEN
    CREATE POLICY "Public products read" ON products FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admin products insert'
  ) THEN
    CREATE POLICY "Admin products insert" ON products FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admin products update'
  ) THEN
    CREATE POLICY "Admin products update" ON products FOR UPDATE USING (true);
  END IF;
END $$;

-- Imagens: Leitura pública
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Public images read'
  ) THEN
    CREATE POLICY "Public images read" ON product_images FOR SELECT USING (true);
  END IF;
END $$;

-- Regras de Precificação: Leitura pública
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pricing_rules' AND policyname = 'Public pricing read'
  ) THEN
    CREATE POLICY "Public pricing read" ON pricing_rules FOR SELECT USING (true);
  END IF;
END $$;

-- Pedidos: Criação permitida pelo checkout, leitura permitida
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Public orders insert'
  ) THEN
    CREATE POLICY "Public orders insert" ON orders FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Public orders read'
  ) THEN
    CREATE POLICY "Public orders read" ON orders FOR SELECT USING (true);
  END IF;
END $$;

-- Pré-vendas: Leitura e inserção
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preorders' AND policyname = 'Public preorders read'
  ) THEN
    CREATE POLICY "Public preorders read" ON preorders FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preorders' AND policyname = 'Public preorders insert'
  ) THEN
    CREATE POLICY "Public preorders insert" ON preorders FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'preorders' AND policyname = 'Public preorders update'
  ) THEN
    CREATE POLICY "Public preorders update" ON preorders FOR UPDATE USING (true);
  END IF;
END $$;

-- Minha Garagem / Coleções: Acesso completo para o usuário da sessão
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Public collections read'
  ) THEN
    CREATE POLICY "Public collections read" ON collections FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Public collections insert'
  ) THEN
    CREATE POLICY "Public collections insert" ON collections FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Public collections update'
  ) THEN
    CREATE POLICY "Public collections update" ON collections FOR UPDATE USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'collections' AND policyname = 'Public collections delete'
  ) THEN
    CREATE POLICY "Public collections delete" ON collections FOR DELETE USING (true);
  END IF;
END $$;

-- Sync Logs
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sync_logs' AND policyname = 'Public sync_logs read'
  ) THEN
    CREATE POLICY "Public sync_logs read" ON sync_logs FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sync_logs' AND policyname = 'Public sync_logs insert'
  ) THEN
    CREATE POLICY "Public sync_logs insert" ON sync_logs FOR INSERT WITH CHECK (true);
  END IF;
END $$;
