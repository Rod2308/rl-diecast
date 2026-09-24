'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Heart,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { GarageItem, GarageStatus } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

export default function GaragePage() {
  const { addToCart } = useCart();
  const [garageItems, setGarageItems] = useState<GarageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | GarageStatus>('ALL');

  useEffect(() => {
    loadGarage();
  }, []);

  const loadGarage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/garage');
      const data = await res.json();
      if (data.garage) {
        setGarageItems(data.garage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch(`/api/garage?id=${id}`, { method: 'DELETE' });
      setGarageItems((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (productId: string, status: GarageStatus) => {
    try {
      await fetch('/api/garage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status }),
      });
      loadGarage();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredItems = garageItems.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.status === activeTab;
  });

  const countTenho = garageItems.filter((i) => i.status === 'TENHO').length;
  const countQuero = garageItems.filter((i) => i.status === 'QUERO_COMPRAR').length;
  const countProcurando = garageItems.filter((i) => i.status === 'PROCURANDO').length;
  const countFavorito = garageItems.filter((i) => i.status === 'FAVORITO').length;

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const totalValueTenho = garageItems
    .filter((i) => i.status === 'TENHO' && i.product)
    .reduce((acc, curr) => acc + (curr.product?.salePrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-[#161a26] to-neutral-900 border border-white/10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 font-mono">
            <Car className="w-4 h-4" />
            <span>GARAGEM VIRTUAL DO COLECIONADOR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Minha Garagem 1:64</h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
            Organize suas miniaturas, cadastre os modelos que você já tem na estante, acompanhe sua lista de desejos e
            as peças que está procurando no mercado colecionável.
          </p>
        </div>

        {/* Garage Metrics */}
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center min-w-[120px]">
            <span className="block text-2xl font-black text-amber-400 font-mono">{countTenho}</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Na Garagem</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center min-w-[120px]">
            <span className="block text-2xl font-black text-emerald-400 font-mono">{formatMoney(totalValueTenho)}</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Valor Estimado</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Todos ({garageItems.length})
        </button>

        <button
          onClick={() => setActiveTab('TENHO')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'TENHO'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tenho na Coleção ({countTenho})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUERO_COMPRAR')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'QUERO_COMPRAR'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span>Quero Comprar ({countQuero})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROCURANDO')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PROCURANDO'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>Estou Procurando ({countProcurando})</span>
        </button>

        <button
          onClick={() => setActiveTab('FAVORITO')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'FAVORITO'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-red-400" />
          <span>Favoritos ({countFavorito})</span>
        </button>
      </div>

      {/* Grid of Garage Items */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center space-y-4 bg-neutral-900/40 rounded-3xl border border-white/5">
          <Car className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="font-bold text-white text-base">Nenhuma miniatura cadastrada nesta seção</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Navegue pelo catálogo e clique em &quot;Salvar na Garagem&quot; ou &quot;Favoritar&quot; para organizar suas miniaturas.
          </p>
          <Link
            href="/catalogo"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const product = item.product;
            if (!product) return null;
            const img =
              product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <img
                      src={img}
                      alt={product.title}
                      className="w-20 h-20 rounded-xl object-cover bg-neutral-950 border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                          {product.brand} • {product.scale}
                        </span>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                          title="Remover da Garagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-bold text-xs text-white line-clamp-2 mt-1">{product.title}</h4>
                      {product.mgtCode && (
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          Cód: {product.mgtCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.userNote && (
                    <div className="text-[11px] text-neutral-300 italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                      &quot;{item.userNote}&quot;
                    </div>
                  )}
                </div>

                {/* Status Switcher */}
                <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                  <span className="text-[10px] font-semibold text-neutral-400 block uppercase">
                    Status na sua Coleção:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      onClick={() => handleUpdateStatus(product.id, 'TENHO')}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.status === 'TENHO'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                          : 'bg-neutral-950 border-white/5 text-neutral-400'
                      }`}
                    >
                      Tenho
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(product.id, 'QUERO_COMPRAR')}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.status === 'QUERO_COMPRAR'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                          : 'bg-neutral-950 border-white/5 text-neutral-400'
                      }`}
                    >
                      Quero Comprar
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(product.id, 'PROCURANDO')}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.status === 'PROCURANDO'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500 font-bold'
                          : 'bg-neutral-950 border-white/5 text-neutral-400'
                      }`}
                    >
                      Procurando
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(product.id, 'FAVORITO')}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        item.status === 'FAVORITO'
                          ? 'bg-red-500/20 text-red-300 border-red-500 font-bold'
                          : 'bg-neutral-950 border-white/5 text-neutral-400'
                      }`}
                    >
                      Favorito
                    </button>
                  </div>

                  {/* Buy Button if in store */}
                  <div className="pt-2">
                    <button
                      onClick={() => addToCart(product, 1, product.isPreOrder)}
                      className="w-full py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-bold transition-all"
                    >
                      Comprar / Reservar na Loja ({formatMoney(product.salePrice)})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
