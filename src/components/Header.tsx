'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  Car,
  Bell,
  SlidersHorizontal,
  Flame,
  Zap,
  ShieldCheck,
  User,
  Menu,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAdminAuth } from '@/lib/admin-auth-context';

export default function Header() {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const { isAdmin, openLoginModal } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?busca=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080a0f]/95 backdrop-blur-xl border-b border-white/10 text-white">
      {/* Top Bar de Avisos com Alto Contraste Ouro Racing */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 text-xs font-black py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Flame className="w-3.5 h-3.5 fill-black animate-pulse" />
        <span>PRÉ-VENDAS 2026/2027 MINI GT BRASIL • RESERVE COM ENTRADA FACILITADA A PARTIR DE R$ 15,00</span>
        <span className="hidden md:inline bg-neutral-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded ml-1">
          PIX COM 5% OFF
        </span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo RL Diecast com Identidade Ouro e Carbono */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1.5px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#080a0f] rounded-[10px] flex items-center justify-center border border-amber-400/30">
                <span className="font-black text-xl tracking-tighter bg-gradient-to-br from-white via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  RL
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-wider gold-gradient-text">
                  DIECAST
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 font-mono">
                  1:64
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 tracking-widest font-mono uppercase font-semibold">
                Miniaturas de Colecionador
              </p>
            </div>
          </Link>

          {/* Search Bar Desktop com Borda Suave e Foco Ouro */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              placeholder="Buscar por modelo (BMW, Skyline, Porsche, Dodge), código MGT ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111520] border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Actions & Shortcut Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Minha Garagem */}
            <Link
              href="/garagem"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111520] border border-white/10 hover:border-amber-400/50 hover:bg-[#161c2b] text-xs font-semibold text-neutral-200 transition-all"
              title="Minha Garagem / Coleção"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Minha Garagem</span>
            </Link>

            {/* Admin Link / Login Trigger */}
            {isAdmin ? (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </Link>
            ) : (
              <button
                onClick={openLoginModal}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-neutral-400 hover:text-amber-400 hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer"
                title="Acesso com Senha do Administrador"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* Minha Conta */}
            <Link
              href="/conta"
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-colors relative"
              title="Minha Conta e Pré-vendas"
            >
              <User className="w-5 h-5 text-neutral-300 hover:text-amber-400 transition-colors" />
            </Link>

            {/* Notificações */}
            <Link
              href="/conta?aba=avisos"
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-colors relative"
              title="Avisos e Lançamentos"
            >
              <Bell className="w-5 h-5 text-neutral-300 hover:text-amber-400 transition-colors" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#080a0f]" />
              )}
            </Link>

            {/* Carrinho com botão Ouro de Alto Contraste */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 hover:scale-105 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-neutral-950" />
              <span className="hidden sm:inline">Carrinho</span>
              {totalItems > 0 && (
                <span className="ml-1 bg-neutral-950 text-amber-300 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden text-neutral-300 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Menu Desktop */}
        <nav className="hidden lg:flex items-center justify-between border-t border-white/10 py-3 text-xs font-semibold text-neutral-300">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-amber-300 transition-colors">
              Início
            </Link>
            <Link href="/catalogo" className="hover:text-amber-300 transition-colors">
              Catálogo Completo
            </Link>
            <Link
              href="/pre-vendas"
              className="flex items-center gap-1.5 text-amber-400 font-extrabold hover:text-amber-300 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
              <span>Pré-Vendas Oficiais</span>
            </Link>
            <Link
              href="/pronta-entrega"
              className="flex items-center gap-1.5 text-emerald-400 font-extrabold hover:text-emerald-300 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/40" />
              <span>Pronta-Entrega</span>
            </Link>
            <Link href="/catalogo?marca=Mini+GT" className="hover:text-amber-300 transition-colors py-1 hover:border-b-2 hover:border-amber-400">
              Mini GT
            </Link>
            <Link href="/catalogo?marca=Kaido+House" className="hover:text-amber-300 transition-colors py-1 hover:border-b-2 hover:border-amber-400">
              Kaido House
            </Link>
            <Link href="/catalogo?marca=Tarmac+Works" className="hover:text-amber-300 transition-colors py-1 hover:border-b-2 hover:border-amber-400">
              Tarmac Works
            </Link>
            <Link href="/catalogo?marca=BBR+Models" className="hover:text-amber-300 transition-colors py-1 hover:border-b-2 hover:border-amber-400">
              BBR Models
            </Link>
            <Link href="/catalogo?marca=Pop+Race" className="hover:text-amber-300 transition-colors py-1 hover:border-b-2 hover:border-amber-400">
              Pop Race
            </Link>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/regras-pre-venda" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Garantia de Pré-venda</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1017] border-b border-white/10 px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar modelos, MGT ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111520] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-[#111520] hover:bg-[#161c2b] text-neutral-200"
            >
              Início
            </Link>
            <Link
              href="/catalogo"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-[#111520] hover:bg-[#161c2b] text-neutral-200"
            >
              Catálogo
            </Link>
            <Link
              href="/pre-vendas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              Pré-Vendas
            </Link>
            <Link
              href="/pronta-entrega"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              Pronta-Entrega
            </Link>
            <Link
              href="/garagem"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-[#111520] hover:bg-[#161c2b] text-neutral-200 flex items-center gap-1.5"
            >
              <Car className="w-4 h-4 text-amber-400" />
              Minha Garagem
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Painel Admin</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openLoginModal();
                }}
                className="p-3 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Acesso Admin</span>
              </button>
            )}
          </div>

          {/* Marcas no Mobile Menu */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Marcas Oficiais
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Mini GT', 'Kaido House', 'Tarmac Works', 'BBR Models', 'Pop Race'].map((brand) => (
                <Link
                  key={brand}
                  href={`/catalogo?marca=${encodeURIComponent(brand)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#111520] hover:bg-amber-500/20 text-xs font-semibold text-neutral-200 hover:text-amber-300 border border-white/5"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
