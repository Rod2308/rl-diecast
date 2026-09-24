'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Flame,
  Package,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Product, Order, PreOrderItem, SyncLog, SupplierConfig } from '@/lib/types';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrderItem[]>([]);
  const [syncConfig, setSyncConfig] = useState<SupplierConfig | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resOrd, resPre, resSync] = await Promise.all([
        fetch('/api/products?admin=true'),
        fetch('/api/orders'),
        fetch('/api/pre-orders'),
        fetch('/api/sync'),
      ]);

      const dataProd = await resProd.json();
      const dataOrd = await resOrd.json();
      const dataPre = await resPre.json();
      const dataSync = await resSync.json();

      if (dataProd.products) setProducts(dataProd.products);
      if (dataOrd.orders) setOrders(dataOrd.orders);
      if (dataPre.preOrders) setPreOrders(dataPre.preOrders);
      if (dataSync.config) setSyncConfig(dataSync.config);
      if (dataSync.syncLogs) setSyncLogs(dataSync.syncLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerQuickSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_MINI_GT' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadData();
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const totalSalesRevenue = orders
    .filter((o) => o.paymentStatus === 'APPROVED')
    .reduce((acc, curr) => acc + curr.totalPaidNow, 0);

  const totalPendingBalance = preOrders
    .filter((po) => po.balancePending > 0)
    .reduce((acc, curr) => acc + curr.balancePending, 0);

  const pendingApprovalCount = products.filter((p) => p.status === 'AGUARDANDO_APROVACAO').length;
  const activePreOrdersCount = preOrders.filter((po) => po.status !== 'QUITADO' && po.status !== 'CANCELADO').length;

  return (
    <div className="space-y-8">
      {/* Header with Quick Sync Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            Dashboard Administrativo
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão de vendas, pré-vendas e sincronização com fornecedor oficial Mini GT Brasil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerQuickSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Mini GT Brasil'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receita Confirmada */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Faturamento Confirmado</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatMoney(totalSalesRevenue)}</div>
          <span className="text-[10px] text-emerald-400 font-semibold block">Liquidação oficial via Gateway</span>
        </div>

        {/* Saldo de Pré-vendas a Receber */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Saldo na Chegada</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{formatMoney(totalPendingBalance)}</div>
          <span className="text-[10px] text-neutral-400 block">A ser cobrado na entrega física dos lotes</span>
        </div>

        {/* Pré-vendas Ativas */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Pré-Vendas Ativas</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{activePreOrdersCount}</div>
          <span className="text-[10px] text-neutral-400 block">Reservas com entrada paga</span>
        </div>

        {/* Produtos Aguardando Aprovação */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Lotes para Aprovar</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{pendingApprovalCount}</div>
          <Link
            href="/admin/produtos?status=AGUARDANDO_APROVACAO"
            className="text-[10px] text-amber-400 hover:underline font-semibold block"
          >
            Revisar antes da publicação →
          </Link>
        </div>
      </div>

      {/* Supplier Sync Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#12151e] to-neutral-900 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-white text-sm">
              Módulo: Sincronização com Fornecedor ({syncConfig?.supplierName || 'Mini GT Brasil'})
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Modo atual: <strong>{syncConfig?.publishMode === 'REQUIRE_APPROVAL' ? 'Exigir Aprovação Prévia' : 'Publicação Automática'}</strong> • Frequência: <strong>{syncConfig?.syncFrequency || '1H'}</strong>
          </p>
        </div>

        <Link
          href="/admin/sincronizacao"
          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-white/10 transition-colors"
        >
          Configurar Integração & Precificação
        </Link>
      </div>

      {/* Recent Pre-orders & Recent Sync Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pre-orders to manage */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Pré-Vendas Recentes
            </h3>
            <Link href="/admin/pre-vendas" className="text-xs text-amber-400 hover:underline font-semibold">
              Ver Todas →
            </Link>
          </div>

          <div className="space-y-3">
            {preOrders.slice(0, 4).map((po) => (
              <div key={po.id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-neutral-950/70 border border-white/5">
                <div>
                  <span className="font-bold text-white block">{po.productTitle}</span>
                  <span className="text-[10px] text-neutral-400">
                    Cliente: {po.customerName} • Previsão: {po.arrivalForecast}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-400 block">{formatMoney(po.balancePending)}</span>
                  <span className="text-[9px] text-neutral-400">saldo pendente</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync logs history */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" /> Histórico de Sincronizações
            </h3>
            <Link href="/admin/sincronizacao" className="text-xs text-amber-400 hover:underline font-semibold">
              Ver Logs Completos →
            </Link>
          </div>

          <div className="space-y-3">
            {syncLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-neutral-950/70 border border-white/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 font-mono">{log.source}</span>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR')} - {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex gap-4 text-[11px] text-neutral-300">
                  <span>Adicionados: <strong className="text-white">{log.itemsAdded}</strong></span>
                  <span>Atualizados: <strong className="text-amber-400">{log.itemsUpdated}</strong></span>
                  <span>Ignorados: <strong className="text-neutral-500">{log.itemsSkipped}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
