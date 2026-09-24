'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Copy,
  Archive,
  Eye,
  Flame,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Product, ProductStatus } from '@/lib/types';
import { calculatePricing } from '@/lib/pricing';
import { generateStandardTitle, generateStandardDescription } from '@/lib/ads-generator';

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(initialStatus || 'ALL');
  const [search, setSearch] = useState('');

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?admin=true');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (product: Product) => {
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, status: (p.isPreOrder ? 'PRE_VENDA' : 'PRONTA_ENTREGA') as ProductStatus } : p
    );
    setProducts(updated);
    alert(`Produto "${product.title}" aprovado e publicado com sucesso!`);
  };

  const handleReject = (product: Product) => {
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, status: 'ENCERRADO' as ProductStatus } : p
    );
    setProducts(updated);
  };

  const handleTogglePublish = (product: Product) => {
    const newStatus =
      product.status === 'RASCUNHO' || product.status === 'AGUARDANDO_APROVACAO' || product.status === 'ENCERRADO'
        ? product.isPreOrder
          ? 'PRE_VENDA'
          : 'PRONTA_ENTREGA'
        : 'RASCUNHO';

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: newStatus as ProductStatus } : p))
    );
  };

  const handleDuplicate = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: `${product.sku}-COPY`,
      title: `${product.title} (Cópia)`,
      slug: `${product.slug}-copia`,
      status: 'RASCUNHO',
      createdAt: new Date().toISOString(),
    };
    setProducts([duplicated, ...products]);
  };

  const openNewProductModal = () => {
    setEditingProduct({
      brand: 'Mini GT',
      scale: '1:64',
      vehicleModel: '',
      colorOrEdition: '',
      sku: `MGT${Math.floor(10000 + Math.random() * 90000)}`,
      mgtCode: '',
      costPrice: 60.0,
      salePrice: 119.9,
      isPreOrder: true,
      downPaymentValue: 15.0,
      balanceValue: 104.9,
      arrivalForecast: 'Outubro de 2026',
      stock: 24,
      status: 'PRE_VENDA',
      material: 'Diecast metal c/ pneus de borracha',
      packagingType: 'Caixa de colecionador lacrada',
      images: [
        {
          id: 'img-new-1',
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          isMain: true,
          order: 0,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        loadProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'AGUARDANDO_APROVACAO' && p.status !== 'AGUARDANDO_APROVACAO') return false;
    if (activeTab === 'PRE_VENDA' && p.status !== 'PRE_VENDA') return false;
    if (activeTab === 'PRONTA_ENTREGA' && p.status !== 'PRONTA_ENTREGA') return false;
    if (activeTab === 'RASCUNHO' && p.status !== 'RASCUNHO') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.mgtCode && p.mgtCode.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countApproval = products.filter((p) => p.status === 'AGUARDANDO_APROVACAO').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Gestão de Produtos & Lotes</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Cadastre, revise importações automáticas e gerencie preços e cotas de pré-venda.
          </p>
        </div>

        <button
          onClick={openNewProductModal}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Produto Manual</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todos ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('AGUARDANDO_APROVACAO')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'AGUARDANDO_APROVACAO'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Aguardando Aprovação</span>
            {countApproval > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {countApproval}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PRE_VENDA')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'PRE_VENDA'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pré-vendas
          </button>

          <button
            onClick={() => setActiveTab('PRONTA_ENTREGA')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'PRONTA_ENTREGA'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pronta-Entrega
          </button>

          <button
            onClick={() => setActiveTab('RASCUNHO')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'RASCUNHO'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Rascunhos
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por título, SKU ou MGT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 border-b border-white/10 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Marca / Escala</th>
                <th className="p-4">Preço Venda</th>
                <th className="p-4">Entrada / Saldo</th>
                <th className="p-4">Previsão / Estoque</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url}
                        alt={p.title}
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-950 border border-white/10 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block max-w-xs truncate">{p.title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          SKU: {p.sku} {p.mgtCode ? `• MGT: ${p.mgtCode}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-amber-400 block">{p.brand}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{p.scale}</span>
                  </td>

                  <td className="p-4 font-mono font-bold text-white">
                    {formatMoney(p.salePrice)}
                    <span className="block text-[10px] text-neutral-500 font-normal">
                      Custo: {formatMoney(p.costPrice)}
                    </span>
                  </td>

                  <td className="p-4 font-mono">
                    {p.isPreOrder ? (
                      <div>
                        <span className="text-amber-400 font-bold block">Entr: {formatMoney(p.downPaymentValue)}</span>
                        <span className="text-neutral-400 text-[10px]">Sald: {formatMoney(p.balanceValue)}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-[10px]">Integral</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="text-white block text-[11px]">{p.arrivalForecast || 'Imediato'}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">{p.stock} unids</span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        p.status === 'PRE_VENDA'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : p.status === 'PRONTA_ENTREGA'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'AGUARDANDO_APROVACAO'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Approve button for waiting approval */}
                      {p.status === 'AGUARDANDO_APROVACAO' ? (
                        <>
                          <button
                            onClick={() => handleApprove(p)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                            title="Aprovar e Publicar na Loja"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprovar</span>
                          </button>
                          <button
                            onClick={() => handleReject(p)}
                            className="p-1 rounded bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                            title="Rejeitar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold"
                          title="Alternar Publicado / Rascunho"
                        >
                          {p.status === 'RASCUNHO' ? 'Publicar' : 'Despublicar'}
                        </button>
                      )}

                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Duplicar Produto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`/produto/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800"
                        title="Visualizar na Loja"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Produto */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0e111a] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-black text-lg text-white uppercase tracking-wider">
                Cadastrar Nova Miniatura
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Marca</label>
                  <select
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="Mini GT">Mini GT</option>
                    <option value="Kaido House">Kaido House</option>
                    <option value="Tarmac Works">Tarmac Works</option>
                    <option value="Pop Race">Pop Race</option>
                    <option value="Inno64">Inno64</option>
                    <option value="Hot Wheels">Hot Wheels</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Escala</label>
                  <select
                    value={editingProduct.scale}
                    onChange={(e) => setEditingProduct({ ...editingProduct, scale: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="1:64">1:64</option>
                    <option value="1:43">1:43</option>
                    <option value="1:18">1:18</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Modelo do Veículo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BMW Z3, Nissan Skyline R34..."
                    value={editingProduct.vehicleModel}
                    onChange={(e) => setEditingProduct({ ...editingProduct, vehicleModel: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Cor ou Edição</label>
                  <input
                    type="text"
                    placeholder="Ex: Hellrot, Bayside Blue, Chase Edition..."
                    value={editingProduct.colorOrEdition}
                    onChange={(e) => setEditingProduct({ ...editingProduct, colorOrEdition: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">SKU / Código</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value, mgtCode: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.costPrice}
                    onChange={(e) => {
                      const cost = parseFloat(e.target.value) || 0;
                      const p = calculatePricing(cost, editingProduct.brand || 'Mini GT');
                      setEditingProduct({
                        ...editingProduct,
                        costPrice: cost,
                        salePrice: p.salePrice,
                        downPaymentValue: p.downPaymentValue,
                        balanceValue: p.balanceValue,
                      });
                    }}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Automatic Calculated Pricing */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Preço de Venda Calculado</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatMoney(editingProduct.salePrice || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Valor Entrada</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {formatMoney(editingProduct.downPaymentValue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Saldo Restante</span>
                  <span className="font-mono font-bold text-neutral-300 text-sm">
                    {formatMoney(editingProduct.balanceValue || 0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Previsão de Chegada</label>
                  <input
                    type="text"
                    placeholder="Ex: Julho de 2026"
                    value={editingProduct.arrivalForecast}
                    onChange={(e) => setEditingProduct({ ...editingProduct, arrivalForecast: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Estoque Inicial (unidades)</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/20"
                >
                  Salvar Miniatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Carregando painel de produtos...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
