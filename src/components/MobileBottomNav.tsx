'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Flame, Car, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  const isCurrent = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2">
      <div className="grid grid-cols-5 items-center text-center">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 ${
            isCurrent('/') ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </Link>

        <Link
          href="/catalogo"
          className={`flex flex-col items-center gap-1 py-1 ${
            isCurrent('/catalogo') ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Catálogo</span>
        </Link>

        <Link
          href="/pre-vendas"
          className={`flex flex-col items-center gap-1 py-1 ${
            isCurrent('/pre-vendas') ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-[10px]">Pré-Venda</span>
        </Link>

        <Link
          href="/garagem"
          className={`flex flex-col items-center gap-1 py-1 ${
            isCurrent('/garagem') ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px]">Garagem</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 py-1 text-neutral-400 hover:text-white relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black font-extrabold text-[9px] px-1 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">Carrinho</span>
        </button>
      </div>
    </div>
  );
}
