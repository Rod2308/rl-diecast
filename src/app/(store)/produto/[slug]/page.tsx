'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  Zap,
  ShieldCheck,
  Calendar,
  Share2,
  Heart,
  Car,
  Truck,
  Check,
  Package,
  AlertCircle,
  HelpCircle,
  Minus,
  Plus,
  ShoppingCart,
  Layers,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useAdminAuth } from '@/lib/admin-auth-context';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const { isAdmin } = useAdminAuth();
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin on-site actions
  const [settingAsHero, setSettingAsHero] = useState(false);
  const [heroSuccessMessage, setHeroSuccessMessage] = useState(false);

  // Gallery
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Pre-order option: Pagar Entrada vs Pagar Total
  const [payDownPaymentOnly, setPayDownPaymentOnly] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Freight calculation
  const [cep, setCep] = useState('');
  const [shippingQuotes, setShippingQuotes] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedGarage, setSavedGarage] = useState(false);

  const handleSetThisProductAsHero = async () => {
    if (!product) return;
    setSettingAsHero(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroProductId: product.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao definir produto como principal.');
      }
      setHeroSuccessMessage(true);
      setTimeout(() => setHeroSuccessMessage(false), 5000);
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setSettingAsHero(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        if (data.products) {
          const found = data.products.find(
            (p: Product) => p.slug === slug || p.id === slug || p.sku.toLowerCase() === slug.toLowerCase()
          );
          if (found) {
            setProduct(found);
            const mainImg = found.images?.[0]?.url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
            setSelectedImage(mainImg);

            // Related products (same brand or scale)
            const others = data.products
              .filter((p: Product) => p.id !== found.id && (p.brand === found.brand || p.isPreOrder === found.isPreOrder))
              .slice(0, 4);
            setRelated(others);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadData();
    }
  }, [slug]);

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cep || cep.replace(/\D/g, '').length < 8) return;
    setLoadingShipping(true);
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep, subtotal: product ? product.salePrice * quantity : 0 }),
      });
      const data = await res.json();
      if (data.quotes) {
        setShippingQuotes(data.quotes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: `Confira essa miniatura na RL Diecast: ${product?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleToggleGarage = async (status: 'TENHO' | 'QUERO_COMPRAR' | 'FAVORITO') => {
    if (!product) return;
    try {
      await fetch('/api/garage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          status,
          userNote: 'Adicionado pela página do produto',
        }),
      });
      setSavedGarage(true);
      setTimeout(() => setSavedGarage(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, product.isPreOrder ? payDownPaymentOnly : false);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, product.isPreOrder ? payDownPaymentOnly : false);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-neutral-400">
        <p className="text-sm">Carregando detalhes da miniatura...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Miniatura não encontrada</h2>
        <p className="text-xs text-neutral-400">O produto pode ter sido arquivado ou a URL está incorreta.</p>
        <Link href="/catalogo" className="inline-block px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-xs">
          Voltar para o Catálogo
        </Link>
      </div>
    );
  }

  const downPayment = product.downPaymentValue || 15;
  const balance = product.salePrice - downPayment;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-white">
          Início
        </Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-white">
          Catálogo
        </Link>
        <span>/</span>
        <Link href={`/catalogo?marca=${encodeURIComponent(product.brand)}`} className="hover:text-white">
          {product.brand}
        </Link>
        <span>/</span>
        <span className="text-amber-400 truncate max-w-xs font-semibold">{product.title}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 w-full bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-4">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center rounded-xl"
            />
            {product.isPreOrder ? (
              <span className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-amber-500 text-black font-extrabold text-xs uppercase px-3 py-1 rounded-md shadow-lg">
                <Flame className="w-3.5 h-3.5" /> Pré-Venda Oficial
              </span>
            ) : (
              <span className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-emerald-500 text-black font-extrabold text-xs uppercase px-3 py-1 rounded-md shadow-lg">
                <Zap className="w-3.5 h-3.5" /> Pronta-Entrega
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.url ? 'border-amber-500 scale-105' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Action pills under gallery */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-white/10 text-xs">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleGarage('FAVORITO')}
                className="flex items-center gap-1 text-neutral-300 hover:text-red-400 transition-colors"
                title="Favoritar"
              >
                <Heart className="w-4 h-4 text-red-400" />
                <span>Favoritar</span>
              </button>
              <span className="text-neutral-600">|</span>
              <button
                onClick={() => handleToggleGarage('QUERO_COMPRAR')}
                className="flex items-center gap-1 text-neutral-300 hover:text-amber-400 transition-colors"
                title="Adicionar à Garagem"
              >
                <Car className="w-4 h-4 text-amber-400" />
                <span>Salvar na Garagem</span>
              </button>
            </div>
          </div>
          {savedGarage && (
            <div className="p-2 rounded bg-amber-500/20 text-amber-300 text-xs text-center border border-amber-500/30">
              Miniatura atualizada na sua Garagem com sucesso!
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Box (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 border border-white/10 uppercase tracking-wider font-mono">
                {product.brand}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-white/10 font-mono">
                {product.scale}
              </span>
              {product.mgtCode && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                  Código: {product.mgtCode}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{product.title}</h1>

            <p className="text-xs text-neutral-400">
              SKU: <span className="font-mono text-neutral-200">{product.sku}</span> | Estoque:{' '}
              <span className="text-emerald-400 font-semibold">{product.stock} unidades disponíveis</span>
            </p>
          </div>

          {/* AÇÕES DE ADMINISTRADOR NA PÁGINA DO PRODUTO (Apenas Admin Autenticado) */}
          {isAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                    Controle do Administrador
                  </span>
                </div>
                <Link
                  href="/admin/produtos"
                  className="text-[11px] text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>Painel de Produtos</span>
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                </Link>
              </div>

              {heroSuccessMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✅ Esta miniatura agora é o Produto Principal da Home!</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleSetThisProductAsHero}
                  disabled={settingAsHero}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{settingAsHero ? 'Salvando...' : 'Definir como Produto Principal da Home'}</span>
                </button>

                <Link
                  href="/admin/banners"
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-white/10"
                >
                  <span>Ver CMS da Home</span>
                </Link>
              </div>
            </div>
          )}

          {/* Pre-order or Ready to ship pricing block */}
          {product.isPreOrder ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#12151e] to-neutral-900 border border-amber-500/40 space-y-4 shadow-xl">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-neutral-400">Valor Total do Colecionável:</span>
                  <div className="text-2xl font-black text-white font-mono">{formatMoney(product.salePrice)}</div>
                </div>

                {product.arrivalForecast && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Previsão de Chegada
                    </span>
                    <span className="text-sm font-black text-amber-300">{product.arrivalForecast}</span>
                  </div>
                )}
              </div>

              {/* Pre-order Purchase Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Escolha como deseja reservar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Pagar Entrada */}
                  <button
                    type="button"
                    onClick={() => setPayDownPaymentOnly(true)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      payDownPaymentOnly
                        ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500'
                        : 'bg-neutral-950 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">Pagar Entrada Agora</span>
                      <span className="text-[10px] bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded">
                        RECOMENDADO
                      </span>
                    </div>
                    <div className="text-xl font-black text-white font-mono mt-1">{formatMoney(downPayment)}</div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Saldo de {formatMoney(balance)} pago quando a miniatura chegar ao Brasil.
                    </p>
                  </button>

                  {/* Option 2: Pagar Valor Integral */}
                  <button
                    type="button"
                    onClick={() => setPayDownPaymentOnly(false)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      !payDownPaymentOnly
                        ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500'
                        : 'bg-neutral-950 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-300">Pagar Valor Total</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">Sem saldo pendente</span>
                    </div>
                    <div className="text-xl font-black text-white font-mono mt-1">
                      {formatMoney(product.salePrice)}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Pedido 100% quitado. Envio automático assim que o lote for conferido.
                    </p>
                  </button>
                </div>
              </div>

              {/* Quantity & CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center border border-white/15 rounded-xl bg-neutral-950 px-3 py-2 w-full sm:w-auto justify-between sm:justify-start gap-4">
                  <span className="text-xs text-neutral-400">Qtd:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 rounded text-neutral-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-white text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 rounded text-neutral-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                  <span>
                    Reservar Pré-Venda ({formatMoney((payDownPaymentOnly ? downPayment : product.salePrice) * quantity)})
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-4">
              <div>
                <span className="text-xs text-neutral-400">Preço Especial para Colecionadores:</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {formatMoney(product.salePrice * 0.95)}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">no Pix à vista (5% OFF)</span>
                </div>
                <div className="text-xs text-neutral-400 mt-1 font-mono">
                  ou {formatMoney(product.salePrice)} em até 6x sem juros de {formatMoney(product.salePrice / 6)}
                </div>
              </div>

              {/* Quantity & CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center border border-white/15 rounded-xl bg-neutral-950 px-3 py-2 w-full sm:w-auto justify-between sm:justify-start gap-4">
                  <span className="text-xs text-neutral-400">Qtd:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 rounded text-neutral-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-white text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 rounded text-neutral-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-neutral-950" />
                  <span>Comprar Agora</span>
                </button>
              </div>
            </div>
          )}

          {/* Shipping Simulator (Correios / Melhor Envio) */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Simular Frete e Prazo de Entrega</span>
            </div>

            <form onSubmit={handleCalculateShipping} className="flex gap-2">
              <input
                type="text"
                placeholder="Informe seu CEP (00000-000)"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                maxLength={9}
                className="flex-1 bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={loadingShipping}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-white/10 cursor-pointer"
              >
                {loadingShipping ? 'Calculando...' : 'Calcular'}
              </button>
            </form>

            {shippingQuotes.length > 0 && (
              <div className="pt-2 space-y-2 border-t border-white/5">
                {shippingQuotes.map((q) => (
                  <div key={q.serviceId} className="flex items-center justify-between text-xs p-2 rounded bg-neutral-950">
                    <div>
                      <span className="font-semibold text-white block">{q.serviceName}</span>
                      <span className="text-[10px] text-neutral-400">Prazo: {q.deliveryDays}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">
                      {q.price === 0 ? 'GRÁTIS' : formatMoney(q.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Sheet & Collector Description */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-white/10 pt-10">
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Descrição Técnica & Condições do Colecionável
          </h2>

          <div className="prose prose-invert max-w-none text-neutral-300 text-sm whitespace-pre-line leading-relaxed bg-neutral-900/40 p-6 rounded-2xl border border-white/10 font-sans">
            {product.description}
          </div>
        </div>

        {/* Pre-Order Policies Accordion / Info Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Garantias RL Diecast
            </h3>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Embalagem Blindada:</strong> Caixas rígidas, sem amassar cartelas ou blisters.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Origem Garantida:</strong> Lotes importados diretamente dos fabricantes oficiais.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso de Chegada:</strong> Notificação instantânea por e-mail e WhatsApp para quitação do saldo.
                </span>
              </li>
            </ul>

            <Link
              href="/regras-pre-venda"
              className="inline-block text-xs text-amber-400 hover:text-amber-300 underline font-semibold pt-2"
            >
              Leia o regulamento completo de pré-vendas
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="border-t border-white/10 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              Outros Lançamentos de Colecionador
            </h3>
            <Link href="/catalogo" className="text-xs text-amber-400 font-bold hover:text-amber-300">
              Ver mais na loja →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Buy Bar for Mobile */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-[#0c0e14]/95 border-t border-white/15 p-3 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-neutral-400 block">
            {product.isPreOrder && payDownPaymentOnly ? 'Entrada:' : 'Total:'}
          </span>
          <span className="font-black text-white font-mono text-base">
            {formatMoney((product.isPreOrder && payDownPaymentOnly ? downPayment : product.salePrice) * quantity)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
        >
          {product.isPreOrder ? <Flame className="w-4 h-4 fill-neutral-950 text-neutral-950" /> : <ShoppingCart className="w-4 h-4 text-neutral-950" />}
          <span>{product.isPreOrder ? 'Reservar Pré-Venda' : 'Comprar Agora'}</span>
        </button>
      </div>
    </div>
  );
}
