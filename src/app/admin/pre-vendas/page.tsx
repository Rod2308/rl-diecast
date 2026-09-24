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
  Plus,
  Edit,
  Trash2,
  Package,
  Layers,
  Calendar,
  Users,
  Archive,
} from 'lucide-react';
import { PreOrderItem, Product, ProductLot } from '@/lib/types';

export default function AdminPreOrdersPage() {
  const [activeTab, setActiveTab] = useState<'lots' | 'reservations'>('lots');

  // Lotes state
  const [products, setProducts] = useState<Product[]>([]);
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<Partial<ProductLot> | null>(null);

  // Reservas de clientes state
  const [preOrders, setPreOrders] = useState<PreOrderItem[]>([]);
  const [loadingPreOrders, setLoadingPreOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [shippingPreOrderId, setShippingPreOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingLots(true);
    setLoadingPreOrders(true);
    try {
      const [resProd, resLots, resPre] = await Promise.all([
        fetch('/api/products?admin=true', { cache: 'no-store' }),
        fetch('/api/lots', { cache: 'no-store' }),
        fetch('/api/pre-orders', { cache: 'no-store' }),
      ]);

      const dataProd = await resProd.json();
      const dataLots = await resLots.json();
      const dataPre = await resPre.json();

      if (dataProd.products) setProducts(dataProd.products);
      if (dataLots.lots) setLots(dataLots.lots);
      if (dataPre.preOrders) setPreOrders(dataPre.preOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLots(false);
      setLoadingPreOrders(false);
    }
  };

  // Pre-order products only
  const preOrderProducts = products.filter((p) => p.isPreOrder);

  // Actions for Lots
  const openNewLotModal = (productId?: string) => {
    const selectedProd = products.find((p) => p.id === productId) || preOrderProducts[0] || products[0];
    const existingForProd = lots.filter((l) => l.productId === selectedProd?.id);
    const nextNumber = existingForProd.length + 1;

    setEditingLot({
      productId: selectedProd?.id || '',
      lotNumber: nextNumber,
      lotName: `Lote 0${nextNumber} Oficial`,
      arrivalForecast: selectedProd?.arrivalForecast || 'Julho de 2026',
      stockTotal: selectedProd?.stock || 24,
      stockReserved: 0,
      downPaymentValue: selectedProd?.downPaymentValue || 15.0,
      balanceValue: selectedProd?.balanceValue || Math.max(0, (selectedProd?.salePrice || 109.9) - 15.0),
      totalPrice: selectedProd?.salePrice || 109.9,
      status: 'ABERTO',
      active: true,
    });
    setIsLotModalOpen(true);
  };

  const handleSaveLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLot || !editingLot.productId) return;

    try {
      const isExisting = Boolean(editingLot.id);
      const res = await fetch('/api/lots', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLot),
      });
      const data = await res.json();
      if (data.success) {
        setIsLotModalOpen(false);
        setEditingLot(null);
        loadData();
      } else {
        alert(data.error || 'Erro ao salvar lote');
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleDeleteLot = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o "${name}"?`)) return;
    try {
      const res = await fetch(`/api/lots?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLotActive = async (lot: ProductLot) => {
    try {
      const res = await fetch('/api/lots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lot.id, active: !lot.active }),
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Customer Reservations
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
          `Miniatura "${preOrder.productTitle}" marcada como chegada física no estoque! Notificação de saldo enviada ao cliente.`
        );
        loadData();
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
        loadData();
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const filteredPreOrders = preOrders.filter((po) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500/20" />
            Pré-Vendas, Lotes & Participantes
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Gerencie os lotes oficiais de cada miniatura, previsão de chegada, vagas e reservas de clientes.
          </p>
        </div>

        {activeTab === 'lots' && (
          <button
            onClick={() => openNewLotModal()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Criar Novo Lote</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('lots')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'lots'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Lotes Oficiais das Miniaturas ({lots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reservations'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participantes & Reservas ({preOrders.length})</span>
        </button>
      </div>

      {/* TAB 1: LOTES DAS MINIATURAS */}
      {activeTab === 'lots' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-white/10">
              <span className="text-xs text-neutral-400 font-semibold block">Total de Modelos em Pré-Venda</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {preOrderProducts.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-amber-500/30">
              <span className="text-xs text-amber-400 font-semibold block">Lotes Oficiais Criados</span>
              <span className="text-2xl font-black text-amber-300 font-mono mt-1 block">
                {lots.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f1422] border border-emerald-500/30">
              <span className="text-xs text-emerald-400 font-semibold block">Cotas Totais Disponíveis</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {lots.reduce((acc, l) => acc + (l.stockTotal || 0), 0)} un.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {preOrderProducts.map((prod) => {
              const productLots = lots.filter((l) => l.productId === prod.id);

              return (
                <div
                  key={prod.id}
                  className="p-5 rounded-2xl bg-[#0d1017] border border-white/10 space-y-4 hover:border-amber-400/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80'}
                        alt={prod.title}
                        className="w-14 h-14 rounded-xl object-cover bg-black shrink-0 border border-white/10"
                      />
                      <div>
                        <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                          {prod.brand} • {prod.mgtCode || prod.sku}
                        </span>
                        <h3 className="text-white font-black text-sm">{prod.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                          <span>Preço Total: <strong className="text-white font-mono">{formatMoney(prod.salePrice)}</strong></span>
                          <span>Entrada: <strong className="text-amber-300 font-mono">{formatMoney(prod.downPaymentValue)}</strong></span>
                          <span>Chegada: <strong className="text-neutral-300">{prod.arrivalForecast || '2026'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openNewLotModal(prod.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Outro Lote</span>
                    </button>
                  </div>

                  {/* Lista de Lotes deste produto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productLots.length === 0 ? (
                      <div className="p-3 rounded-xl bg-neutral-900/50 border border-white/5 text-xs text-neutral-400 col-span-full">
                        Nenhum lote específico configurado. O lote padrão é alimentado pelas informações do produto.
                      </div>
                    ) : (
                      productLots.map((lot) => (
                        <div
                          key={lot.id}
                          className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              {lot.lotName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                lot.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                              }`}
                            >
                              {lot.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                            <div>
                              <span>Vagas: </span>
                              <strong className="text-white font-mono">
                                {lot.stockReserved} / {lot.stockTotal} un.
                              </strong>
                            </div>
                            <div>
                              <span>Entrada: </span>
                              <strong className="text-amber-300 font-mono">
                                {formatMoney(lot.downPaymentValue)}
                              </strong>
                            </div>
                            <div className="col-span-2">
                              <span>Previsão: </span>
                              <strong className="text-neutral-200">{lot.arrivalForecast || '2026'}</strong>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                            <button
                              onClick={() => handleToggleLotActive(lot)}
                              className="text-neutral-400 hover:text-white text-[11px]"
                            >
                              {lot.active ? 'Desativar' : 'Ativar'}
                            </button>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingLot(lot);
                                  setIsLotModalOpen(true);
                                }}
                                className="p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                                title="Editar Lote"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteLot(lot.id, lot.lotName)}
                                className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title="Remover Lote"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PARTICIPANTES & RESERVAS */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 text-xs flex-wrap">
              {['ALL', 'ENTRADA_PAGA', 'AGUARDANDO_CHEGADA', 'CHEGOU_ESTOQUE', 'QUITADO', 'ENVIADO'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-amber-500 text-neutral-950'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'Todos' : st.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            <input
              type="text"
              placeholder="Buscar cliente, miniatura ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div className="space-y-3">
            {filteredPreOrders.map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-xl bg-[#0f1422] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={po.productImage || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80'}
                    alt={po.productTitle}
                    className="w-12 h-12 rounded-lg object-cover bg-black shrink-0 border border-white/10"
                  />
                  <div>
                    <h4 className="text-white font-bold text-xs">{po.productTitle}</h4>
                    <span className="text-[11px] text-neutral-400 block">
                      Cliente: <strong className="text-neutral-200">{po.customerName}</strong> ({po.customerEmail})
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono mt-0.5">
                      <span>Entrada Paga: <strong className="text-emerald-400">{formatMoney(po.downPaymentPaid)}</strong></span>
                      <span>Saldo: <strong className="text-amber-300">{formatMoney(po.balancePending)}</strong></span>
                      <span>Status: <strong className="text-white">{po.status}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {po.status === 'AGUARDANDO_CHEGADA' && (
                    <button
                      onClick={() => handleMarkArrived(po)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer"
                    >
                      Marcar Chegada
                    </button>
                  )}

                  {po.status === 'QUITADO' && (
                    <button
                      onClick={() => setShippingPreOrderId(po.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer"
                    >
                      Despachar Pedido
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE LOTE */}
      {isLotModalOpen && editingLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e121b] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingLot.id ? 'Editar Lote de Pré-Venda' : 'Adicionar Novo Lote'}
              </h3>
              <button onClick={() => setIsLotModalOpen(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLot} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Miniatura / Produto Vinculado *</label>
                <select
                  value={editingLot.productId}
                  onChange={(e) => {
                    const sel = products.find((p) => p.id === e.target.value);
                    setEditingLot({
                      ...editingLot,
                      productId: e.target.value,
                      totalPrice: sel?.salePrice || editingLot.totalPrice,
                      downPaymentValue: sel?.downPaymentValue || editingLot.downPaymentValue,
                      balanceValue: sel?.balanceValue || editingLot.balanceValue,
                      arrivalForecast: sel?.arrivalForecast || editingLot.arrivalForecast,
                    });
                  }}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.brand}] {p.sku} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Nome do Lote *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lote 01 Oficial"
                    value={editingLot.lotName || ''}
                    onChange={(e) => setEditingLot({ ...editingLot, lotName: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Número do Lote</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLot.lotNumber ?? 1}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, lotNumber: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Previsão de Chegada</label>
                  <input
                    type="text"
                    placeholder="Ex: Julho de 2026"
                    value={editingLot.arrivalForecast || ''}
                    onChange={(e) => setEditingLot({ ...editingLot, arrivalForecast: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Cotas / Estoque do Lote</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLot.stockTotal ?? 24}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, stockTotal: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Valor Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingLot.totalPrice ?? 0}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, totalPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-amber-400 font-semibold">Entrada Sinal</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingLot.downPaymentValue ?? 0}
                    onChange={(e) => {
                      const down = parseFloat(e.target.value) || 0;
                      const bal = Math.max(0, (editingLot.totalPrice || 0) - down);
                      setEditingLot({ ...editingLot, downPaymentValue: down, balanceValue: bal });
                    }}
                    className="w-full bg-neutral-950 border border-amber-500/30 rounded-lg p-2 text-amber-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Saldo Restante</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingLot.balanceValue ?? 0}
                    onChange={(e) =>
                      setEditingLot({ ...editingLot, balanceValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Status do Lote</label>
                  <select
                    value={editingLot.status}
                    onChange={(e) => setEditingLot({ ...editingLot, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="ABERTO">Aberto para Reserva</option>
                    <option value="EM_TRANSITO">Em Trânsito Internacional</option>
                    <option value="NO_BRASIL">No Brasil (Aguardando Despacho)</option>
                    <option value="ESGOTADO">Esgotado</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLot.active ?? true}
                      onChange={(e) => setEditingLot({ ...editingLot, active: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="font-bold text-white text-xs">Lote Ativo na Loja</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsLotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Salvar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
