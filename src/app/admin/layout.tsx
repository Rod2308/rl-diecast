'use client';

import React, { useState } from 'react';
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
  Lock,
  Eye,
  EyeOff,
  LogOut,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, loading, login, logout } = useAdminAuth();

  // Login form state (quando não autenticado)
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Digite a senha de administrador.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await login(password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Senha de administrador incorreta.');
    } else {
      setPassword('');
    }
  };

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

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400">Verificando credenciais de administrador...</p>
        </div>
      </div>
    );
  }

  // 2. Não Autenticado: Tela de Bloqueio com Senha
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d0f17] border border-white/15 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Cabeçalho */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1.5px] mx-auto shadow-lg shadow-amber-500/25">
              <div className="w-full h-full bg-[#0d0f17] rounded-[14px] flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                Acesso Restrito ao Admin
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Área reservada. Digite sua senha de administrador para gerenciar o RL Diecast.
              </p>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Senha de Administrador</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/15 rounded-xl pl-4 pr-11 py-3 text-white text-xs focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Validando Senha...' : 'Desbloquear Painel'}</span>
            </button>
          </form>

          {/* Link para voltar para a loja */}
          <div className="pt-2 text-center border-t border-white/10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Loja Virtual</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Autenticado: Painel Administrativo Completo
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

        {/* Footer Sidebar: Voltar e Logout */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Voltar para a Loja Virtual</span>
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
