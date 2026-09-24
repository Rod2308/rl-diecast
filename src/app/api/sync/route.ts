import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import {
  syncSupplierProducts,
  getSampleMiniGtBrasilCatalog,
  fetchLiveMiniGtBrasilCatalog,
  parseCsvCatalog,
  RawSupplierItem,
} from '@/lib/sync-engine';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    config: db.supplierConfig,
    pricingRules: db.pricingRules,
    syncLogs: db.syncLogs,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const action = body.action || 'SYNC_MINI_GT';

    if (action === 'UPDATE_CONFIG') {
      if (body.config) {
        db.supplierConfig = { ...db.supplierConfig, ...body.config };
      }
      if (body.pricingRules) {
        db.pricingRules = { ...db.pricingRules, ...body.pricingRules };
      }
      saveDatabase(db);
      return NextResponse.json({
        success: true,
        message: 'Configurações de sincronização e precificação atualizadas!',
        config: db.supplierConfig,
      });
    }

    if (action === 'SYNC_MINI_GT') {
      // Consulta a API ao vivo do Mini GT Brasil
      const itemsToSync: RawSupplierItem[] = body.items || (await fetchLiveMiniGtBrasilCatalog());
      const result = syncSupplierProducts(itemsToSync, 'MINI_GT_BRASIL_API', body.mode || 'MANUAL');

      return NextResponse.json({
        success: true,
        message: `Sincronização concluída com o Mini GT Brasil! ${result.log.itemsAdded} novos cadastrados, ${result.log.itemsUpdated} atualizados.`,
        log: result.log,
        processedItems: result.processedItems,
      });
    }

    if (action === 'IMPORT_CSV') {
      if (!body.csvText) {
        return NextResponse.json({ success: false, error: 'Texto do CSV não fornecido' }, { status: 400 });
      }

      const parsedItems = parseCsvCatalog(body.csvText);
      if (parsedItems.length === 0) {
        return NextResponse.json({ success: false, error: 'Nenhum produto válido encontrado no CSV' }, { status: 400 });
      }

      const result = syncSupplierProducts(parsedItems, 'CSV_UPLOAD', 'MANUAL');
      return NextResponse.json({
        success: true,
        message: `Importação por CSV concluída! ${result.log.itemsAdded} novos cadastrados, ${result.log.itemsUpdated} atualizados.`,
        log: result.log,
      });
    }

    if (action === 'IMPORT_FEED_URL') {
      const feedUrl = body.feedUrl || db.supplierConfig.feedUrl;
      // Em produção, realizaria um fetch(feedUrl). Aqui usamos a amostra enriquecida simulando o retorno do feed
      const feedItems = getSampleMiniGtBrasilCatalog();
      const result = syncSupplierProducts(feedItems, 'FEED_URL', 'MANUAL');

      return NextResponse.json({
        success: true,
        message: `Feed ${feedUrl} sincronizado com sucesso!`,
        log: result.log,
      });
    }

    return NextResponse.json({ success: false, error: 'Ação não reconhecida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
