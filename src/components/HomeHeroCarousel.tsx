'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Banner, Product } from '@/lib/types';

interface HomeHeroCarouselProps {
  banners: Banner[];
  heroProduct?: Product | null;
}

export default function HomeHeroCarousel({ banners, heroProduct }: HomeHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Se nenhum banner estiver cadastrado, monta um banner padrão baseado no heroProduct
  const activeBanners: Banner[] =
    banners && banners.length > 0
      ? banners
      : [
          {
            id: 'default-hero',
            title: 'A Garagem Mais Desejada em Escala 1:64',
            subtitle: 'Lotes Oficiais Mini GT Brasil Disponíveis',
            description:
              'Garanta réplicas de precisão das maiores lendas automotivas. Pré-vendas com reserva facilitada a partir de R$ 15,00 e quitação apenas quando o produto chegar ao Brasil.',
            tag: 'LOTES OFICIAIS MINI GT BRASIL DISPONÍVEIS',
            desktopImageUrl:
              heroProduct?.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
            buttonText: 'Explorar Pré-Vendas Oficiais',
            buttonUrl: '/pre-vendas',
            buttonActive: true,
            secondaryButtonText: 'Ver Pronta-Entrega',
            secondaryButtonUrl: '/pronta-entrega',
            secondaryButtonActive: true,
            displayOrder: 1,
            active: true,
          },
        ];

  // Auto-play do carrossel quando há mais de 1 banner
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  const current = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const showcaseProductImage =
    heroProduct?.images?.find((img) => img.isMain)?.url ||
    heroProduct?.images?.[0]?.url ||
    (heroProduct as any)?.imageUrl ||
    current.desktopImageUrl ||
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#0f1422] via-[#090c13] to-[#080a0f] border-b border-white/10 py-10 md:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Background Banner Image com Blend Suave */}
      {current.desktopImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 transition-opacity duration-1000 pointer-events-none filter blur-sm"
          style={{ backgroundImage: `url(${current.desktopImageUrl})` }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Copy Comercial do Banner Atual */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left transition-all duration-500">
            {current.tag && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide shadow-inner">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                <span>{current.tag}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              {current.title}
              {current.subtitle && (
                <span className="gold-gradient-text block mt-1 text-2xl sm:text-3xl lg:text-4xl font-extrabold">
                  {current.subtitle}
                </span>
              )}
            </h1>

            {current.description && (
              <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {current.description}
              </p>
            )}

            {/* Ações / Botões do Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {current.buttonActive !== false && current.buttonText && current.buttonUrl && (
                <Link
                  href={current.buttonUrl}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-105 cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-neutral-950" />
                  <span>{current.buttonText}</span>
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                </Link>
              )}

              {current.secondaryButtonActive !== false &&
                current.secondaryButtonText &&
                current.secondaryButtonUrl && (
                  <Link
                    href={current.secondaryButtonUrl}
                    className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#111520] hover:bg-[#161c2b] border border-white/15 hover:border-amber-400/40 text-neutral-100 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/40" />
                    <span>{current.secondaryButtonText}</span>
                  </Link>
                )}
            </div>

            {/* Micro Vantagens da Loja */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs text-neutral-400 text-left">
              <div className="p-3 rounded-xl bg-[#0e121a]/80 border border-white/5">
                <span className="block font-black text-white text-base font-mono">100%</span>
                <span className="text-[11px] text-neutral-300">Originais & Lacrados</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e121a]/80 border border-white/5">
                <span className="block font-black text-amber-300 text-base font-mono">R$ 15</span>
                <span className="text-[11px] text-neutral-300">Entrada mínima pré-venda</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e121a]/80 border border-white/5">
                <span className="block font-black text-emerald-400 text-base font-mono">5% OFF</span>
                <span className="text-[11px] text-neutral-300">Desconto à vista no Pix</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase do Banner / Miniatura */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#151a29] to-[#0c1017] border border-white/15 p-5 shadow-2xl shadow-black/90 overflow-hidden group hover:border-amber-400/40 transition-all">
              <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black text-[10px] uppercase px-3 py-1 rounded-md shadow-lg shadow-amber-500/30">
                {heroProduct?.isPreOrder ? 'Destaque Pré-venda' : 'Destaque Showroom'}
              </div>

              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-[#07090e] flex items-center justify-center relative border border-white/5">
                {/* Imagem do Produto Principal */}
                <img
                  src={showcaseProductImage}
                  alt={heroProduct?.title || current.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="text-[10px] font-mono text-amber-300 uppercase font-black tracking-wider">
                    {heroProduct ? `${heroProduct.brand} • ${heroProduct.mgtCode || heroProduct.sku}` : 'RL DIECAST EXCLUSIVE'}
                  </span>
                  <h4 className="text-white font-black text-lg line-clamp-1">
                    {heroProduct?.title || current.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    {heroProduct?.isPreOrder ? (
                      <>
                        <span className="text-amber-300 font-extrabold font-mono">
                          Entrada: R$ {(heroProduct.downPaymentValue || 0).toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-neutral-300 text-[11px]">
                          Chegada: {heroProduct.arrivalForecast || '2026'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-emerald-400 font-extrabold font-mono">
                          R$ {(heroProduct?.salePrice || 119.9).toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-neutral-300 text-[11px]">Envio Imediato</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-[#080a0f] border border-white/10 text-xs">
                <span className="text-neutral-300">
                  {heroProduct?.isPreOrder ? 'Reserve com entrada reduzida:' : 'Acesse o produto:'}
                </span>
                <Link
                  href={heroProduct ? `/produto/${heroProduct.slug}` : current.buttonUrl || '/catalogo'}
                  className="font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
                >
                  <span>{heroProduct?.isPreOrder ? 'Garantir Reserva' : 'Ver Detalhes'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Controles do Carrossel (caso haja mais de 1 banner ativo) */}
        {activeBanners.length > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              {activeBanners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Banner ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-amber-400/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
                aria-label="Banner anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-neutral-400">
                {currentIndex + 1} / {activeBanners.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-amber-400/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
                aria-label="Próximo banner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
