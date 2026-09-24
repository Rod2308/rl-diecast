const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Tenta carregar variáveis de .env.local ou .env se dotenv estiver disponível ou process.env
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.error('\n❌ ERRO: Variáveis do Supabase não configuradas!');
  console.log('Certifique-se de configurar em seu arquivo .env.local:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-secreta\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSeed() {
  console.log('🏎️ Iniciando Seed da RL Diecast no Supabase Cloud...\n');
  console.log(`Conectando ao endpoint: ${supabaseUrl}`);

  const dbPath = path.join(process.cwd(), 'data', 'rl_diecast_db.json');
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Arquivo de dados local não encontrado em ${dbPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(raw);

  const products = db.products || [];
  console.log(`📦 Carregados ${products.length} produtos colecionáveis do banco local.`);

  // 1. Inserir / Atualizar Produtos
  let successCount = 0;
  let errorCount = 0;

  for (const p of products) {
    const payload = {
      id: p.id,
      sku: p.sku,
      mgt_code: p.mgtCode || null,
      title: p.title,
      slug: p.slug,
      brand: p.brand || 'Mini GT',
      scale: p.scale || '1:64',
      vehicle_model: p.vehicleModel || p.title,
      color_or_edition: p.colorOrEdition || null,
      material: p.material || 'Diecast metal c/ pneus de borracha',
      packaging_type: p.packagingType || 'Caixa de colecionador lacrada',
      description: p.description || '',
      technical_specs: p.technicalSpecs || {},
      cost_price: Number(p.costPrice || 0),
      sale_price: Number(p.salePrice || 0),
      is_pre_order: Boolean(p.isPreOrder),
      down_payment_value: Number(p.downPaymentValue || 0),
      balance_value: Number(p.balanceValue || 0),
      arrival_forecast: p.arrivalForecast || null,
      stock: Number(p.stock || 0),
      status: p.status || (p.isPreOrder ? 'PRE_VENDA' : 'PRONTA_ENTREGA'),
      images: p.images || [],
      is_featured: Boolean(p.isFeatured),
      is_new_release: Boolean(p.isNewRelease),
      source_supplier: p.sourceSupplier || 'MINI_GT_BRASIL',
      source_url: p.sourceUrl || null,
      created_at: p.createdAt || new Date().toISOString(),
      updated_at: p.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'sku' });

    if (error) {
      console.error(`Erro ao inserir SKU ${p.sku}:`, error.message);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n✅ Produtos sincronizados: ${successCount} sucesso(s), ${errorCount} erro(s).`);

  // 2. Inserir Regras de Precificação
  if (db.pricingRules) {
    console.log('\n⚙️ Sincronizando regras de precificação por marca...');
    for (const [brand, rule] of Object.entries(db.pricingRules)) {
      const rulePayload = {
        brand: brand,
        profit_margin_percent: rule.profitMarginPercent || 35.0,
        fixed_profit: rule.fixedProfit || 14.0,
        gateway_fee_percent: rule.gatewayFeePercent || 4.99,
        packaging_cost: rule.packagingCost || 6.0,
        safety_margin: rule.safetyMargin || 5.0,
        default_down_payment_percent: rule.defaultDownPaymentPercent || 15.0,
        min_price: rule.minPrice || null,
        max_price: rule.maxPrice || null,
      };

      const { error: ruleErr } = await supabase
        .from('pricing_rules')
        .upsert(rulePayload, { onConflict: 'brand' });

      if (ruleErr) {
        console.error(`Erro na regra ${brand}:`, ruleErr.message);
      } else {
        console.log(`  - Marca ${brand} OK`);
      }
    }
  }

  console.log('\n🎉 Seed finalizado com sucesso no Supabase!\n');
}

runSeed().catch((err) => {
  console.error('Falha geral no seed:', err);
  process.exit(1);
});
