'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Flame, Zap, Calendar, Heart, Check, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isSavedGarage, setIsSavedGarage] = useState(false);
  const [addedEffect, setAddedEffect] = useState(false);

  const mainImage =
    product.images && product.images.length > 0
      ? product.images.find((i) => i.isMain)?.url || product.images[0].url
      : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.isPreOrder);
    setAddedEffect(true);
    setTimeout(() => setAddedEffect(false), 1500);
  };

  const handleToggleGarage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch('/api/garage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          status: 'FAVORITO',
          userNote: 'Adicionado pelo catálogo',
        }),
      });
      setIsSavedGarage(!isSavedGarage);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group relative bg-gradient-to-b from-[#131826] via-[#0f131e] to-[#0a0d14] border border-white/10 hover:border-amber-400/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between hover:-translate-y-1">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.isPreOrder ? (
          <span className="flex items-center gap-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-lg shadow-amber-500/30">
            <Flame className="w-3 h-3 fill-neutral-950" />
            Pré-venda
          </span>
        ) : (
          <span className="flex items-center gap-1 bg-gradient-to-r from-emerald-400 to-emerald-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-lg shadow-emerald-500/30">
            <Zap className="w-3 h-3 fill-neutral-950" />
            Pronta-Entrega
          </span>
        )}

        {product.mgtCode && (
          <span className="bg-[#080a0f]/90 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30">
            {product.mgtCode}
          </span>
        )}
      </div>

      {/* Action Buttons top right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={handleToggleGarage}
          className={`p-2 rounded-xl backdrop-blur-md transition-all ${
            isSavedGarage
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-black/60 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-white/10'
          }`}
          title="Salvar na Minha Garagem / Favoritos"
        >
          <Heart className={`w-3.5 h-3.5 ${isSavedGarage ? 'fill-white' : ''}`} />
        </button>
      </div>

      <Link href={`/produto/${product.slug}`} className="block">
        {/* Product Image Display Showroom */}
        <div className="relative aspect-4/3 w-full bg-[#07090e] overflow-hidden flex items-center justify-center p-3 border-b border-white/5">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent opacity-50 pointer-events-none" />
        </div>

        {/* Product Metadata */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="text-amber-400 font-extrabold uppercase tracking-wider font-mono">
              {product.brand}
            </span>
            <span className="font-mono bg-[#161c2b] px-2 py-0.5 rounded text-neutral-300 border border-white/10 text-[10px] font-bold">
              {product.scale}
            </span>
          </div>

          <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-amber-300 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Pricing & Pre-Order Conditions */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            {product.isPreOrder ? (
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-neutral-400">Total do Lote:</span>
                  <span className="text-sm font-bold text-white font-mono">{formatMoney(product.salePrice)}</span>
                </div>

                <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
                  <div>
                    <span className="block text-[9px] uppercase font-black text-amber-400 tracking-wider">
                      Reserve com Entrada
                    </span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      {formatMoney(product.downPaymentValue || 15)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-neutral-400">Saldo na chegada:</span>
                    <span className="text-xs font-bold text-neutral-200 font-mono">
                      {formatMoney(product.balanceValue || product.salePrice - (product.downPaymentValue || 15))}
                    </span>
                  </div>
                </div>

                {product.arrivalForecast && (
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 pt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Previsão: <strong className="text-amber-300">{product.arrivalForecast}</strong></span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <span className="block text-[10px] text-neutral-400">Preço Especial (Pix):</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {formatMoney(product.salePrice * 0.95)}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono line-through">
                    {formatMoney(product.salePrice)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Card Action Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={handleQuickAdd}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            addedEffect
              ? 'bg-emerald-500 text-neutral-950 font-black'
              : product.isPreOrder
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-md shadow-amber-500/25 hover:shadow-amber-500/40'
              : 'bg-[#161c2b] hover:bg-[#1f273c] text-white border border-white/10 hover:border-amber-400/50'
          }`}
        >
          {addedEffect ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Adicionado ao Carrinho!</span>
            </>
          ) : product.isPreOrder ? (
            <>
              <Flame className="w-4 h-4 fill-neutral-950" />
              <span>Reservar Pré-Venda</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Comprar Agora</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
