const fs = require('fs');
const path = require('path');

async function importLiveFromMiniGtBrasil() {
  console.log('Consultando API oficial do Mini GT Brasil...');
  const res = await fetch('https://www.minigtbrasil.com.br/api/products');
  const liveProducts = await res.json();
  console.log(`Recebidos ${liveProducts.length} produtos da API oficial.`);

  // Filtra produtos relevantes:
  // 1. MINI GT, Kaido House, Tarmac Works, BBR Models
  // 2. Que possuem imagens válidas
  const filtered = liveProducts.filter(p => {
    const brand = (p.brand || '').trim();
    const hasImage = p.imageUrl || (p.images && p.images.length > 0);
    return hasImage && (
      brand === 'MINI GT' ||
      brand === 'Mini GT' ||
      brand === 'Kaido House' ||
      brand === 'Tarmac Works' ||
      brand === 'BBR Models' ||
      brand === 'Pop Race'
    );
  });

  console.log(`Encontrados ${filtered.length} produtos com marcas compatíveis e fotos.`);

  // Prioriza lançamentos recentes e pré-vendas abertas
  filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Seleciona uma carga robusta de 60 modelos autênticos
  const selected = filtered.slice(0, 60);

  // Lê banco de dados atual
  const dbPath = path.join(process.cwd(), 'data', 'rl_diecast_db.json');
  let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  let added = 0;
  let updated = 0;

  for (const item of selected) {
    const brand = item.brand === 'MINI GT' ? 'Mini GT' : item.brand;
    const isPreOrder = !item.readyStock;
    const sku = item.sku || `MGT-${item.id.slice(-6)}`;
    const mgtCode = sku.split('-')[0];

    // Custo estimado do atacado (em R$)
    let costPrice = 60.0;
    if (brand === 'Kaido House') costPrice = 98.0;
    if (brand === 'Tarmac Works') costPrice = 82.0;
    if (brand === 'BBR Models') costPrice = 140.0;

    // Regras de precificação RL Diecast
    let salePrice = Math.ceil(costPrice * 1.45 + 15) - 0.1;
    let downPaymentValue = Math.round((salePrice * 0.15) / 5) * 5;
    if (downPaymentValue < 15) downPaymentValue = 15;
    let balanceValue = Math.round((salePrice - downPaymentValue) * 100) / 100;

    // Formatação de Previsão de Chegada
    let arrivalForecast = 'Sob consulta oficial';
    if (item.arrivalForecast) {
      const d = new Date(item.arrivalForecast);
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      arrivalForecast = `${months[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
    }

    // Organizar Imagens oficiais
    const images = [];
    if (item.images && item.images.length > 0) {
      item.images.forEach((img, idx) => {
        images.push({
          id: `img-${img.id || idx}`,
          url: img.url.startsWith('http') ? img.url : `https://minigtbrasil.com.br${img.url}`,
          isMain: idx === 0,
          order: idx
        });
      });
    } else if (item.imageUrl) {
      images.push({
        id: `img-main-${item.id}`,
        url: item.imageUrl.startsWith('http') ? item.imageUrl : `https://minigtbrasil.com.br${item.imageUrl}`,
        isMain: true,
        order: 0
      });
    }

    // Título Padronizado: Pré-venda [Marca] • 1/64 [Modelo completo] [Cor ou edição] [Código]
    const prefix = isPreOrder ? 'Pré-venda ' : '';
    const cleanName = item.name.replace(/1\/64/g, '').replace(/\s+/g, ' ').trim();
    const title = `${prefix}${brand} • 1/64 ${cleanName} ${sku}`.trim();

    const slug = `${brand}-${item.model || cleanName}-${sku}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    // Descrição completa integrando ficha técnica oficial do Mini GT Brasil
    const description = `
🚗 **${cleanName.toUpperCase()}**

