'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Flame,
  ShoppingBag,
  RefreshCw,
  Settings,
  ArrowLeft,
  ShieldAlert,
  LayoutTemplate,
  Tags,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Página Inicial & Banners', href: '/admin/banners', icon: LayoutTemplate },
    { name: 'Categorias & Marcas', href: '/admin/categorias', icon: Tags },
    { name: 'Produtos & Catálogo', href: '/admin/produtos', icon: Package },
    { name: 'Pré-Vendas & Lotes', href: '/admin/pre-vendas', icon: Flame },
    { name: 'Pedidos & Envios', href: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Sincronização Mini GT', href: '/admin/sincronizacao', icon: RefreshCw },
    { name: 'Configurações & Margens', href: '/admin/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0d0f17] border-r border-white/10 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Admin Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-black">
                RL
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider text-white">RL DIECAST</span>
                <span className="block text-[9px] uppercase font-mono tracking-widest text-amber-400">
                  Painel Administrativo
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to store */}
        <div className="pt-6 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Voltar para a Loja Virtual</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
