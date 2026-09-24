import React from 'react';
import Link from 'next/link';
import {
  Flame,
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  CreditCard,
  QrCode,
  Truck,
  Car,
  CheckCircle2,
} from 'lucide-react';
import {
  getLiveProducts,
  getLiveHeroProduct,
  getLiveBanners,
  getLiveHomeSections,
  getLiveCategories,
  getLiveSiteSettings,
} from '@/lib/products-service';
import ProductCard from '@/components/ProductCard';
import HomeHeroCarousel from '@/components/HomeHeroCarousel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [products, banners, sections, categories, settings] = await Promise.all([
    getLiveProducts({ onlyPublished: true }),
    getLiveBanners(true),
    getLiveHomeSections(),
    getLiveCategories(true),
    getLiveSiteSettings(),
  ]);

  const heroProduct = await getLiveHeroProduct(products);

  const preOrders = products.filter((p) => p.isPreOrder && p.status === 'PRE_VENDA').slice(0, 8);
  const readyToShip = products.filter((p) => !p.isPreOrder && p.status === 'PRONTA_ENTREGA').slice(0, 4);

  // Produtos destacados manualmente (ou os marcados com isFeatured)
  const featuredProducts = settings.featuredProductIds && settings.featuredProductIds.length > 0
    ? products.filter((p) => settings.featuredProductIds!.includes(p.id))
    : products.filter((p) => p.isFeatured && p.status !== 'RASCUNHO').slice(0, 4);

  // Ordena seções da Home conforme configuração no CMS
  const activeSections = sections
    .filter((s) => s.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Renderizadores de cada seção
  const renderSection = (sec: (typeof sections)[0]) => {
    switch (sec.sectionKey) {
      case 'hero':
        return (
          <HomeHeroCarousel
            key={sec.id}
            banners={banners}
            heroProduct={heroProduct}
          />
        );

      case 'categories':
        return (
          <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  {sec.title || 'Marcas & Categorias Especializadas'}
                </h2>
                {sec.subtitle && (
                  <p className="text-xs text-neutral-400 mt-0.5">{sec.subtitle}</p>
                )}
              </div>
              <Link
                href="/catalogo"
                className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
              >
                Ver Catálogo Geral <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogo?marca=${encodeURIComponent(cat.name)}`}
                  className="p-4 rounded-2xl bg-gradient-to-b from-[#121623] to-[#0c0f17] hover:from-[#181f33] hover:to-[#0f1422] border border-white/10 hover:border-amber-400/50 transition-all text-center group shadow-md"
                >
                  <span className="block font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    {cat.description || 'Coleção Oficial'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );

      case 'presales':
        return (
          <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
                  <Flame className="w-5 h-5 fill-amber-400/40" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">
                    {sec.title || 'Pré-Vendas Abertas'}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {sec.subtitle || 'Garanta seu modelo no lote oficial pagando apenas a entrada'}
                  </p>
                </div>
              </div>
              <Link
                href="/pre-vendas"
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
              >
                Ver Todas ({products.filter((p) => p.isPreOrder && p.status === 'PRE_VENDA').length}){' '}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {preOrders.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'how_it_works':
        return (
          <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#1c1811] via-[#121623] to-[#0a0d14] border border-amber-400/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="md:col-span-1 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-black text-amber-400 tracking-wider">
                    TRANSPARÊNCIA TOTAL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {sec.title || 'Como Funciona a Pré-Venda na RL Diecast?'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {sec.subtitle || 'Sistema seguro e planejado para o colecionador nunca perder um lote raro.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#090b10]/90 border border-white/10 space-y-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-400 text-neutral-950 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-xs text-white">Reserva com Entrada</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Pague apenas o valor de entrada (a partir de R$ 15,00) para garantir a sua unidade no lote oficial.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#090b10]/90 border border-white/10 space-y-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-400 text-neutral-950 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-xs text-white">Acompanhamento do Lote</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Acompanhe o lote na sua conta. Quando a miniatura chegar ao Brasil, você recebe notificação por e-mail e WhatsApp.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#090b10]/90 border border-white/10 space-y-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-400 text-neutral-950 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-bold text-xs text-white">Quitação & Despacho</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Quite o saldo via Pix ou cartão. Seu exemplar é embalado com proteção máxima e enviado no dia útil seguinte.
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'ready_to_ship':
        return (
          <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-400/15 text-emerald-400 border border-emerald-400/30">
                  <Zap className="w-5 h-5 fill-emerald-400/40" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">
                    {sec.title || 'Pronta-Entrega'}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {sec.subtitle || 'Modelos em estoque físico com despacho em até 24 horas úteis'}
                  </p>
                </div>
              </div>
              <Link
                href="/pronta-entrega"
                className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
              >
                Ver Pronta-Entrega <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {readyToShip.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'featured_products':
        if (!featuredProducts || featuredProducts.length === 0) return null;
        return (
          <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-5 h-5 fill-purple-400/40" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">
                    {sec.title || 'Miniaturas em Destaque'}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {sec.subtitle || 'Seleção especial dos modelos mais cobiçados pelos colecionadores'}
                  </p>
                </div>
              </div>
              <Link
                href="/catalogo"
                className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                Ver Catálogo Completo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'garage_cta':
        return (
          <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-r from-[#121623] via-[#0d1017] to-[#121623] border border-white/15 p-6 sm:p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-3.5 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold border border-amber-400/30">
                  <Car className="w-4 h-4 text-amber-400" />
                  <span>EXCLUSIVO PARA COLECIONADORES</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {sec.title || 'Organize a sua coleção com a "Minha Garagem"'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {sec.subtitle ||
                    'Marque as miniaturas que você já tem, monte a sua lista de desejos e cadastre os modelos que está procurando. Mantenha seu inventário 1:64 organizado em um só lugar.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/garagem"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 font-black text-xs text-neutral-950 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <Car className="w-4 h-4" />
                    <span>Acessar Minha Garagem</span>
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-5 rounded-2xl bg-[#080a0f] border border-white/10 text-center w-32 shadow-xl">
                  <span className="block text-3xl font-black text-amber-300 font-mono">1:64</span>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Especialidade</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#080a0f] border border-white/10 text-center w-32 shadow-xl">
                  <span className="block text-3xl font-black text-emerald-400 font-mono">100%</span>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Oficial</span>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {activeSections.map((sec) => renderSection(sec))}
    </div>
  );
}
