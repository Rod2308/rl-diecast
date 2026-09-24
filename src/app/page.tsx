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
import { getLiveProducts, getLiveHeroProduct } from '@/lib/products-service';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const products = await getLiveProducts({ onlyPublished: true });
  const heroProduct = await getLiveHeroProduct(products);

  const heroImage =
    heroProduct?.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';

  const preOrders = products.filter((p) => p.isPreOrder && p.status === 'PRE_VENDA').slice(0, 8);
  const readyToShip = products.filter((p) => !p.isPreOrder && p.status === 'PRONTA_ENTREGA').slice(0, 4);

  const brands = [
    { name: 'Mini GT', count: 'Oficial Brasil', link: '/catalogo?marca=Mini+GT' },
    { name: 'Kaido House', count: 'Pro Street Series', link: '/catalogo?marca=Kaido+House' },
    { name: 'Tarmac Works', count: 'Global Motorsports', link: '/catalogo?marca=Tarmac+Works' },
    { name: 'BBR Models', count: 'Resin & Diecast Luxo', link: '/catalogo?marca=BBR+Models' },
    { name: 'Pop Race', count: 'Tuning Japonês', link: '/catalogo?marca=Pop+Race' },
    { name: 'Hot Wheels', count: 'Premium & Boulevard', link: '/catalogo?marca=Hot+Wheels' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section Showroom */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f1422] via-[#090c13] to-[#080a0f] border-b border-white/10 py-12 md:py-24">
        {/* Glowing atmospheric background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide shadow-inner">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                <span>LOTES OFICIAIS MINI GT BRASIL DISPONÍVEIS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                A Garagem Mais Desejada em{' '}
                <span className="gold-gradient-text block mt-1">
                  Escala 1:64
                </span>
              </h1>

              <p className="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Garanta réplicas de precisão das maiores lendas automotivas. Pré-vendas com reserva facilitada a partir de R$ 15,00 e quitação apenas quando o produto chegar ao Brasil.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/pre-vendas"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-105 cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-neutral-950" />
                  <span>Explorar Pré-Vendas Oficiais</span>
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                </Link>

                <Link
                  href="/pronta-entrega"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#111520] hover:bg-[#161c2b] border border-white/15 hover:border-amber-400/40 text-neutral-100 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/40" />
                  <span>Ver Pronta-Entrega</span>
                </Link>
              </div>

              {/* Collector Micro-Perks */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-xs text-neutral-400 text-left">
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

            {/* Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-b from-[#151a29] to-[#0c1017] border border-white/15 p-5 shadow-2xl shadow-black/90 overflow-hidden group hover:border-amber-400/40 transition-all">
                <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black text-[10px] uppercase px-3 py-1 rounded-md shadow-lg shadow-amber-500/30">
                  {heroProduct?.isPreOrder ? 'Destaque Pré-venda' : 'Destaque Pronta-Entrega'}
                </div>

                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-[#07090e] flex items-center justify-center relative border border-white/5">
                  <img
                    src={heroImage}
                    alt={heroProduct?.title || 'Miniatura Colecionável'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span className="text-[10px] font-mono text-amber-300 uppercase font-black tracking-wider">
                      {heroProduct?.brand || 'Mini GT'} • {heroProduct?.mgtCode || heroProduct?.sku || '1:64'}
                    </span>
                    <h4 className="text-white font-black text-lg line-clamp-1">{heroProduct?.title || 'Miniatura Colecionável'}</h4>
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
                            R$ {(heroProduct?.salePrice || 0).toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-neutral-300 text-[11px]">Envio Imediato</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-[#080a0f] border border-white/10 text-xs">
                  <span className="text-neutral-300">
                    {heroProduct?.isPreOrder ? 'Reserve com valor reduzido:' : 'Compre com envio imediato:'}
                  </span>
                  <Link
                    href={heroProduct ? `/produto/${heroProduct.slug}` : '/catalogo'}
                    className="font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5"
                  >
                    Ver Detalhes do Lote <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Grid Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Marcas Especializadas
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Explore os catálogos dos maiores fabricantes mundiais</p>
          </div>
          <Link href="/catalogo" className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1">
            Ver Catálogo Geral <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {brands.map((b) => (
            <Link
              key={b.name}
              href={b.link}
              className="p-4 rounded-2xl bg-gradient-to-b from-[#121623] to-[#0c0f17] hover:from-[#181f33] hover:to-[#0f1422] border border-white/10 hover:border-amber-400/50 transition-all text-center group shadow-md"
            >
              <span className="block font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                {b.name}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">{b.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Open Pre-Orders Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
              <Flame className="w-5 h-5 fill-amber-400/40" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Pré-Vendas Abertas</h2>
              <p className="text-xs text-neutral-400">Garanta seu modelo no lote oficial pagando apenas a entrada</p>
            </div>
          </div>
          <Link
            href="/pre-vendas"
            className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
          >
            Ver Todas ({products.filter(p => p.isPreOrder && p.status === 'PRE_VENDA').length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {preOrders.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* How Pre-Order Works Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1c1811] via-[#121623] to-[#0a0d14] border border-amber-400/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-1 space-y-2">
              <span className="text-[10px] font-mono uppercase font-black text-amber-400 tracking-wider">
                TRANSPARÊNCIA TOTAL
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Como Funciona a Pré-Venda na RL Diecast?
              </h3>
              <p className="text-xs text-neutral-400">
                Sistema seguro e planejado para o colecionador nunca perder um lote raro.
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

      {/* Ready to Ship Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-400/15 text-emerald-400 border border-emerald-400/30">
              <Zap className="w-5 h-5 fill-emerald-400/40" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Pronta-Entrega</h2>
              <p className="text-xs text-neutral-400">Modelos em estoque físico com despacho em até 24 horas úteis</p>
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

      {/* Minha Garagem Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#121623] via-[#0d1017] to-[#121623] border border-white/15 p-6 sm:p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-3.5 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Car className="w-4 h-4 text-amber-400" />
              <span>EXCLUSIVO PARA COLECIONADORES</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">Organize a sua coleção com a &quot;Minha Garagem&quot;</h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Marque as miniaturas que você já tem, monte a sua lista de desejos e cadastre os modelos que está procurando. Mantenha seu inventário 1:64 organizado em um só lugar.
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
    </div>
  );
}
