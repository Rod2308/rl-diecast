'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  QrCode,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Flame,
  Truck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPaidNow, totalBalanceLater, clearCart } = useCart();

  // Form states
  const [customerName, setCustomerName] = useState('Carlos Mendonça');
  const [customerEmail, setCustomerEmail] = useState('carlos.mendonca@gmail.com');
  const [customerCpf, setCustomerCpf] = useState('123.456.789-00');
  const [customerPhone, setCustomerPhone] = useState('(11) 98765-4321');

  // Address
  const [zipCode, setZipCode] = useState('01310-100');
  const [street, setStreet] = useState('Av. Paulista');
  const [number, setNumber] = useState('1000');
  const [complement, setComplement] = useState('Apto 102');
  const [neighborhood, setNeighborhood] = useState('Bela Vista');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');

  // Shipping
  const [shippingService, setShippingService] = useState('Correios SEDEX');
  const [shippingCost, setShippingCost] = useState(26.9);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
  const [installments, setInstallments] = useState(1);

  // Status & Created Order State
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [webhookSimulated, setWebhookSimulated] = useState(false);

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const pixDiscount = paymentMethod === 'PIX' ? totalPaidNow * 0.05 : 0;
  const finalPaidNow = totalPaidNow - pixDiscount + shippingCost;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerCpf,
        customerPhone,
        shippingAddress: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zipCode,
        },
        items: items.map((it) => ({
          productId: it.product.id,
          title: it.product.title,
          image: it.product.images?.[0]?.url,
          price: it.product.salePrice,
          quantity: it.quantity,
          isPreOrder: it.product.isPreOrder,
          payDownPaymentOnly: it.payDownPaymentOnly,
          downPaymentValue: it.product.downPaymentValue || 15,
          balanceValue: it.product.salePrice - (it.product.downPaymentValue || 15),
        })),
        shippingCost,
        shippingService,
        discount: pixDiscount,
        paymentMethod,
        installments,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
        clearCart();
      } else {
        alert(data.error || 'Erro ao processar pedido');
      }
    } catch (err: any) {
      alert('Erro ao criar pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (createdOrder?.paymentDetails?.pixCopiaECola) {
      navigator.clipboard.writeText(createdOrder.paymentDetails.pixCopiaECola);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  // Simulação oficial do Webhook do gateway brasileiro
  const handleSimulateWebhook = async () => {
    if (!createdOrder) return;
    try {
      const res = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.approved',
          orderCode: createdOrder.code,
          gatewayId: 'pay_test_' + Date.now(),
          amount: createdOrder.totalPaidNow,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookSimulated(true);
        setCreatedOrder({ ...createdOrder, paymentStatus: 'APPROVED' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Order Success Screen
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="p-8 rounded-3xl bg-neutral-900 border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold block">
            PEDIDO GERADO COM SUCESSO
          </span>
          <h1 className="text-3xl font-black text-white">Pedido #{createdOrder.code}</h1>
          <p className="text-xs text-neutral-300 max-w-md mx-auto">
            Obrigado, <strong>{createdOrder.customerName}</strong>! Enviamos a confirmação e os detalhes para{' '}
            <strong>{createdOrder.customerEmail}</strong>.
          </p>

          {/* Payment Status Box */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 text-left space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <span className="text-neutral-400">Status do Pagamento:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded font-mono ${
                  createdOrder.paymentStatus === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {createdOrder.paymentStatus === 'APPROVED' ? 'PAGAMENTO APROVADO' : 'AGUARDANDO PAGAMENTO'}
              </span>
            </div>

            {createdOrder.paymentMethod === 'PIX' && (
              <div className="space-y-3">
                <div className="text-center p-4 bg-white rounded-xl max-w-[200px] mx-auto">
                  <div className="w-36 h-36 bg-neutral-900 mx-auto flex items-center justify-center text-white font-mono text-[10px] text-center p-2 rounded">
                    [QR CODE PIX DINÂMICO R$ {createdOrder.totalPaidNow.toFixed(2)}]
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-neutral-400 font-semibold block">Pix Copia e Cola:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdOrder.paymentDetails.pixCopiaECola}
                      className="flex-1 bg-neutral-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-300 select-all"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Total Paid & Balance reminder */}
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total pago agora:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatMoney(createdOrder.totalPaidNow)}
                </span>
              </div>
              {createdOrder.totalBalanceLater > 0 && (
                <div className="flex justify-between text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <span>Saldo a pagar na chegada do lote:</span>
                  <span className="font-mono font-bold">{formatMoney(createdOrder.totalBalanceLater)}</span>
                </div>
              )}
            </div>

            {/* Webhook Gateway simulation trigger */}
            {createdOrder.paymentStatus !== 'APPROVED' && (
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSimulateWebhook}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Simular Confirmação Oficial do Gateway (Webhook)</span>
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-1">
                  Validação estrita: simula a recepção de callback oficial do Mercado Pago / Asaas / Stripe.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/conta"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
            >
              Acompanhar na Minha Conta
            </Link>
            <Link
              href="/catalogo"
              className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs border border-white/10"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Nenhum item no carrinho</h2>
        <p className="text-xs text-neutral-400">Adicione produtos antes de ir para o checkout.</p>
        <Link href="/catalogo" className="inline-block px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-xs">
          Ir para o Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">Checkout Seguro</h1>

      <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer, Address & Payment (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Identification */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
            <h2 className="font-bold text-sm text-white uppercase tracking-wider">1. Dados do Colecionador</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">CPF (obrigatório p/ NF e transportadora)</label>
                <input
                  type="text"
                  required
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">E-mail (para avisos de saldo e rastreio)</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">WhatsApp / Telefone</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
            <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" /> 2. Endereço de Entrega
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">CEP</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-neutral-300 font-semibold">Logradouro (Rua / Av.)</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Número</label>
                <input
                  type="text"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Complemento</label>
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Bairro</label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Cidade</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Estado (UF)</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Shipping Service Selection */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Opções de Frete</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShippingService('Correios SEDEX (Recomendado)');
                    setShippingCost(26.9);
                  }}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center ${
                    shippingService.includes('SEDEX')
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-neutral-950 border-white/10 text-neutral-400'
                  }`}
                >
                  <div>
                    <span className="font-bold block">Correios SEDEX</span>
                    <span className="text-[10px] text-neutral-400">2 a 4 dias úteis</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">R$ 26,90</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShippingService('Correios PAC Econômico');
                    setShippingCost(17.5);
                  }}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center ${
                    shippingService.includes('PAC')
                      ? 'bg-amber-500/20 border-amber-500 text-white'
                      : 'bg-neutral-950 border-white/10 text-neutral-400'
                  }`}
                >
                  <div>
                    <span className="font-bold block">Correios PAC</span>
                    <span className="text-[10px] text-neutral-400">5 a 8 dias úteis</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">R$ 17,50</span>
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
            <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" /> 3. Forma de Pagamento
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'PIX'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : 'bg-neutral-950 border-white/10 text-neutral-400'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs">Pix</span>
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase">5% OFF</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-neutral-950 border-white/10 text-neutral-400'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xs">Cartão</span>
                <span className="text-[9px] text-neutral-400">Até 12x</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BOLETO')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'BOLETO'
                    ? 'bg-neutral-800 border-white/30 text-white'
                    : 'bg-neutral-950 border-white/10 text-neutral-400'
                }`}
              >
                <FileText className="w-5 h-5 text-neutral-300" />
                <span className="font-bold text-xs">Boleto</span>
                <span className="text-[9px] text-neutral-400">À vista</span>
              </button>
            </div>

            {/* Installments for Credit Card */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Número de Parcelas</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                      <option key={i} value={i}>
                        {i}x de {formatMoney(finalPaidNow / i)} {i <= 6 ? 'sem juros' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-4 sticky top-28 shadow-2xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-white/10 pb-3">
              Itens no Pedido ({items.length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.product.id} className="flex gap-2.5 text-xs">
                  <img
                    src={it.product.images?.[0]?.url}
                    alt={it.product.title}
                    className="w-12 h-12 rounded object-cover bg-neutral-950 border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white truncate block">{it.product.title}</span>
                    <span className="text-[10px] text-neutral-400">
                      Qtd: {it.quantity} •{' '}
                      {it.product.isPreOrder && it.payDownPaymentOnly ? 'Entrada Reservada' : 'Total'}
                    </span>
                    <span className="block font-mono font-bold text-amber-400 mt-0.5">
                      {formatMoney(
                        (it.product.isPreOrder && it.payDownPaymentOnly
                          ? it.product.downPaymentValue || 15
                          : it.product.salePrice) * it.quantity
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-t border-white/10 pt-4">
              <div className="flex justify-between text-neutral-300">
                <span>Subtotal (agora):</span>
                <span className="font-mono">{formatMoney(totalPaidNow)}</span>
              </div>

              {pixDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Desconto Pix (5%):</span>
                  <span className="font-mono">-{formatMoney(pixDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-300">
                <span>Frete ({shippingService.split(' ')[0]}):</span>
                <span className="font-mono">{formatMoney(shippingCost)}</span>
              </div>

              {totalBalanceLater > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Saldo na Chegada:</span>
                    <span className="font-mono text-sm">{formatMoney(totalBalanceLater)}</span>
                  </div>
                  <p className="text-[9px] text-neutral-400">
                    Você será avisado por e-mail e WhatsApp para quitar quando o lote chegar ao Brasil.
                  </p>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total a Pagar Agora:</span>
                <span className="text-xl font-mono text-emerald-400">{formatMoney(finalPaidNow)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
            >
              <span>{loading ? 'Processando Pedido...' : 'Confirmar e Finalizar Pedido'}</span>
              <ArrowRight className="w-4 h-4 text-neutral-950" />
            </button>

            <div className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Ambiente criptografado e seguro</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
