import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { Order, PreOrderItem } from '@/lib/types';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    orders: db.orders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();

    const orderId = `ord-${Date.now()}`;
    const orderCode = `RL-${Math.floor(1000 + Math.random() * 9000)}`;

    let subtotal = 0;
    let totalPaidNow = 0;
    let totalBalanceLater = 0;

    const items = body.items.map((item: any) => {
      const product = db.products.find((p) => p.id === item.productId);
      const isPreOrder = product?.isPreOrder ?? item.isPreOrder;
      const payDownPaymentOnly = isPreOrder && !!item.payDownPaymentOnly;

      const price = product?.salePrice ?? item.price;
      const downPaymentValue = product?.downPaymentValue ?? item.downPaymentValue ?? 15;
      const balanceValue = isPreOrder ? price - downPaymentValue : 0;

      subtotal += price * (item.quantity || 1);

      if (isPreOrder && payDownPaymentOnly) {
        totalPaidNow += downPaymentValue * (item.quantity || 1);
        totalBalanceLater += balanceValue * (item.quantity || 1);
      } else {
        totalPaidNow += price * (item.quantity || 1);
      }

      return {
        productId: item.productId,
        title: product?.title || item.title,
        mgtCode: product?.mgtCode,
        image: product?.images[0]?.url || item.image,
        price,
        quantity: item.quantity || 1,
        isPreOrder,
        payDownPaymentOnly,
        downPaymentValue,
        balanceValue,
      };
    });

    const shippingCost = Number(body.shippingCost) || 0;
    const discount = body.discount || 0;
    const total = subtotal + shippingCost - discount;
    totalPaidNow += shippingCost - discount;

    // Gerar dados simulados do gateway de pagamento oficial
    const pixCode = `00020126580014br.gov.bcb.pix0136rldiecast-pix-${orderCode}520400005303986540${totalPaidNow.toFixed(
      2
    )}5802BR5910RL Diecast6009Sao Paulo62070503***6304`;

    const newOrder: Order = {
      id: orderId,
      code: orderCode,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerCpf: body.customerCpf,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      items,
      subtotal,
      shippingCost,
      shippingService: body.shippingService || 'Correios PAC',
      discount,
      total,
      totalPaidNow,
      totalBalanceLater,
      paymentMethod: body.paymentMethod || 'PIX',
      paymentStatus: 'PENDING',
      paymentDetails: {
        pixCopiaECola: pixCode,
        installments: body.installments || 1,
        boletoBarcode: '34191.79001 01043.510047 91020.150008 5 999900000' + Math.floor(totalPaidNow),
        boletoUrl: `/api/boleto/${orderCode}.pdf`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Se houver itens de pré-venda, registrar na tabela específica de pré-vendas
    for (const it of items) {
      if (it.isPreOrder) {
        const prod = db.products.find((p) => p.id === it.productId);
        const preOrder: PreOrderItem = {
          id: `pre-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          orderId: newOrder.id,
          productId: it.productId,
          productTitle: it.title,
          productImage: it.image,
          mgtCode: it.mgtCode,
          totalPrice: it.price,
          downPaymentPaid: it.payDownPaymentOnly ? it.downPaymentValue : it.price,
          balancePending: it.payDownPaymentOnly ? it.balanceValue : 0,
          arrivalForecast: prod?.arrivalForecast || 'Previsão oficial',
          status: 'ENTRADA_PENDENTE',
          paymentMode: it.payDownPaymentOnly ? 'DOWN_PAYMENT_ONLY' : 'FULL_PAYMENT',
          customerName: newOrder.customerName,
          customerEmail: newOrder.customerEmail,
          customerPhone: newOrder.customerPhone,
          createdAt: new Date().toISOString(),
        };
        db.preOrders.unshift(preOrder);
      }
    }

    // Criar notificação para o usuário
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Pedido ${orderCode} Criado com Sucesso!`,
      message: `Aguardando confirmação do pagamento via ${newOrder.paymentMethod}.`,
      type: 'PAYMENT_CONFIRMED',
      link: '/conta',
      read: false,
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
