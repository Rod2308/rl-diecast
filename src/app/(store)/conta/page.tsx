'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Flame,
  CreditCard,
  Bell,
  MapPin,
  User,
  Truck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Car,
  Clock,
} from 'lucide-react';
import { Order, PreOrderItem, NotificationItem } from '@/lib/types';

function CustomerAccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('aba') || 'pedidos';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrderItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Balance Payment Modal
  const [payingPreOrder, setPayingPreOrder] = useState<PreOrderItem | null>(null);
  const [payingLoading, setPayingLoading] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [resOrders, resPre, resDb] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/pre-orders'),
        fetch('/api/sync'), // can pull notifications
      ]);

      const dataOrders = await resOrders.json();
      const dataPre = await resPre.json();

      if (dataOrders.orders) setOrders(dataOrders.orders);
      if (dataPre.preOrders) setPreOrders(dataPre.preOrders);

      // Carrega notificações locais
      setNotifications([
        {
          id: 'notif-1',
          title: 'Reserva Confirmada!',
          message: 'A entrada para a pré-venda MGT01386 (BMW Z3 Hellrot) foi aprovada com sucesso.',
          type: 'PAYMENT_CONFIRMED',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          title: 'Lançamentos de Outubro/2026',
          message: 'Novos lotes Mini GT e Kaido House liberados para pré-reserva.',
          type: 'NEW_RELEASE',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayBalance = async (preOrder: PreOrderItem) => {
    setPayingLoading(true);
    try {
      const res = await fetch('/api/pre-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preOrderId: preOrder.id,
          action: 'PAY_BALANCE',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPayingPreOrder(null);
        await loadCustomerData();
        alert('Saldo quitado com sucesso! A miniatura foi liberada para envio imediato.');
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setPayingLoading(false);
    }
  };

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile banner */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-2xl text-black shadow-lg">
            CM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Carlos Mendonça</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                COLECIONADOR VERIFICADO
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">carlos.mendonca@gmail.com • (11) 98765-4321</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/garagem"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span>Minha Garagem</span>
          </Link>
          <Link
            href="/catalogo"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition-all"
          >
            Explorar Loja
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pedidos'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Meus Pedidos ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prevendas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'prevendas'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Minhas Pré-vendas ({preOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('avisos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'avisos'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos & Lançamentos ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enderecos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'enderecos'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Endereços de Entrega</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 bg-neutral-900/40 rounded-2xl border border-white/5">
              Nenhum pedido realizado até o momento.
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-amber-400 text-sm">Pedido #{ord.code}</span>
                    <span className="text-neutral-400 block text-[11px]">
                      Realizado em {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded font-bold text-[11px] font-mono ${
                        ord.paymentStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ord.paymentStatus === 'APPROVED' ? 'PAGAMENTO APROVADO' : 'AGUARDANDO PAGAMENTO'}
                    </span>
                    <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 text-[11px]">
                      {ord.shippingService}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover bg-neutral-950 border border-white/10"
                        />
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[10px] text-neutral-400">
                            Qtd: {item.quantity} •{' '}
                            {item.isPreOrder && item.payDownPaymentOnly
                              ? `Entrada paga (${formatMoney(item.downPaymentValue)}) • Saldo de ${formatMoney(
                                  item.balanceValue
                                )} na chegada`
                              : `Valor Integral (${formatMoney(item.price)})`}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {formatMoney(
                          (item.isPreOrder && item.payDownPaymentOnly ? item.downPaymentValue : item.price) *
                            item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 text-neutral-300">
                  <span>Forma: {ord.paymentMethod}</span>
                  <div className="text-right">
                    <span className="text-neutral-400 mr-2">Total Pago Agora:</span>
                    <span className="font-mono font-bold text-white text-sm">{formatMoney(ord.totalPaidNow)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Pre-orders */}
      {activeTab === 'prevendas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
            <Flame className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold block">Painel de Acompanhamento de Pré-Vendas</span>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Aqui você visualiza os lotes encomendados. Quando a miniatura chegar ao Brasil, o status mudará para
                &quot;Chegou ao Estoque&quot; e você poderá quitar o saldo restante com Pix ou Cartão.
              </p>
            </div>
          </div>

          {preOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 bg-neutral-900/40 rounded-2xl border border-white/5">
              Você não possui pré-vendas ativas no momento.
            </div>
          ) : (
            preOrders.map((po) => (
              <div
                key={po.id}
                className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={po.productImage}
                      alt={po.productTitle}
                      className="w-14 h-14 rounded-xl object-cover bg-neutral-950 border border-white/10"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                        Código: {po.mgtCode || 'Mini GT Oficial'}
                      </span>
                      <h3 className="font-bold text-sm text-white">{po.productTitle}</h3>
                      <span className="text-xs text-neutral-400">Previsão: {po.arrivalForecast}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {po.status === 'CHEGOU_ESTOQUE' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-black font-extrabold text-xs shadow-lg animate-pulse">
                        CHEGOU AO BRASIL! LIBERADO P/ QUITAÇÃO
                      </span>
                    ) : po.status === 'QUITADO' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                        QUITADO • PREPARANDO ENVIO
                      </span>
                    ) : po.status === 'ENVIADO' ? (
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> ENVIADO ({po.trackingCode})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> RESERVA CONFIRMADA (AGUARDANDO CHEGADA)
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-neutral-950/60 p-4 rounded-xl border border-white/5">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Valor Total</span>
                    <span className="font-mono font-bold text-white text-sm">{formatMoney(po.totalPrice)}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Entrada Paga</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatMoney(po.downPaymentPaid)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Saldo Restante</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {formatMoney(po.balancePending)}
                    </span>
                  </div>
                </div>

                {/* Action button if arrived */}
                {po.status === 'CHEGOU_ESTOQUE' && po.balancePending > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-emerald-400 text-sm">O lote chegou ao estoque!</h4>
                      <p className="text-xs text-neutral-300">
                        Pague o saldo de <strong>{formatMoney(po.balancePending)}</strong> via Pix para liberação
                        imediata do envio.
                      </p>
                    </div>

                    <button
                      onClick={() => handlePayBalance(po)}
                      disabled={payingLoading}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{payingLoading ? 'Processando...' : 'Pagar Saldo Restante (Pix / Cartão)'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'avisos' && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">{n.title}</span>
                <span className="text-[10px] text-neutral-500">
                  {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-neutral-300">{n.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Addresses */}
      {activeTab === 'enderecos' && (
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm">Endereço Principal</h3>
          <p className="text-neutral-300">Av. Paulista, 1000 - Apto 102 - Bela Vista</p>
          <p className="text-neutral-400">São Paulo / SP - CEP 01310-100</p>
          <button className="text-amber-400 hover:text-amber-300 font-semibold pt-2">
            + Adicionar Novo Endereço
          </button>
        </div>
      )}
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Carregando painel do cliente...</div>}>
      <CustomerAccountContent />
    </Suspense>
  );
}
