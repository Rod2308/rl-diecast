import React from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { getLiveProducts } from '@/lib/products-service';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PreVendasPage() {
  const preOrders = await getLiveProducts({
    onlyPublished: true,
    isPreOrder: true,
    status: 'PRE_VENDA',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#16130e] via-[#0d1017] to-[#080a0f] border border-amber-500/40 p-6 sm:p-10 space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>RESERVA DE LOTES OFICIAIS 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Pré-Vendas Exclusivas Diecast 1:64
        </h1>
        <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
          Garanta seu modelo antes que esgote no mercado secundário. Pague uma pequena entrada agora para reservar sua cota oficial e pague o saldo restante somente quando o produto chegar ao Brasil.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Reserva 100% garantida no distribuidor oficial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Previsões transparentes atualizadas em tempo real</span>
          </div>
        </div>
      </div>

      {/* Grid of Pre-Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-white/10 pb-3">
          <span>{preOrders.length} modelos com reserva aberta no momento</span>
          <Link href="/regras-pre-venda" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
            Entenda o sistema de entrada + saldo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {preOrders.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
