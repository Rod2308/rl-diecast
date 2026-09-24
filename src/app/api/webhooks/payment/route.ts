import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    // Simulação do payload oficial de webhook (Mercado Pago, Asaas ou Stripe)
    // Ex: { event: "payment.approved", orderCode: "RL-9281", gatewayId: "pay_1829102", amount: 33.50 }
    const event = body.event || 'payment.approved';
    const orderCode = body.orderCode || body.data?.orderCode;

    if (!orderCode) {
      return NextResponse.json({ success: false, error: 'Código de pedido não informado no webhook' }, { status: 400 });
    }

    const order = db.orders.find((o) => o.code === orderCode || o.id === orderCode);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado para reconciliação' }, { status: 404 });
    }

    if (event === 'payment.approved') {
      order.paymentStatus = 'APPROVED';
      order.updatedAt = new Date().toISOString();

      // Se o pedido continha pré-venda, atualiza a entrada para ENTRADA_PAGA
      const preOrdersForOrder = db.preOrders.filter((po) => po.orderId === order.id);
      for (const po of preOrdersForOrder) {
        if (po.status === 'ENTRADA_PENDENTE') {
          po.status = 'ENTRADA_PAGA';
        }
      }

      // Adiciona notificação formal
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Pagamento Aprovado pelo Gateway! (Pedido ${order.code})`,
        message: `O gateway confirmou o pagamento de R$ ${order.totalPaidNow.toFixed(
          2
        )} via ${order.paymentMethod}. Pedido atualizado com sucesso.`,
        type: 'PAYMENT_CONFIRMED',
        link: '/conta',
        read: false,
        createdAt: new Date().toISOString(),
      });

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        message: `Reconciliação concluída: Pedido ${order.code} aprovado via Webhook oficial.`,
        order,
      });
    }

    if (event === 'payment.refunded') {
      order.paymentStatus = 'REFUNDED';
      order.updatedAt = new Date().toISOString();
      saveDatabase(db);
      return NextResponse.json({ success: true, message: `Pedido ${order.code} estornado via Webhook.` });
    }

    return NextResponse.json({ success: true, message: `Evento ${event} recebido sem ações adicionais.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
