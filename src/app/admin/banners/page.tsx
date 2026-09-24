'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Calendar,
  Upload,
  Link as LinkIcon,
  Save,
  Flame,
  Layout,
  Star,
  ExternalLink,
  AlertCircle,
  Search,
  Check,
  Package,
} from 'lucide-react';
import { Banner, HomeSection, Product } from '@/lib/types';

export default function AdminBannersAndCMSPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'banners' | 'sections' | 'featured'>('hero');

  // Hero Product state (Single source of truth para o topo da Home)
  const [heroProductId, setHeroProductId] = useState('');
  const [selectedNewHeroId, setSelectedNewHeroId] = useState('');
  const [savingHero, setSavingHero] = useState(false);
  const [heroFeedback, setHeroFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [heroSearch, setHeroSearch] = useState('');

  // Banners state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Home Sections state
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [savingSections, setSavingSections] = useState(false);

  // Featured Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');

  useEffect(() => {
    loadBanners();
    loadSections();
    loadProductsAndSettings();
  }, []);

  const loadBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch('/api/banners?admin=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.banners) setBanners(data.banners);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBanners(false);
    }
  };

  const loadSections = async () => {
    setLoadingSections(true);
    try {
      const res = await fetch('/api/home-sections', { cache: 'no-store' });
      const data = await res.json();
      if (data.sections) setSections(data.sections);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSections(false);
    }
  };

  const loadProductsAndSettings = async () => {
    try {
      const [resProd, resSet] = await Promise.all([
        fetch('/api/products?admin=true', { cache: 'no-store' }),
        fetch('/api/settings', { cache: 'no-store' }),
      ]);
      const dataProd = await resProd.json();
      const dataSet = await resSet.json();

      let activeHeroId = '';
      if (dataSet.settings?.heroProductId) {
        activeHeroId = dataSet.settings.heroProductId;
      }

      if (dataProd.products) {
        setProducts(dataProd.products);
        if (!activeHeroId) {
          const heroProd = dataProd.products.find((p: any) => p.technicalSpecs?.isHeroMain);
          if (heroProd) activeHeroId = heroProd.id;
        }
      }

      if (activeHeroId) {
        setHeroProductId(activeHeroId);
        setSelectedNewHeroId((prev) => prev || activeHeroId);
      }

      if (dataSet.settings?.featuredProductIds) {
        setFeaturedIds(dataSet.settings.featuredProductIds);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveHero = async () => {
    if (!selectedNewHeroId) {
      setHeroFeedback({ type: 'error', message: 'Selecione um produto para definir como Produto Principal.' });
      return;
    }
    setSavingHero(true);
    setHeroFeedback(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroProductId: selectedNewHeroId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao salvar produto principal no Supabase.');
      }
      setHeroProductId(selectedNewHeroId);
      const chosen = products.find((p) => p.id === selectedNewHeroId || p.sku === selectedNewHeroId);
      setHeroFeedback({
        type: 'success',
        message: `✅ Sucesso! "${chosen?.title || selectedNewHeroId}" agora é o Produto Principal da Home. O Supabase e o cache da Home foram atualizados em tempo real.`,
      });
      await loadProductsAndSettings();
    } catch (err: any) {
      setHeroFeedback({
        type: 'error',
        message: `❌ Erro ao salvar produto principal: ${err.message}`,
      });
    } finally {
      setSavingHero(false);
    }
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'desktop') setUploadingDesktop(true);
    else setUploadingMobile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (target === 'desktop') {
          setEditingBanner((prev) => ({
            ...prev,
            desktopImageUrl: data.url,
            desktopStoragePath: data.storagePath,
          }));
        } else {
          setEditingBanner((prev) => ({
            ...prev,
            mobileImageUrl: data.url,
            mobileStoragePath: data.storagePath,
          }));
        }
      } else {
        alert(data.error || 'Erro no upload da imagem');
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      if (target === 'desktop') setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  // Banner Actions
  const openNewBannerModal = () => {
    setEditingBanner({
      title: 'Novidades RL Diecast',
      subtitle: 'Confira os novos lotes e pré-vendas exclusivas',
      description: 'Miniaturas oficiais 1:64 em metal diecast com pneus de borracha e acabamento de alto nível.',
      tag: 'DESTAQUE SHOWROOM',
      desktopImageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'Ver Catálogo',
      buttonUrl: '/catalogo',
      buttonActive: true,
      secondaryButtonText: 'Ver Pronta-Entrega',
      secondaryButtonUrl: '/pronta-entrega',
      secondaryButtonActive: true,
      displayOrder: banners.length + 1,
      active: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title || !editingBanner.desktopImageUrl) {
      alert('Por favor, informe pelo menos o título e a imagem desktop do banner.');
      return;
    }

    try {
      const isExisting = Boolean(editingBanner.id);
      const res = await fetch('/api/banners', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner),
      });
      const data = await res.json();
      if (data.success) {
        setIsBannerModalOpen(false);
        setEditingBanner(null);
        loadBanners();
      } else {
        alert(data.error || 'Erro ao salvar banner');
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Deseja realmente excluir este banner da página inicial?')) return;
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadBanners();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBannerActive = async (banner: Banner) => {
    try {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, active: !banner.active }),
      });
      const data = await res.json();
      if (data.success) {
        loadBanners();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateBanner = async (banner: Banner) => {
    const copy = {
      ...banner,
      id: undefined,
      title: `${banner.title} (Cópia)`,
      displayOrder: banners.length + 1,
    };
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      });
      const data = await res.json();
      if (data.success) {
        loadBanners();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Section Ordering and Title Editing
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Atualiza displayOrder
    newSections.forEach((s, idx) => {
      s.displayOrder = idx + 1;
    });

    setSections(newSections);
  };

  const handleSaveSections = async () => {
    setSavingSections(true);
    try {
      const res = await fetch('/api/home-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Estrutura e títulos da Página Inicial atualizados com sucesso!');
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setSavingSections(false);
    }
  };

  // Featured Products Save
  const handleSaveFeatured = async () => {
    setSavingFeatured(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroProductId,
          featuredProductIds: featuredIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Produtos em Destaque salvos com sucesso!');
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setSavingFeatured(false);
    }
  };

  const toggleFeaturedProduct = (id: string) => {
    setFeaturedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentHero =
    products.find((p) => p.id === heroProductId || p.sku === heroProductId) ||
    products.find((p) => (p.technicalSpecs as any)?.isHeroMain) ||
    null;

  const previewHero =
    products.find((p) => p.id === selectedNewHeroId || p.sku === selectedNewHeroId) || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-6 h-6 text-amber-500" />
            Conteúdo & Página Inicial (CMS)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Administre o produto principal do topo, banners do carrossel, títulos e a ordem das seções da Home sem mexer no código.
          </p>
        </div>

        {activeTab === 'banners' && (
          <button
            onClick={openNewBannerModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Banner</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'hero'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Produto Principal da Home</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'banners'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banners & Carrossel ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Estrutura das Seções da Home</span>
        </button>

        <button
          onClick={() => setActiveTab('featured')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'featured'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Produtos em Destaque ({featuredIds.length})</span>
        </button>
      </div>

      {/* TAB 0: PRODUTO PRINCIPAL DA HOME (HERO SHOWCASE) */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Header explicativo */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0f1422] to-amber-500/5 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-[10px] tracking-wider uppercase">
                  Destaque Máximo da Home
                </span>
                <span className="text-xs text-neutral-400">Regra: 1 único produto ativo por vez</span>
              </div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Produto Principal da Página Inicial
              </h2>
              <p className="text-xs text-neutral-300 max-w-2xl">
                Este é o produto em evidência absoluta no topo da Home (no card fixo ao lado do banner principal).
                Ele exibe a foto real do produto, título, SKU, preço e botão de reserva/compra direta.
              </p>
            </div>

            <button
              onClick={handleSaveHero}
              disabled={savingHero || !selectedNewHeroId || selectedNewHeroId === heroProductId}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{savingHero ? 'Salvando no Supabase...' : 'Confirmar & Salvar Produto Principal'}</span>
            </button>
          </div>

          {/* Feedback Alerta */}
          {heroFeedback && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                heroFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {heroFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{heroFeedback.message}</span>
            </div>
          )}

          {/* Grid de 2 Colunas: Produto Atual x Selecionar Novo Produto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUNA 1: PRODUTO ATUAL ATIVO NA HOME */}
            <div className="p-6 rounded-2xl bg-[#0f1422] border border-white/15 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    Produto Principal Atual (Ativo no Site)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  ● ATIVO NA HOME
                </span>
              </div>

              {currentHero ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-neutral-950/60 p-4 rounded-xl border border-white/10">
                    <div className="w-28 h-28 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                      <img
                        src={
                          currentHero.images?.find((i) => i.isMain)?.url ||
                          currentHero.images?.[0]?.url ||
                          (currentHero as any).imageUrl ||
                          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={currentHero.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {currentHero.sku}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {currentHero.brand || 'RL Diecast'} • 1:64
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            currentHero.status === 'PRE_VENDA'
                              ? 'bg-amber-500/20 text-amber-300'
                              : currentHero.status === 'PRONTA_ENTREGA'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          {currentHero.status === 'PRE_VENDA'
                            ? 'Pré-Venda'
                            : currentHero.status === 'PRONTA_ENTREGA'
                            ? 'Pronta-Entrega'
                            : currentHero.status}
                        </span>
                      </div>

                      <h4 className="text-white font-extrabold text-sm line-clamp-2">
                        {currentHero.title}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-400 font-mono">
                          R$ {currentHero.salePrice.toFixed(2).replace('.', ',')}
                        </span>
                        {currentHero.isPreOrder && currentHero.downPaymentValue > 0 && (
                          <span className="text-[11px] text-amber-300 font-medium">
                            (Sinal: R$ {currentHero.downPaymentValue.toFixed(2).replace('.', ',')})
                          </span>
                        )}
                      </div>

                      <div className="pt-1">
                        <a
                          href={`/produto/${currentHero.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition-all underline underline-offset-4"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver página do produto na loja ↗</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                    💡 Este produto é alimentado diretamente pelo Supabase e está configurado como destaque principal. Para alterá-lo, escolha um produto ao lado e clique em Salvar.
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-neutral-950/40 border border-white/10 space-y-2">
                  <Package className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-neutral-300 text-xs font-semibold">Nenhum produto principal definido ainda.</p>
                  <p className="text-neutral-500 text-[11px]">Selecione um produto na coluna ao lado para ativá-lo como destaque na Home.</p>
                </div>
              )}
            </div>

            {/* COLUNA 2: SELETOR DE NOVO PRODUTO & PREVIEW AO VIVO */}
            <div className="p-6 rounded-2xl bg-[#0f1422] border border-white/15 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    Alterar Produto Principal da Home
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-400">
                  {products.length} produtos disponíveis
                </span>
              </div>

              {/* Seletor dropdown direto */}
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold text-xs block">
                  Escolha o produto no catálogo:
                </label>
                <select
                  value={selectedNewHeroId}
                  onChange={(e) => {
                    setSelectedNewHeroId(e.target.value);
                    setHeroFeedback(null);
                  }}
                  className="w-full bg-neutral-950 border border-white/20 rounded-xl p-3 text-white text-xs font-medium focus:border-amber-400 focus:outline-none"
                >
                  <option value="" disabled>-- Selecione um produto para a Home --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.title} (R$ {p.salePrice.toFixed(2).replace('.', ',')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo de filtro rápido caso queira buscar */}
              <div className="space-y-1.5">
                <label className="text-neutral-400 text-[11px] block">
                  Ou digite para filtrar por nome, modelo ou SKU:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Ex: Skyline, R34, BMW, LBWK, MGT00..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {heroSearch.trim() && (
                  <div className="max-h-40 overflow-y-auto space-y-1 pt-1">
                    {products
                      .filter((p) => {
                        const q = heroSearch.toLowerCase();
                        return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
                      })
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedNewHeroId(p.id);
                            setHeroFeedback(null);
                          }}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            selectedNewHeroId === p.id
                              ? 'bg-amber-500/20 border-amber-400/50 text-white'
                              : 'bg-neutral-900/60 border-white/5 hover:bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          <span className="font-mono text-amber-300 text-[10px] mr-2">{p.sku}</span>
                          <span className="line-clamp-1 flex-1 font-semibold">{p.title}</span>
                          <span className="text-[10px] font-mono text-neutral-400 ml-2">
                            R$ {p.salePrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* PRÉVIA VISUAL DO NOVO PRODUTO ESCOLHIDO (ANTES DE SALVAR) */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  Pré-visualização do Produto Escolhido (Como aparecerá na Home):
                </span>

                {previewHero ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-amber-400/40 space-y-3 shadow-xl relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider">
                        Prévia
                      </span>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={
                            previewHero.images?.find((i) => i.isMain)?.url ||
                            previewHero.images?.[0]?.url ||
                            (previewHero as any).imageUrl ||
                            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={previewHero.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <span className="font-mono text-[10px] font-bold text-amber-300 block">
                          {previewHero.sku}
                        </span>
                        <h5 className="text-white text-xs font-bold line-clamp-2">
                          {previewHero.title}
                        </h5>
                        <div className="flex items-baseline gap-2">
                          <span className="text-amber-400 font-mono font-bold text-sm">
                            R$ {previewHero.salePrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Status: <strong className="text-white">{previewHero.status}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                      <div className="text-[10px] text-neutral-400">
                        {selectedNewHeroId === heroProductId ? (
                          <span className="text-emerald-400 font-medium">✓ Este já é o produto ativo atualmente.</span>
                        ) : (
                          <span className="text-amber-300 font-medium">⚠ Pronto para substituir o produto atual.</span>
                        )}
                      </div>

                      <button
                        onClick={handleSaveHero}
                        disabled={savingHero || !selectedNewHeroId || selectedNewHeroId === heroProductId}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:cursor-not-allowed transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingHero ? 'Salvando...' : 'Salvar como Principal'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-950/60 border border-dashed border-white/15 text-center text-xs text-neutral-500">
                    Selecione um produto acima para ver a pré-visualização.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: BANNERS & CARROSSEL */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          {loadingBanners ? (
            <div className="p-8 text-center text-xs text-neutral-400">Carregando banners da Home...</div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-900/50 border border-white/10 space-y-3">
              <ImageIcon className="w-8 h-8 text-neutral-500 mx-auto" />
              <h3 className="text-white font-bold text-sm">Nenhum banner cadastrado</h3>
              <p className="text-xs text-neutral-400">
                Crie seu primeiro banner promocional para a página inicial com fotos, título e botão.
              </p>
              <button
                onClick={openNewBannerModal}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
              >
                + Criar Banner Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {banners.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                    b.active
                      ? 'bg-[#0f1422] border-white/15 hover:border-amber-400/40'
                      : 'bg-neutral-950/70 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Imagem Preview */}
                    <div className="w-28 h-18 rounded-xl bg-neutral-900 overflow-hidden border border-white/10 shrink-0 relative">
                      <img
                        src={b.desktopImageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-amber-300 font-bold">
                        #{b.displayOrder}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {b.tag && (
                          <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30">
                            {b.tag}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {b.active ? 'Ativo na Home' : 'Desativado / Rascunho'}
                        </span>
                      </div>

                      <h3 className="text-white font-extrabold text-sm">{b.title}</h3>
                      {b.subtitle && <p className="text-neutral-400 text-xs">{b.subtitle}</p>}

                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-1">
                        <span>Botão: <strong className="text-amber-300">{b.buttonText || 'Sem CTA'}</strong> ({b.buttonUrl})</span>
                        {b.startsAt && <span>Início: {new Date(b.startsAt).toLocaleDateString()}</span>}
                        {b.endsAt && <span>Fim: {new Date(b.endsAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleBannerActive(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        b.active
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {b.active ? 'Desativar' : 'Ativar'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingBanner(b);
                        setIsBannerModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                      title="Editar Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicateBanner(b)}
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                      title="Duplicar Banner"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all cursor-pointer"
                      title="Excluir Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ESTRUTURA DAS SEÇÕES DA HOME */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-white/10">
            <div>
              <h2 className="text-white font-bold text-sm">Controle de Seções & Títulos</h2>
              <p className="text-xs text-neutral-400">
                Ative ou desative seções, reordene a exibição e altere os títulos públicos da página inicial.
              </p>
            </div>
            <button
              onClick={handleSaveSections}
              disabled={savingSections}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSections ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 rounded-xl bg-[#0f1422] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-neutral-800 font-mono text-xs font-bold flex items-center justify-center text-neutral-300">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                      Seção: {sec.sectionKey}
                    </span>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSections((prev) =>
                          prev.map((s) => (s.id === sec.id ? { ...s, title: val } : s))
                        );
                      }}
                      className="w-full sm:w-80 bg-neutral-950 border border-white/15 rounded-lg px-2.5 py-1 text-white text-xs font-bold focus:border-amber-400"
                    />
                    <input
                      type="text"
                      placeholder="Subtítulo ou descrição da seção..."
                      value={sec.subtitle || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSections((prev) =>
                          prev.map((s) => (s.id === sec.id ? { ...s, subtitle: val } : s))
                        );
                      }}
                      className="w-full sm:w-80 bg-neutral-950 border border-white/10 rounded-lg px-2.5 py-1 text-neutral-300 text-[11px] focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={sec.active}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSections((prev) =>
                          prev.map((s) => (s.id === sec.id ? { ...s, active: checked } : s))
                        );
                      }}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className={sec.active ? 'text-emerald-400' : 'text-neutral-500'}>
                      {sec.active ? 'Visível' : 'Oculta'}
                    </span>
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 cursor-pointer"
                      title="Mover para Cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 cursor-pointer"
                      title="Mover para Baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUTOS EM DESTAQUE NA HOME */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-white/10">
            <div>
              <h2 className="text-white font-bold text-sm">Seleção Manual de Destaques</h2>
              <p className="text-xs text-neutral-400">
                Escolha quais miniaturas aparecem na seção &quot;Miniaturas em Destaque&quot; na Home.
              </p>
            </div>
            <button
              onClick={handleSaveFeatured}
              disabled={savingFeatured}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingFeatured ? 'Salvando...' : 'Salvar Destaques'}</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Filtrar por nome, SKU ou modelo..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products
              .filter((p) => {
                if (!searchProduct) return true;
                const q = searchProduct.toLowerCase();
                return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
              })
              .map((prod) => {
                const isSelected = featuredIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleFeaturedProduct(prod.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/50 shadow-md'
                        : 'bg-neutral-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // controlado pelo clique no card
                      className="w-4 h-4 accent-amber-500 rounded shrink-0 pointer-events-none"
                    />
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.title}
                      className="w-12 h-12 rounded-lg object-cover bg-black shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-amber-300 block">{prod.sku}</span>
                      <h4 className="text-white text-xs font-bold line-clamp-1">{prod.title}</h4>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        R$ {prod.salePrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE BANNER COM PREVIEW AO VIVO */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e121b] border border-white/20 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                {editingBanner.id ? 'Editar Banner da Home' : 'Criar Novo Banner'}
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* PREVIEW AO VIVO DO BANNER */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Pré-Visualização ao Vivo na Home:
              </span>
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-r from-[#121623] to-[#0c0f17] p-6 shadow-xl">
                {editingBanner.desktopImageUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs"
                    style={{ backgroundImage: `url(${editingBanner.desktopImageUrl})` }}
                  />
                )}
                <div className="relative z-10 space-y-3 max-w-lg">
                  {editingBanner.tag && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/40">
                      {editingBanner.tag}
                    </span>
                  )}
                  <h2 className="text-2xl font-black text-white">{editingBanner.title}</h2>
                  {editingBanner.subtitle && (
                    <p className="text-amber-300 text-sm font-semibold">{editingBanner.subtitle}</p>
                  )}
                  {editingBanner.description && (
                    <p className="text-neutral-300 text-xs line-clamp-2">{editingBanner.description}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {editingBanner.buttonActive && (
                      <span className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs">
                        {editingBanner.buttonText || 'Ver Catálogo'}
                      </span>
                    )}
                    {editingBanner.secondaryButtonActive && (
                      <span className="px-4 py-2 rounded-xl bg-neutral-800 text-white font-bold text-xs border border-white/20">
                        {editingBanner.secondaryButtonText || 'Pronta-Entrega'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Título Principal do Banner *</label>
                  <input
                    type="text"
                    required
                    value={editingBanner.title || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Subtítulo em Destaque</label>
                  <input
                    type="text"
                    value={editingBanner.subtitle || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Tag / Badge Superior</label>
                  <input
                    type="text"
                    placeholder="Ex: NOVIDADES MINI GT"
                    value={editingBanner.tag || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, tag: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Ordem no Carrossel</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBanner.displayOrder ?? 1}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, displayOrder: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Texto Descritivo do Banner</label>
                <textarea
                  rows={2}
                  value={editingBanner.description || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              {/* UPLOAD IMAGEM DESKTOP */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Imagem Desktop (Horizontal / Widescreen) *</span>
                  {uploadingDesktop && <span className="text-[11px] text-amber-400 animate-pulse">Enviando ao Storage...</span>}
                </div>
                <div className="flex gap-3 items-center">
                  <label className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload de Imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'desktop')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Ou cole a URL direta da imagem desktop..."
                    value={editingBanner.desktopImageUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, desktopImageUrl: e.target.value })}
                    className="flex-1 bg-neutral-900 border border-white/10 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* UPLOAD IMAGEM MOBILE */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Imagem Mobile (Vertical / Celular - Opcional)</span>
                  {uploadingMobile && <span className="text-[11px] text-amber-400 animate-pulse">Enviando ao Storage...</span>}
                </div>
                <div className="flex gap-3 items-center">
                  <label className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer border border-white/15">
                    <Upload className="w-4 h-4" />
                    <span>Upload Mobile</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'mobile')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="URL para smartphone (se vazio, usa a desktop adaptada)..."
                    value={editingBanner.mobileImageUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, mobileImageUrl: e.target.value })}
                    className="flex-1 bg-neutral-900 border border-white/10 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* BOTÕES / CTAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                  <span className="font-bold text-amber-400 text-xs block">Botão Principal (Dourado)</span>
                  <input
                    type="text"
                    placeholder="Texto (Ex: Ver Catálogo)"
                    value={editingBanner.buttonText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Destino (Ex: /catalogo)"
                    value={editingBanner.buttonUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonUrl: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white font-mono text-xs"
                  />
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBanner.buttonActive ?? true}
                      onChange={(e) => setEditingBanner({ ...editingBanner, buttonActive: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-neutral-300">Exibir este botão</span>
                  </label>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-white/10 space-y-2">
                  <span className="font-bold text-neutral-300 text-xs block">Botão Secundário</span>
                  <input
                    type="text"
                    placeholder="Texto (Ex: Pronta-Entrega)"
                    value={editingBanner.secondaryButtonText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, secondaryButtonText: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Destino (Ex: /pronta-entrega)"
                    value={editingBanner.secondaryButtonUrl || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, secondaryButtonUrl: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white font-mono text-xs"
                  />
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBanner.secondaryButtonActive ?? true}
                      onChange={(e) => setEditingBanner({ ...editingBanner, secondaryButtonActive: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-neutral-300">Exibir este botão</span>
                  </label>
                </div>
              </div>

              {/* AGENDAMENTO E STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-950 rounded-xl border border-white/10">
                <div className="space-y-1">
                  <label className="text-neutral-400 text-[11px] font-semibold">Início da Exibição</label>
                  <input
                    type="datetime-local"
                    value={editingBanner.startsAt?.slice(0, 16) || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, startsAt: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 text-[11px] font-semibold">Fim da Exibição</label>
                  <input
                    type="datetime-local"
                    value={editingBanner.endsAt?.slice(0, 16) || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, endsAt: e.target.value })}
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBanner.active ?? true}
                      onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="font-bold text-white text-xs">Banner Ativo na Home</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-500/25"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