📋 **FICHA TÉCNICA OFICIAL (IMPORTAÇÃO MINI GT BRASIL)**
• **Fabricante / Marca**: ${brand}
• **Escala**: 1:64
• **Código / SKU**: ${sku}
• **Veículo**: ${item.model || cleanName}
• **Licença Oficial**: ${item.manufacturer || 'Licenciado'}
• **Embalagem**: ${item.packSize ? `Original lacrada de fábrica (Box / Blister)` : 'Lacrado'}
• **Status**: ${isPreOrder ? 'Pré-Venda Oficial' : 'Pronta-Entrega'}
• **Previsão de Chegada no Brasil**: ${arrivalForecast}

${isPreOrder ? `
🔥 **CONDIÇÕES ESPECIAIS DE PRÉ-VENDA RL DIECAST**
• **Valor Total**: R$ ${salePrice.toFixed(2).replace('.', ',')}
• **Entrada Facilitada**: R$ ${downPaymentValue.toFixed(2).replace('.', ',')} (garante sua unidade no lote)
• **Saldo Restante**: R$ ${balanceValue.toFixed(2).replace('.', ',')} (a ser pago via Pix ou Cartão somente na chegada da miniatura ao estoque)
` : `
⚡ **PRONTA-ENTREGA - ENVIO IMEDIATO**
• **Valor à vista no Pix (5% OFF)**: R$ ${(salePrice * 0.95).toFixed(2).replace('.', ',')}
• Despacho em até 24h úteis em embalagem blindada para colecionador.
`}

📜 **DETALHES DO FORNECEDOR OFICIAL:**
${item.description || 'Miniatura diecast de precisão em escala 1:64, pneus de borracha real e chassi detalhado.'}

🛡️ **COMPROMISSO RL DIECAST**
• Produto 100% original, novo e lacrado.
• Envio com embalagem blindada anti-impacto (plástico bolha de alta gramatura e caixa dupla).
• Acompanhamento ponto a ponto e aviso de chegada por e-mail e WhatsApp.
`.trim();

    // Deduplicação: verifica se já existe por SKU ou mgtCode
    const existingIdx = db.products.findIndex(p => p.sku.toLowerCase() === sku.toLowerCase());

    if (existingIdx >= 0) {
      db.products[existingIdx].images = images;
      db.products[existingIdx].description = description;
      db.products[existingIdx].title = title;
      db.products[existingIdx].arrivalForecast = arrivalForecast;
      db.products[existingIdx].updatedAt = new Date().toISOString();
      updated++;
    } else {
      db.products.push({
        id: `prod-${item.id}`,
        sku,
        mgtCode,
        title,
        slug,
        brand,
        scale: item.scale || '1:64',
        vehicleModel: item.model || cleanName,
        colorOrEdition: item.manufacturer || '',
        material: 'Diecast metal c/ pneus de borracha',
        packagingType: 'Caixa de colecionador lacrada (Box / Blister)',
        description,
        costPrice,
        salePrice,
        isPreOrder,
        downPaymentValue,
        balanceValue,
        arrivalForecast,
        stock: isPreOrder ? 36 : 8,
        status: isPreOrder ? 'PRE_VENDA' : 'PRONTA_ENTREGA',
        images,
        isFeatured: item.pinnedHome || added < 8,
        isNewRelease: isPreOrder,
        sourceSupplier: 'MINI_GT_BRASIL',
        sourceId: item.id,
        sourceUrl: `https://www.minigtbrasil.com.br/product/${item.id}`,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString()
      });
      added++;
    }
  }

  // Registra o log no banco de dados
  db.syncLogs.unshift({
    id: `log-live-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: 'MINI_GT_BRASIL_API_LIVE',
    mode: 'MANUAL',
    status: 'SUCCESS',
    itemsProcessed: selected.length,
    itemsAdded: added,
    itemsUpdated: updated,
    itemsSkipped: 0
  });

  db.supplierConfig.lastSuccessfulSync = new Date().toISOString();
  db.supplierConfig.connectionStatus = 'CONNECTED';

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Sincronização concluída com sucesso! ${added} produtos adicionados e ${updated} atualizados.`);
}

importLiveFromMiniGtBrasil().catch(console.error);
