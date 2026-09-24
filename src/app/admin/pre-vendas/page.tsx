'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  Truck,
  QrCode,
  DollarSign,
  AlertCircle,
  Search,
} from 'lucide-react';
import { PreOrderItem, PreOrderStatus } from '@/lib/types';

export default function AdminPreOrdersPage() {
  const [preOrders, setPreOrders] = useState<PreOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Shipping code prompt
  const [shippingPreOrderId, setShippingPreOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    loadPreOrders();
  }, []);

  const loadPreOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pre-orders');
      const data = await res.json();
      if (data.preOrders) setPreOrders(data.preOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkArrived = async (preOrder: PreOrderItem) => {
    try {
      const res = await fetch('/api/pre-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preOrderId: preOrder.id, action: 'MARK_ARRIVED' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(
          `Miniatura "${preOrder.productTitle}" marcada como chegada física no estoque! Notificação e Pix de saldo disparados para o cliente.`
        );
        loadPreOrders();
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const handleShipOrder = async (preOrderId: string) => {
    try {
      const res = await fetch('/api/pre-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preOrderId, action: 'SHIP_ORDER', trackingCode: trackingInput }),
      });
      const data = await res.json();
      if (data.success) {
        setShippingPreOrderId(null);
        setTrackingInput('');
        loadPreOrders();
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const filtered = preOrders.filter((po) => {
    if (statusFilter !== 'ALL' && po.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        po.productTitle.toLowerCase().includes(q) ||
        po.customerName.toLowerCase().includes(q) ||
        po.customerEmail.toLowerCase().includes(q) ||
        (po.mgtCode && po.mgtCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalDownPaymentCollected = preOrders.reduce((acc, po) => acc + po.downPaymentPaid, 0);
  const totalBalanceWaiting = preOrders.reduce((acc, po) => acc + po.balancePending, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Gestão de Lotes de Pré-Vendas & Saldos
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Controle de reservas antecipadas, acompanhamento dos lotes e disparo de cobranças de saldo na chegada.
          </p>
        </div>

        {/* Metrics summary */}
        <div className="flex gap-4">
          <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-xs">
            <span className="text-neutral-400 block text-[10px] uppercase">Entradas Coletadas:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {formatMoney(totalDownPaymentCollected)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-xs">
            <span className="text-neutral-400 block text-[10px] uppercase">Saldo a Receber:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {formatMoney(totalBalanceWaiting)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-neutral-950 border-white/10 text-neutral-400'
            }`}
          >
            Todas ({preOrders.length})
          </button>

          <button
            onClick={() => setStatusFilter('ENTRADA_PAGA')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
              statusFilter === 'ENTRADA_PAGA'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-neutral-950 border-white/10 text-neutral-400'
            }`}
          >
            Aguardando Chegada
          </button>

          <button
            onClick={() => setStatusFilter('CHEGOU_ESTOQUE')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
              statusFilter === 'CHEGOU_ESTOQUE'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-neutral-950 border-white/10 text-neutral-400'
            }`}
          >
            Chegou ao Brasil (Cobrar Saldo)
          </button>

          <button
            onClick={() => setStatusFilter('QUITADO')}
            className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
              statusFilter === 'QUITADO'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-neutral-950 border-white/10 text-neutral-400'
            }`}
          >
            Saldo Quitado (Pronto p/ Envio)
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por cliente, modelo ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Miniatura</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Entrada Paga</th>
                <th className="p-4">Saldo Pendente</th>
                <th className="p-4">Previsão</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação do Lote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-neutral-800/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={po.productImage}
                        alt={po.productTitle}
                        className="w-12 h-12 rounded object-cover bg-neutral-950 border border-white/10 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block max-w-xs truncate">{po.productTitle}</span>
                        {po.mgtCode && (
                          <span className="text-[10px] font-mono text-amber-400">Cód: {po.mgtCode}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-white block">{po.customerName}</span>
                    <span className="text-[10px] text-neutral-400">{po.customerEmail}</span>
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400">{formatMoney(po.downPaymentPaid)}</td>

                  <td className="p-4 font-mono font-bold text-amber-400">{formatMoney(po.balancePending)}</td>

                  <td className="p-4 text-white text-[11px]">{po.arrivalForecast}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        po.status === 'CHEGOU_ESTOQUE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : po.status === 'QUITADO'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : po.status === 'ENVIADO'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {po.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Button to trigger arrival */}
                      {po.status !== 'CHEGOU_ESTOQUE' && po.status !== 'QUITADO' && po.status !== 'ENVIADO' && (
                        <button
                          onClick={() => handleMarkArrived(po)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                          title="Avisar que o lote chegou e cobrar saldo restante"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marcar Chegada</span>
                        </button>
                      )}

                      {/* Button to ship */}
                      {po.status === 'QUITADO' && (
                        <button
                          onClick={() => setShippingPreOrderId(po.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Despachar Envio</span>
                        </button>
                      )}

                      {po.status === 'ENVIADO' && (
                        <span className="text-[10px] font-mono text-neutral-400">{po.trackingCode}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to dispatch with tracking code */}
      {shippingPreOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e111a] border border-white/10 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-white text-sm">Informar Código de Rastreamento</h4>
            <input
              type="text"
              placeholder="Ex: BR182910291RL"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShippingPreOrderId(null)}
                className="px-3 py-1.5 rounded bg-neutral-800 text-neutral-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleShipOrder(shippingPreOrderId)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
