import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    preOrders: db.preOrders,
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const { preOrderId, action, trackingCode } = body;

    const preOrder = db.preOrders.find((p) => p.id === preOrderId);
    if (!preOrder) {
      return NextResponse.json({ success: false, error: 'Pré-venda não encontrada' }, { status: 404 });
    }

    if (action === 'MARK_ARRIVED') {
      // O lote da miniatura chegou ao estoque da RL Diecast
      preOrder.status = 'CHEGOU_ESTOQUE';
      preOrder.balancePixCode = `00020126580014br.gov.bcb.pix0136rldiecast-saldo-${preOrder.id}520400005303986540${preOrder.balancePending.toFixed(
        2
      )}5802BR5910RL Diecast6009Sao Paulo62070503***6304`;

      // Atualiza também o produto correspondente se necessário
      const product = db.products.find((p) => p.id === preOrder.productId);
      if (product) {
        product.arrivalConfirmedDate = new Date().toISOString();
      }

      // Notifica o cliente
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Sua Pré-venda Chegou! (${preOrder.productTitle})`,
        message: `O lote oficial chegou ao nosso estoque! Efetue o pagamento do saldo restante de R$ ${preOrder.balancePending.toFixed(
          2
        )} para liberação do envio imediato.`,
        type: 'BALANCE_DUE',
        link: '/conta',
        read: false,
        createdAt: new Date().toISOString(),
      });

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        message: 'Miniatura marcada como disponível no estoque! Cobrança de saldo disparada.',
        preOrder,
      });
    }

    if (action === 'PAY_BALANCE') {
      // Cliente efetuou o pagamento do saldo restante
      preOrder.status = 'QUITADO';
      preOrder.balancePending = 0;

      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Saldo Quitado! Miniatura em Separação`,
        message: `Recebemos o pagamento do saldo de ${preOrder.productTitle}. Seu exemplar está em preparação para envio!`,
        type: 'PAYMENT_CONFIRMED',
        link: '/conta',
        read: false,
        createdAt: new Date().toISOString(),
      });

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        message: 'Saldo quitado com sucesso! Produto pronto para expedição.',
        preOrder,
      });
    }

    if (action === 'SHIP_ORDER') {
      preOrder.status = 'ENVIADO';
      preOrder.trackingCode = trackingCode || `BR${Math.floor(100000000 + Math.random() * 900000000)}RL`;

      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Miniatura Enviada! Código de Rastreio`,
        message: `Seu colecionável foi despachado via Correios! Código de rastreamento: ${preOrder.trackingCode}`,
        type: 'ORDER_SHIPPED',
        link: '/conta',
        read: false,
        createdAt: new Date().toISOString(),
      });

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        message: 'Pré-venda despachada com rastreio!',
        preOrder,
      });
    }

    return NextResponse.json({ success: false, error: 'Ação não suportada' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
