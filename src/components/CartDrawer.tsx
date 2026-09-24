'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    toggleDownPayment,
    totalItems,
    totalPaidNow,
    totalBalanceLater,
  } = useCart();

  if (!isCartOpen) return null;

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e111a] border-l border-white/10 text-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wide">Seu Carrinho</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto text-neutral-500">
                  <Flame className="w-8 h-8 text-neutral-600" />
                </div>
                <h4 className="font-bold text-neutral-300">Seu carrinho está vazio</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Explore os lançamentos de Mini GT, Kaido House e garanta suas miniaturas na pré-venda!
                </p>
                <Link
                  href="/catalogo"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-semibold text-xs text-white"
                >
                  Ver Catálogo Completo
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const img =
                  item.product.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
                const downPayment = item.product.downPaymentValue || 15;
                const balance = item.product.salePrice - downPayment;

                return (
                  <div
                    key={item.product.id}
                    className="p-3 bg-neutral-900/80 border border-white/5 rounded-xl space-y-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={img}
                        alt={item.product.title}
                        className="w-16 h-16 rounded-lg object-cover bg-neutral-950 border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-semibold text-xs text-white truncate">{item.product.title}</h5>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-neutral-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono font-semibold">
                          {item.product.brand} • {item.product.scale}
                        </span>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-white/10 rounded bg-neutral-950">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold font-mono text-white">
                              {formatMoney(
                                (item.product.isPreOrder && item.payDownPaymentOnly
                                  ? downPayment
                                  : item.product.salePrice) * item.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pre-Order Toggle for Down Payment vs Full Payment */}
                    {item.product.isPreOrder && (
                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Condição de Pré-Venda:
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => toggleDownPayment(item.product.id, true)}
                            className={`p-1.5 rounded-lg border text-left transition-all ${
                              item.payDownPaymentOnly
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-neutral-950 border-white/10 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            <span>Pagar Entrada:</span>
                            <span className="block font-mono text-xs">{formatMoney(downPayment)}</span>
                            <span className="text-[9px] text-neutral-400">Saldo na chegada</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleDownPayment(item.product.id, false)}
                            className={`p-1.5 rounded-lg border text-left transition-all ${
                              !item.payDownPaymentOnly
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : 'bg-neutral-950 border-white/10 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            <span>Pagar Total:</span>
                            <span className="block font-mono text-xs">{formatMoney(item.product.salePrice)}</span>
                            <span className="text-[9px] text-neutral-400">Sem saldo pendente</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-white/10 bg-neutral-950/80 space-y-3">
              {totalBalanceLater > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div className="text-neutral-300">
                    <span className="font-bold text-amber-300 block">Saldo Restante na Chegada:</span>
                    <span className="text-[10px] text-neutral-400">Cobrado quando a miniatura chegar</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm">{formatMoney(totalBalanceLater)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-300 font-semibold">Total a Pagar Agora:</span>
                <span className="text-xl font-black font-mono text-emerald-400">{formatMoney(totalPaidNow)}</span>
              </div>

              <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Reserva garantida com recibo oficial RL Diecast</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
              >
                <span>Avançar para o Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
