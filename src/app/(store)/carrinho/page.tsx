'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, Flame, ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    toggleDownPayment,
    subtotal,
    totalPaidNow,
    totalBalanceLater,
    totalItems,
  } = useCart();

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center mx-auto text-neutral-500">
          <ShoppingCart className="w-10 h-10 text-neutral-600" />
        </div>
        <h1 className="text-2xl font-black text-white">Seu carrinho está vazio</h1>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Adicione miniaturas prontas para envio ou garanta as próximas novidades em pré-venda.
        </p>
        <Link
          href="/catalogo"
          className="inline-block px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
        Carrinho de Compras ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const img =
              item.product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
            const downPayment = item.product.downPaymentValue || 15;
            const balance = item.product.salePrice - downPayment;

            return (
              <div
                key={item.product.id}
                className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4 shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={img}
                      alt={item.product.title}
                      className="w-20 h-20 rounded-xl object-cover bg-neutral-950 border border-white/10 shrink-0"
                    />
                    <div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                        {item.product.brand} • {item.product.scale}
                      </span>
                      <h3 className="font-bold text-sm text-white">{item.product.title}</h3>
                      {item.product.mgtCode && (
                        <span className="text-[10px] text-neutral-400 font-mono">
                          Código: {item.product.mgtCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-white/10 rounded-lg bg-neutral-950 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-neutral-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-mono font-bold text-white text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-neutral-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="font-mono font-bold text-white text-base">
                        {formatMoney(
                          (item.product.isPreOrder && item.payDownPaymentOnly
                            ? downPayment
                            : item.product.salePrice) * item.quantity
                        )}
                      </span>
                      <span className="block text-[10px] text-neutral-400">
                        {item.product.isPreOrder && item.payDownPaymentOnly ? 'Entrada reservada' : 'Valor integral'}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pre-Order Toggle Box */}
                {item.product.isPreOrder && (
                  <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-black/40 p-3 rounded-xl border border-amber-500/20">
                    <div>
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" /> Condição de Pré-Venda:
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Previsão de chegada no Brasil: <strong>{item.product.arrivalForecast}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDownPayment(item.product.id, true)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          item.payDownPaymentOnly
                            ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        Pagar Entrada ({formatMoney(downPayment)})
                      </button>

                      <button
                        onClick={() => toggleDownPayment(item.product.id, false)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          !item.payDownPaymentOnly
                            ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-neutral-900 text-neutral-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        Pagar Total ({formatMoney(item.product.salePrice)})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Order Summary (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-4 shadow-xl">
            <h2 className="font-bold text-base text-white uppercase tracking-wider border-b border-white/10 pb-3">
              Resumo do Pedido
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Subtotal dos produtos:</span>
                <span className="font-mono">{formatMoney(subtotal)}</span>
              </div>

              {totalBalanceLater > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Saldo na Chegada:</span>
                    <span className="font-mono text-sm">{formatMoney(totalBalanceLater)}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Você só pagará esse valor quando o lote chegar ao nosso estoque oficial.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-bold text-white pt-3 border-t border-white/10">
                <span>Total a Pagar Agora:</span>
                <span className="text-xl font-mono text-emerald-400">{formatMoney(totalPaidNow)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
            >
              <span>Continuar para o Checkout</span>
              <ArrowRight className="w-4 h-4 text-neutral-950" />
            </Link>

            <div className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Compra 100% protegida com recibo de reserva</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
