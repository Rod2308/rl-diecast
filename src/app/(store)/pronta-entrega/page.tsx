import React from 'react';
import Link from 'next/link';
import { Zap, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { getLiveProducts } from '@/lib/products-service';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProntaEntregaPage() {
  const readyProducts = await getLiveProducts({
    onlyPublished: true,
    isPreOrder: false,
    status: 'PRONTA_ENTREGA',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c1613] via-[#0d1017] to-[#080a0f] border border-emerald-500/40 p-6 sm:p-10 space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>ESTOQUE FÍSICO NO BRASIL • ENVIO IMEDIATO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Pronta-Entrega Colecionáveis 1:64
        </h1>
        <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
          Miniaturas conferidas e prontas para despacho em até 24 horas úteis. Embalagem blindada com plástico bolha reforçado e caixa dupla para proteção total do seu colecionável.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Despacho diário via Correios (PAC/SEDEX) e Transportadoras</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Produtos novos, lacrados na embalagem original</span>
          </div>
        </div>
      </div>

      {/* Grid of Ready-to-ship products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-white/10 pb-3">
          <span>{readyProducts.length} miniaturas prontas para envio imediato</span>
          <span className="text-emerald-400 font-semibold">Pix com 5% de desconto à vista</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {readyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
