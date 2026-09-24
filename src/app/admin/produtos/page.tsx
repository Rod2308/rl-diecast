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
  Sparkles,
  Star,
  Trash2,
  DollarSign,
  TrendingUp,
  Check,
} from 'lucide-react';
import { Product, ProductStatus } from '@/lib/types';
import { calculatePricing } from '@/lib/pricing';
import { generateStandardTitle, generateStandardDescription } from '@/lib/ads-generator';

interface EditingProductForm extends Partial<Product> {
  imageUrl?: string;
  setAsHero?: boolean;
}

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(initialStatus || 'ALL');
  const [search, setSearch] = useState('');

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProductForm | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?admin=true', { cache: 'no-store' });
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

  const handleApprove = async (product: Product) => {
    const newStatus = product.isPreOrder ? 'PRE_VENDA' : 'PRONTA_ENTREGA';
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus as ProductStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, status: 'ENCERRADO' }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: 'ENCERRADO' as ProductStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    const newStatus =
      product.status === 'RASCUNHO' || product.status === 'AGUARDANDO_APROVACAO' || product.status === 'ENCERRADO'
        ? product.isPreOrder
          ? 'PRE_VENDA'
          : 'PRONTA_ENTREGA'
        : 'RASCUNHO';

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus as ProductStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Deseja realmente excluir permanentemente a miniatura:\n"${product.title}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(product.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        alert(data.error || 'Erro ao excluir produto');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const duplicated = {
        ...product,
        sku: `${product.sku}-COPY`,
        title: `${product.title} (Cópia)`,
        slug: `${product.slug}-copia-${Date.now()}`,
        status: 'RASCUNHO',
      };
      delete (duplicated as any).id;
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated),
      });
      const data = await res.json();
      if (data.success) {
        loadProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNewProductModal = () => {
    setEditingProduct({
      title: '',
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

  const openEditModal = (product: Product) => {
    const cost = Number(product.costPrice) || 0;
    const sale = Number(product.salePrice) || 0;
    const down = Number(product.downPaymentValue) || 0;
    const bal =
      product.balanceValue !== undefined && product.balanceValue !== null
        ? Number(product.balanceValue)
        : Math.max(0, Math.round((sale - down) * 100) / 100);

    setEditingProduct({
      ...product,
      costPrice: cost,
      salePrice: sale,
      downPaymentValue: down,
      balanceValue: bal,
      imageUrl: product.images?.[0]?.url || '',
    });
    setIsModalOpen(true);
  };

  const handleSetHero = async (product: Product) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroProductId: product.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`⭐ O produto "${product.title}" foi definido como DESTAQUE PRINCIPAL da página inicial (Hero)!`);
        loadProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const isExisting = Boolean(editingProduct.id);

      const costPrice = Number(editingProduct.costPrice) || 0;
      const salePrice = Number(editingProduct.salePrice) || 0;
      const downPaymentValue = Number(editingProduct.downPaymentValue) || 0;
      const balanceValue =
        editingProduct.balanceValue !== undefined && editingProduct.balanceValue !== null
          ? Number(editingProduct.balanceValue)
          : Math.max(0, Math.round((salePrice - downPaymentValue) * 100) / 100);

      const payload = {
        ...editingProduct,
        costPrice,
        salePrice,
        downPaymentValue,
        balanceValue,
        stock: Number(editingProduct.stock) || 0,
        description:
          editingProduct.description?.trim() ||
          generateStandardDescription({
            brand: editingProduct.brand || 'Mini GT',
            scale: editingProduct.scale || '1:64',
            vehicleModel: editingProduct.vehicleModel || '',
            colorOrEdition: editingProduct.colorOrEdition || '',
            code: editingProduct.mgtCode || editingProduct.sku,
            isPreOrder: editingProduct.isPreOrder ?? true,
            material: editingProduct.material,
            packagingType: editingProduct.packagingType,
            arrivalForecast: editingProduct.arrivalForecast,
            salePrice,
            downPaymentValue,
            balanceValue,
            stockLimit: Number(editingProduct.stock) || 12,
          }),
      };

      const res = await fetch('/api/products', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingProduct(null);
        loadProducts();
      } else {
        alert(data.error || 'Erro ao salvar produto');
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

                  <td
                    className="p-4 font-mono cursor-pointer hover:bg-neutral-800/80 transition-colors group"
                    onClick={() => openEditModal(p)}
                    title="Clique para editar valores e preço"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-white group-hover:text-amber-400">
                      <span>{formatMoney(p.salePrice)}</span>
                      <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" />
                    </div>
                    <span className="block text-[10px] text-neutral-500 font-normal">
                      Custo: {formatMoney(p.costPrice)}
                    </span>
                  </td>

                  <td
                    className="p-4 font-mono cursor-pointer hover:bg-neutral-800/80 transition-colors group"
                    onClick={() => openEditModal(p)}
                    title="Clique para alterar valores de entrada e saldo"
                  >
                    {p.isPreOrder ? (
                      <div>
                        <div className="flex items-center gap-1 text-amber-400 font-bold group-hover:text-amber-300">
                          <span>Entr: {formatMoney(p.downPaymentValue)}</span>
                          <Edit className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" />
                        </div>
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

                      {/* Definir como Destaque Principal da Home (Hero) */}
                      <button
                        onClick={() => handleSetHero(p)}
                        className="p-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800"
                        title="⭐ Definir como Destaque Principal da Home (Hero)"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Editar Produto e Foto */}
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800"
                        title="Editar Produto & Alterar Foto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Duplicar Produto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Excluir Miniatura */}
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
                        title="Excluir Miniatura Permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                {editingProduct.id ? 'Editar Miniatura' : 'Cadastrar Nova Miniatura'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {/* Título do Produto */}
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Título Completo da Miniatura</label>
                <input
                  type="text"
                  placeholder="Ex: Pré-venda Mini GT • 1/64 BMW Z3 Hellrot"
                  value={editingProduct.title || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              {/* Foto Principal com Preview ao Vivo */}
              <div className="space-y-2 p-3 bg-neutral-950/80 border border-white/10 rounded-xl">
                <label className="text-neutral-300 font-semibold block">Foto Principal da Miniatura (URL da Imagem)</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingProduct.imageUrl || editingProduct.images?.[0]?.url ? (
                      <img
                        src={editingProduct.imageUrl || editingProduct.images?.[0]?.url}
                        alt="Preview da Foto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-500">Sem foto</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto-do-carro.jpg"
                      value={editingProduct.imageUrl || (editingProduct.images?.[0]?.url || '')}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          imageUrl: e.target.value,
                        })
                      }
                      className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white text-xs font-mono"
                    />
                    <span className="text-[10px] text-neutral-400 block">
                      Cole a URL da foto. O preview ao lado atualiza em tempo real.
                    </span>
                  </div>
                </div>
              </div>

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
                    <option value="BBR Models">BBR Models</option>
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
                    value={editingProduct.vehicleModel || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, vehicleModel: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Cor ou Edição</label>
                  <input
                    type="text"
                    placeholder="Ex: Hellrot, Bayside Blue, Chase Edition..."
                    value={editingProduct.colorOrEdition || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, colorOrEdition: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">SKU / Código</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value, mgtCode: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Previsão de Chegada</label>
                  <input
                    type="text"
                    placeholder="Ex: Julho de 2026"
                    value={editingProduct.arrivalForecast || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, arrivalForecast: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Estoque (unidades)</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Status de Publicação</label>
                <select
                  value={editingProduct.status || 'PRE_VENDA'}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      status: e.target.value as ProductStatus,
                      isPreOrder: e.target.value === 'PRE_VENDA',
                    })
                  }
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                >
                  <option value="PRE_VENDA">Pré-Venda (Permite Reserva com Entrada)</option>
                  <option value="PRONTA_ENTREGA">Pronta-Entrega (Envio Imediato)</option>
                  <option value="RASCUNHO">Rascunho (Oculto na Loja)</option>
                  <option value="ESGOTADO">Esgotado</option>
                </select>
              </div>

              {/* Seção de Precificação Completa e Editável */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <DollarSign className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">Valores e Precificação (Editáveis)</span>
                      <span className="text-[10px] text-neutral-400 block">
                        Você pode alterar livremente qualquer valor abaixo ou clicar para sugerir pela margem.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const cost = Number(editingProduct.costPrice) || 0;
                      const p = calculatePricing(cost, editingProduct.brand || 'Mini GT');
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: p.salePrice,
                        downPaymentValue: p.downPaymentValue,
                        balanceValue: p.balanceValue,
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Calcular valores sugeridos pela fórmula oficial com base no custo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sugerir Valores pela Margem</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Preço de Custo */}
                  <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-white/5">
                    <label className="text-neutral-400 text-[11px] font-semibold flex items-center justify-between">
                      <span>Preço Custo</span>
                      <span className="text-[9px] text-neutral-500">Fornecedor</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={editingProduct.costPrice !== undefined ? editingProduct.costPrice : ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setEditingProduct({
                            ...editingProduct,
                            costPrice: val,
                          });
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-2 py-1.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="text-[9px] text-neutral-500 block">Custo de aquisição</span>
                  </div>

                  {/* Preço de Venda */}
                  <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-amber-500/30">
                    <label className="text-amber-300 text-[11px] font-bold flex items-center justify-between">
                      <span>Preço Venda</span>
                      <span className="text-[9px] text-amber-400/80">Valor Total</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={editingProduct.salePrice !== undefined ? editingProduct.salePrice : ''}
                        onChange={(e) => {
                          const sale = parseFloat(e.target.value) || 0;
                          const currentDown = editingProduct.downPaymentValue || 0;
                          const newDown = currentDown > sale ? Math.round(sale * 0.15) : currentDown;
                          const balance = Math.max(0, Math.round((sale - newDown) * 100) / 100);
                          setEditingProduct({
                            ...editingProduct,
                            salePrice: sale,
                            downPaymentValue: newDown,
                            balanceValue: balance,
                          });
                        }}
                        className="w-full bg-black/60 border border-amber-500/50 rounded-lg pl-9 pr-2 py-1.5 text-amber-300 font-bold font-mono text-xs focus:border-amber-400 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="text-[9px] text-neutral-400 block">Preço ao cliente na loja</span>
                  </div>

                  {/* Valor de Entrada */}
                  <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-emerald-500/20">
                    <label className="text-emerald-300 text-[11px] font-bold flex items-center justify-between">
                      <span>Valor Entrada</span>
                      <span className="text-[9px] text-emerald-400/80">Sinal Reserva</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingProduct.downPaymentValue !== undefined ? editingProduct.downPaymentValue : ''}
                        onChange={(e) => {
                          const down = parseFloat(e.target.value) || 0;
                          const sale = editingProduct.salePrice || 0;
                          const balance = Math.max(0, Math.round((sale - down) * 100) / 100);
                          setEditingProduct({
                            ...editingProduct,
                            downPaymentValue: down,
                            balanceValue: balance,
                          });
                        }}
                        className="w-full bg-black/60 border border-emerald-500/40 rounded-lg pl-9 pr-2 py-1.5 text-emerald-300 font-bold font-mono text-xs focus:border-emerald-400 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="text-[9px] text-neutral-400 block">Sinal da pré-venda</span>
                  </div>

                  {/* Saldo Restante */}
                  <div className="space-y-1 bg-neutral-900/60 p-2.5 rounded-xl border border-white/5">
                    <label className="text-neutral-300 text-[11px] font-semibold flex items-center justify-between">
                      <span>Saldo Restante</span>
                      <span className="text-[9px] text-neutral-500">Na Chegada</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingProduct.balanceValue !== undefined ? editingProduct.balanceValue : ''}
                        onChange={(e) => {
                          const bal = parseFloat(e.target.value) || 0;
                          setEditingProduct({
                            ...editingProduct,
                            balanceValue: bal,
                          });
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-2 py-1.5 text-neutral-200 font-mono text-xs focus:border-white/30 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="text-[9px] text-neutral-500 block">Quitado na entrega</span>
                  </div>
                </div>

                {/* Resumo de Lucro Bruto Estimado */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Lucro Bruto:
                      <strong className="text-emerald-400 font-mono ml-1">
                        {formatMoney(Math.max(0, (editingProduct.salePrice || 0) - (editingProduct.costPrice || 0)))}
                      </strong>
                    </span>
                    {editingProduct.costPrice && editingProduct.costPrice > 0 ? (
                      <span className="text-neutral-400 font-mono text-[10px] bg-neutral-800 px-2 py-0.5 rounded">
                        Margem: {Math.round((((editingProduct.salePrice || 0) - editingProduct.costPrice) / editingProduct.costPrice) * 100)}%
                      </span>
                    ) : null}
                  </div>

                  <div className="text-[10px] text-neutral-400 font-mono">
                    Entrada ({formatMoney(editingProduct.downPaymentValue || 0)}) + Saldo ({formatMoney(editingProduct.balanceValue || 0)}) ={' '}
                    <span className="text-white font-bold">
                      {formatMoney((editingProduct.downPaymentValue || 0) + (editingProduct.balanceValue || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descrição do Produto */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300 font-semibold">Descrição Comercial & Técnica</label>
                  <button
                    type="button"
                    onClick={() => {
                      const costPrice = Number(editingProduct.costPrice) || 0;
                      const salePrice = Number(editingProduct.salePrice) || 0;
                      const downPaymentValue = Number(editingProduct.downPaymentValue) || 0;
                      const balanceValue =
                        editingProduct.balanceValue !== undefined && editingProduct.balanceValue !== null
                          ? Number(editingProduct.balanceValue)
                          : Math.max(0, Math.round((salePrice - downPaymentValue) * 100) / 100);

                      const desc = generateStandardDescription({
                        brand: editingProduct.brand || 'Mini GT',
                        scale: editingProduct.scale || '1:64',
                        vehicleModel: editingProduct.vehicleModel || '',
                        colorOrEdition: editingProduct.colorOrEdition || '',
                        code: editingProduct.mgtCode || editingProduct.sku,
                        isPreOrder: editingProduct.isPreOrder ?? true,
                        material: editingProduct.material,
                        packagingType: editingProduct.packagingType,
                        arrivalForecast: editingProduct.arrivalForecast,
                        salePrice,
                        downPaymentValue,
                        balanceValue,
                        stockLimit: Number(editingProduct.stock) || 12,
                      });
                      setEditingProduct({ ...editingProduct, description: desc });
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                  >
                    ⚡ Regenerar texto com valores atuais
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Deixe em branco para usar a descrição gerada automaticamente..."
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white font-mono text-[11px]"
                />
              </div>

              {/* Checkbox Destaque Hero da Home */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.setAsHero || editingProduct.isFeatured)}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      setAsHero: e.target.checked,
                      isFeatured: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Definir esta miniatura como DESTAQUE PRINCIPAL da página inicial (Hero da Home)
                </span>
              </label>

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
