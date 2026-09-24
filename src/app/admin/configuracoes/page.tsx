'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Percent, ShieldCheck, DollarSign, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '@/lib/types';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('RL Diecast');
  const [contactEmail, setContactEmail] = useState('contato@rldiecast.com.br');
  const [contactPhone, setContactPhone] = useState('(11) 98765-4321');
  const [pixDiscountPercent, setPixDiscountPercent] = useState(5);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(299);
  const [bannerText, setBannerText] = useState(
    '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS • GARANTA COM ENTRADA A PARTIR DE R$ 15,00'
  );
  const [heroProductId, setHeroProductId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Carrega configurações atuais
      const resSettings = await fetch('/api/settings', { cache: 'no-store' });
      const dataSettings = await resSettings.json();
      if (dataSettings.settings) {
        const s = dataSettings.settings;
        if (s.storeName) setStoreName(s.storeName);
        if (s.contactEmail) setContactEmail(s.contactEmail);
        if (s.contactPhone) setContactPhone(s.contactPhone);
        if (s.pixDiscountPercent !== undefined) setPixDiscountPercent(s.pixDiscountPercent);
        if (s.freeShippingThreshold !== undefined) setFreeShippingThreshold(s.freeShippingThreshold);
        if (s.bannerText) setBannerText(s.bannerText);
        if (s.heroProductId) setHeroProductId(s.heroProductId);
      }

      // 2. Carrega lista de produtos para o seletor do Hero
      const resProducts = await fetch('/api/products?admin=true', { cache: 'no-store' });
      const dataProducts = await resProducts.json();
      if (dataProducts.products) {
        setProducts(dataProducts.products);
        if (!dataSettings.settings?.heroProductId && dataProducts.products.length > 0) {
          setHeroProductId(dataProducts.products[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          contactEmail,
          contactPhone,
          pixDiscountPercent,
          freeShippingThreshold,
          bannerText,
          heroProductId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    }
  };

  // Miniatura selecionada atualmente para o Hero
  const selectedHeroProduct = products.find((p) => p.id === heroProductId) || products[0];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          Configurações da Loja & Showroom Principal
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Escolha a miniatura destaque da página inicial, personalize fotos, banners e políticas comerciais.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* SEÇÃO PRINCIPAL: MINIATURA DESTAQUE DO HERO DA HOME */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#131826] to-[#0c1017] border border-amber-500/40 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Miniatura em Destaque na Página Inicial (Hero Showroom)
            </h2>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
              Ao Vivo na Home
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-neutral-300 font-semibold block">
              Selecione o Produto para o Card Principal da Home:
            </label>
            <select
              value={heroProductId}
              onChange={(e) => setHeroProductId(e.target.value)}
              className="w-full bg-neutral-950 border border-white/15 rounded-xl p-3 text-white text-xs font-medium focus:border-amber-400 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.brand}] {p.sku} • {p.title} ({p.isPreOrder ? 'Pré-venda' : 'Pronta-entrega'})
                </option>
              ))}
            </select>
          </div>

          {/* Preview Visual em Tempo Real do Card do Hero */}
          {selectedHeroProduct && (
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-neutral-950 border border-white/10 overflow-hidden shrink-0">
                <img
                  src={selectedHeroProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedHeroProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5 text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase">
                    {selectedHeroProduct.brand} • {selectedHeroProduct.mgtCode || selectedHeroProduct.sku}
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    {selectedHeroProduct.isPreOrder ? 'Pré-venda' : 'Pronta-entrega'}
                  </span>
                </div>
                <h4 className="text-white font-bold text-sm leading-snug">{selectedHeroProduct.title}</h4>
                <div className="flex items-center gap-4 text-xs font-mono text-neutral-300">
                  {selectedHeroProduct.isPreOrder ? (
                    <>
                      <span className="text-amber-300 font-bold">
                        Entrada: R$ {selectedHeroProduct.downPaymentValue.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        Chegada: {selectedHeroProduct.arrivalForecast || '2026'}
                      </span>
                    </>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      Preço: R$ {selectedHeroProduct.salePrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 block pt-1">
                  💡 Dica: Para trocar a foto ou o título deste modelo, acesse a aba{' '}
                  <strong className="text-white">Produtos</strong> e clique no botão de editar (ícone do lápis).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* General Store Info */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">Identidade da Loja</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Nome da Loja</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">E-mail de Contato e Cobranças</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">WhatsApp de Atendimento</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Banner Superior de Destaque</label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Commercial Policies */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" /> Descontos e Frete Grátis
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Desconto à vista no Pix (%)</label>
              <input
                type="number"
                value={pixDiscountPercent}
                onChange={(e) => setPixDiscountPercent(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Valor Mínimo para Frete Grátis (R$)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {saved && (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Configurações salvas e aplicadas à Home!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-7 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-600/30 cursor-pointer transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
