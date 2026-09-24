'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Flame,
  Zap,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parâmetros extraídos da URL
  const paramBrand = searchParams.get('marca') || '';
  const paramPreVenda = searchParams.get('preVenda') || '';
  const paramBusca = searchParams.get('busca') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState(paramBusca);
  const [selectedBrand, setSelectedBrand] = useState(paramBrand);
  const [selectedScale, setSelectedScale] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(
    paramPreVenda === 'true' ? 'PRE_VENDA' : paramPreVenda === 'false' ? 'PRONTA_ENTREGA' : ''
  );
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sincronização automática e reativa com alterações na URL (ex: clique no Header de marcas)
  useEffect(() => {
    setSelectedBrand(paramBrand);
    if (paramPreVenda === 'true') {
      setSelectedStatus('PRE_VENDA');
    } else if (paramPreVenda === 'false') {
      setSelectedStatus('PRONTA_ENTREGA');
    } else if (paramPreVenda === '') {
      setSelectedStatus('');
    }
    if (paramBusca !== undefined) {
      setSearchTerm(paramBusca);
    }
  }, [paramBrand, paramPreVenda, paramBusca]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const brands = [
    'Mini GT',
    'Kaido House',
    'Tarmac Works',
    'BBR Models',
    'Pop Race',
    'Inno64',
    'Hot Wheels',
  ];
  const scales = ['1:64', '1:43', '1:18'];

  // Função para selecionar marca sincronizando com a URL
  const handleBrandClick = (b: string) => {
    const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
    const nextBrand = isSelected ? '' : b;
    setSelectedBrand(nextBrand);

    const params = new URLSearchParams(searchParams.toString());
    if (nextBrand) {
      params.set('marca', nextBrand);
    } else {
      params.delete('marca');
    }
    router.push(`/catalogo?${params.toString()}`);
  };

  // Função para selecionar status sincronizando com a URL
  const handleStatusClick = (statusType: 'PRE_VENDA' | 'PRONTA_ENTREGA') => {
    const isSelected = selectedStatus === statusType;
    const nextStatus = isSelected ? '' : statusType;
    setSelectedStatus(nextStatus);

    const params = new URLSearchParams(searchParams.toString());
    if (nextStatus === 'PRE_VENDA') {
      params.set('preVenda', 'true');
    } else if (nextStatus === 'PRONTA_ENTREGA') {
      params.set('preVenda', 'false');
    } else {
      params.delete('preVenda');
    }
    router.push(`/catalogo?${params.toString()}`);
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedScale('');
    setSelectedStatus('');
    setMaxPrice(350);
    setSearchTerm('');
    router.push('/catalogo');
  };

  // Lista filtrada e ordenada
  const filteredProducts = products
    .filter((p) => {
      // Filtro de Marca com normalização flexível (ex: 'BBR' vs 'BBR Models', 'Mini GT' etc.)
      if (selectedBrand) {
        const normSelected = selectedBrand.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normBrand = (p.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const match =
          normBrand === normSelected ||
          normBrand.includes(normSelected) ||
          normSelected.includes(normBrand);
        if (!match) return false;
      }

      // Filtro de Escala
      if (selectedScale && p.scale !== selectedScale) return false;

      // Filtro de Status / Disponibilidade
      if (selectedStatus && p.status !== selectedStatus) return false;

      // Filtro de Preço Máximo
      if (p.salePrice > maxPrice) return false;

      // Filtro de Busca por Texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesModel = p.vehicleModel.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesMgt = p.mgtCode && p.mgtCode.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        if (!matchesTitle && !matchesModel && !matchesSku && !matchesMgt && !matchesBrand) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.salePrice - b.salePrice;
      if (sortBy === 'price_desc') return b.salePrice - a.salePrice;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              Catálogo de Colecionáveis
            </h1>
            {selectedBrand && (
              <span className="bg-amber-400 text-neutral-950 font-black text-xs uppercase px-2.5 py-0.5 rounded-full shadow">
                {selectedBrand}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Encontre réplicas de precisão 1:64 para pronta-entrega e reserve os próximos lotes oficiais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-xs font-semibold text-white"
          >
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Filtros</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-neutral-900">
                Mais Recentes
              </option>
              <option value="price_asc" className="bg-neutral-900">
                Menor Preço
              </option>
              <option value="price_desc" className="bg-neutral-900">
                Maior Preço
              </option>
              <option value="name" className="bg-neutral-900">
                Nome (A-Z)
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block space-y-6 bg-neutral-900/60 border border-white/10 p-5 rounded-2xl h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" /> Filtros
            </span>
            {(selectedBrand || selectedScale || selectedStatus || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Search within catalog */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Busca Rápida</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: BMW, Ferrari, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Availability / Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">Disponibilidade</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => handleStatusClick('PRE_VENDA')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-colors ${
                  selectedStatus === 'PRE_VENDA'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Pré-vendas
                </span>
              </button>

              <button
                onClick={() => handleStatusClick('PRONTA_ENTREGA')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-colors ${
                  selectedStatus === 'PRONTA_ENTREGA'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Pronta-Entrega
                </span>
              </button>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">Marca</label>
            <div className="space-y-1 text-xs">
              {brands.map((b) => {
                const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
                return (
                  <button
                    key={b}
                    onClick={() => handleBrandClick(b)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>{b}</span>
                    {isSelected && <span className="text-[10px] text-amber-400">●</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">Escala</label>
            <div className="flex gap-2">
              {scales.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedScale(selectedScale === s ? '' : s)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border font-mono ${
                    selectedScale === s
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-semibold">Preço Máximo:</span>
              <span className="font-mono text-amber-400 font-bold">R$ {maxPrice.toFixed(0)},00</span>
            </div>
            <input
              type="range"
              min={50}
              max={350}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>
              Exibindo <strong className="text-white">{filteredProducts.length}</strong> miniaturas
              {selectedBrand && (
                <span>
                  {' '}
                  da marca <strong className="text-amber-400">{selectedBrand}</strong>
                </span>
              )}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs">Carregando catálogo...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-12 text-center space-y-4">
              <p className="text-sm text-neutral-400">Nenhuma miniatura encontrada com os filtros selecionados.</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative w-80 bg-neutral-950 border-l border-white/10 h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-bold text-sm text-white">Filtros</span>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <button
                onClick={clearFilters}
                className="w-full py-2 rounded-lg border border-white/10 text-neutral-300 hover:text-white"
              >
                Limpar Filtros
              </button>

              <div className="space-y-2">
                <label className="font-semibold text-neutral-300">Marca</label>
                <div className="space-y-1">
                  {brands.map((b) => {
                    const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
                    return (
                      <button
                        key={b}
                        onClick={() => {
                          handleBrandClick(b);
                          setIsFilterDrawerOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded border block ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'border-white/5 text-neutral-400'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full py-2.5 rounded-lg bg-amber-600 text-white font-bold"
              >
                Ver Resultados ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Carregando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
