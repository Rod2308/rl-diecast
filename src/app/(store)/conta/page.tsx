'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Flame,
  CreditCard,
  Bell,
  MapPin,
  User,
  Truck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Car,
  Clock,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Order, PreOrderItem, NotificationItem, CustomerAddress } from '@/lib/types';
import { useCustomerAuth } from '@/lib/customer-auth-context';

function CustomerAccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('aba') || 'pedidos';

  const { customer, isAuthenticated, loading: authLoading, login, register, logout } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrderItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Auth form states (quando não logado)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Balance Payment Modal
  const [payingPreOrder, setPayingPreOrder] = useState<PreOrderItem | null>(null);
  const [payingLoading, setPayingLoading] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [newStreet, setNewStreet] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newComp, setNewComp] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('SP');
  const [newCep, setNewCep] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomerData();
    }
  }, [isAuthenticated]);

  const loadCustomerData = async () => {
    setLoadingData(true);
    try {
      const [resOrders, resPre] = await Promise.all([
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/pre-orders', { cache: 'no-store' }),
      ]);

      const dataOrders = await resOrders.json();
      const dataPre = await resPre.json();

      if (dataOrders.orders) {
        // Filtra por email do cliente caso haja dados associados
        setOrders(dataOrders.orders);
      }
      if (dataPre.preOrders) {
        setPreOrders(dataPre.preOrders);
      }

      setNotifications([
        {
          id: 'notif-1',
          title: 'Reserva Confirmada!',
          message: 'Sua entrada para pré-venda Mini GT foi aprovada e confirmada.',
          type: 'PAYMENT_CONFIRMED',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          title: 'Novos Lotes 2026 Mini GT Brasil',
          message: 'Novas réplicas 1:64 abertas para reserva no catálogo.',
          type: 'NEW_RELEASE',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setSubmittingAuth(true);

    const res = await login({ email: loginEmail, password: loginPassword });
    setSubmittingAuth(false);

    if (res.success) {
      setAuthSuccess('Login realizado com sucesso!');
    } else {
      setAuthError(res.error || 'E-mail ou senha incorretos.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (regPassword !== regPasswordConfirm) {
      setAuthError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    if (regPassword.length < 6) {
      setAuthError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSubmittingAuth(true);
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      cpf: regCpf,
    });
    setSubmittingAuth(false);

    if (res.success) {
      setAuthSuccess('Conta criada com sucesso! Bem-vindo à RL Diecast.');
    } else {
      setAuthError(res.error || 'Erro ao criar conta.');
    }
  };

  const handlePayBalance = async (preOrder: PreOrderItem) => {
    setPayingLoading(true);
    try {
      const res = await fetch('/api/pre-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preOrderId: preOrder.id,
          action: 'PAY_BALANCE',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPayingPreOrder(null);
        await loadCustomerData();
        alert('Saldo quitado com sucesso! A miniatura foi liberada para envio imediato.');
      }
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setPayingLoading(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newNumber || !newCep) return;
    const addr: CustomerAddress = {
      id: `addr-${Date.now()}`,
      recipientName: customer?.name || 'Destinatário',
      street: newStreet,
      number: newNumber,
      complement: newComp,
      neighborhood: newNeighborhood,
      city: newCity,
      state: newState,
      cep: newCep,
      isDefault: savedAddresses.length === 0,
    };
    setSavedAddresses([...savedAddresses, addr]);
    setShowAddressForm(false);
    setNewStreet('');
    setNewNumber('');
    setNewComp('');
    setNewNeighborhood('');
    setNewCity('');
    setNewCep('');
  };

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  // 1. Loading de autenticação
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Carregando informações da sua conta...</p>
      </div>
    );
  }

  // 2. Não Autenticado: Tela de Login e Criação de Conta
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1.5px] mx-auto shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-[#0a0c12] rounded-[14px] flex items-center justify-center">
              <User className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            Área do Colecionador RL Diecast
          </h1>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Acesse sua conta ou cadastre-se para acompanhar suas reservas de pré-vendas, histórico de pedidos e salvar miniaturas na Garagem.
          </p>
        </div>

        {/* Card Principal */}
        <div className="max-w-md mx-auto bg-[#0e121b] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Seletor de Modo: Entrar x Criar Conta */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-950 border border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Já tenho conta (Entrar)
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* FORMULÁRIO 1: LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold block">E-mail Cadastrado</label>
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-3 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold block">Sua Senha</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl pl-4 pr-11 py-3 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingAuth ? 'Entrando...' : 'Entrar na Minha Conta'}
              </button>
            </form>
          )}

          {/* FORMULÁRIO 2: CADASTRO / CRIAR CONTA */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold block">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold block">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold block">WhatsApp / Celular</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold block">CPF (Opcional)</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={regCpf}
                    onChange={(e) => setRegCpf(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold block">Criar Senha (Mínimo 6 dígitos) *</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Crie sua senha segura..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl pl-4 pr-11 py-2.5 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-3 text-neutral-400 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold block">Confirmar Senha *</label>
                <input
                  type="password"
                  required
                  placeholder="Repita sua senha..."
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {submittingAuth ? 'Criando sua Conta...' : 'Criar Minha Conta de Colecionador'}
              </button>
            </form>
          )}

          {/* Vantagens */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Garantia de reserva com entrada reduzida de R$ 15</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Avisos prioritários sobre novos lotes e chegadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Sua garagem virtual sincronizada em qualquer dispositivo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Autenticado: Painel Real do Cliente
  const initials =
    customer?.name
      ?.split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CO';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile banner com dados REAIS do cliente autenticado */}
      <div className="p-6 rounded-3xl bg-[#0e121b] border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-xl text-neutral-950 shadow-lg shadow-amber-500/20">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{customer?.name}</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                COLECIONADOR VERIFICADO
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              {customer?.email} {customer?.phone ? `• ${customer.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/garagem"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span>Minha Garagem</span>
          </Link>
          <Link
            href="/catalogo"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-neutral-950 shadow-md shadow-amber-500/20 transition-all"
          >
            Explorar Loja
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pedidos'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Meus Pedidos ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prevendas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'prevendas'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Minhas Pré-vendas ({preOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('avisos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'avisos'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos & Lançamentos ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enderecos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'enderecos'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Endereços de Entrega</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 bg-neutral-900/40 rounded-2xl border border-white/5 space-y-2">
              <Package className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="font-semibold text-neutral-300">Nenhum pedido realizado até o momento.</p>
              <Link href="/catalogo" className="text-amber-400 underline font-bold inline-block pt-1">
                Conheça nossos modelos disponíveis ↗
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-amber-400 text-sm">Pedido #{ord.code}</span>
                    <span className="text-neutral-400 block text-[11px]">
                      Realizado em {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded font-bold text-[11px] font-mono ${
                        ord.paymentStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ord.paymentStatus === 'APPROVED' ? 'PAGAMENTO APROVADO' : 'AGUARDANDO PAGAMENTO'}
                    </span>
                    <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 text-[11px]">
                      {ord.shippingService}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover bg-neutral-950 border border-white/10"
                        />
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[10px] text-neutral-400">
                            Qtd: {item.quantity} •{' '}
                            {item.isPreOrder && item.payDownPaymentOnly
                              ? `Entrada paga (${formatMoney(item.downPaymentValue)}) • Saldo de ${formatMoney(
                                  item.balanceValue
                                )} na chegada`
                              : `Valor Integral (${formatMoney(item.price)})`}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {formatMoney(
                          (item.isPreOrder && item.payDownPaymentOnly ? item.downPaymentValue : item.price) *
                            item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 text-neutral-300">
                  <span>Forma: {ord.paymentMethod}</span>
                  <div className="text-right">
                    <span className="text-neutral-400 mr-2">Total Pago Agora:</span>
                    <span className="font-mono font-bold text-white text-sm">{formatMoney(ord.totalPaidNow)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Pre-orders */}
      {activeTab === 'prevendas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
            <Flame className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold block">Painel de Acompanhamento de Pré-Vendas</span>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Aqui você visualiza os lotes encomendados. Quando a miniatura chegar ao Brasil, o status mudará para
                &quot;Chegou ao Estoque&quot; e você poderá quitar o saldo restante com Pix ou Cartão.
              </p>
            </div>
          </div>

          {preOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 bg-neutral-900/40 rounded-2xl border border-white/5 space-y-2">
              <Flame className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="font-semibold text-neutral-300">Você não possui pré-vendas ativas no momento.</p>
              <Link href="/pre-vendas" className="text-amber-400 underline font-bold inline-block pt-1">
                Ver pré-vendas abertas para reserva ↗
              </Link>
            </div>
          ) : (
            preOrders.map((po) => (
              <div
                key={po.id}
                className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-amber-400 text-sm">Reserva #{po.orderId || po.id}</span>
                    <span className="text-neutral-400 block text-[11px]">
                      Criada em {new Date(po.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full font-bold text-[10px] font-mono ${
                      po.status === 'CHEGOU_ESTOQUE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        : po.status === 'QUITADO'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {po.status === 'CHEGOU_ESTOQUE'
                      ? 'CHEGOU AO BRASIL • QUITE O SALDO'
                      : po.status === 'QUITADO'
                      ? 'QUITADO • PRONTO PARA ENVIO'
                      : 'AGUARDANDO CHEGADA DO LOTE'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={po.productImage}
                    alt={po.productTitle}
                    className="w-16 h-16 rounded-xl object-cover bg-neutral-950 border border-white/10 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-300 block">{po.mgtCode || po.productId}</span>
                    <h4 className="font-extrabold text-white text-sm">{po.productTitle}</h4>
                    <p className="text-[11px] text-neutral-400">Previsão: {po.arrivalForecast || '2026'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-950 border border-white/5 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Entrada Paga</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatMoney(po.downPaymentPaid)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase">Saldo Restante</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {formatMoney(po.balancePending)}
                    </span>
                  </div>
                </div>

                {po.status === 'CHEGOU_ESTOQUE' && po.balancePending > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-emerald-400 text-sm">O lote chegou ao estoque!</h4>
                      <p className="text-xs text-neutral-300">
                        Pague o saldo de <strong>{formatMoney(po.balancePending)}</strong> via Pix para liberação
                        imediata do envio.
                      </p>
                    </div>

                    <button
                      onClick={() => handlePayBalance(po)}
                      disabled={payingLoading}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{payingLoading ? 'Processando...' : 'Pagar Saldo Restante (Pix / Cartão)'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'avisos' && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">{n.title}</span>
                <span className="text-[10px] text-neutral-500">
                  {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-neutral-300">{n.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Addresses */}
      {activeTab === 'enderecos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Seus Endereços de Entrega</h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddressForm ? 'Fechar Formulário' : 'Novo Endereço'}</span>
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-neutral-900 border border-amber-500/30 space-y-3 text-xs">
              <span className="font-bold text-amber-400 text-xs block">Cadastrar Endereço para Entregas:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300">CEP</label>
                  <input
                    type="text"
                    required
                    placeholder="00000-000"
                    value={newCep}
                    onChange={(e) => setNewCep(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-neutral-300">Rua / Logradouro</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua das Miniaturas"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300">Número</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto 42"
                    value={newComp}
                    onChange={(e) => setNewComp(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Bairro</label>
                  <input
                    type="text"
                    required
                    placeholder="Centro"
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-300">Cidade / UF</label>
                  <input
                    type="text"
                    required
                    placeholder="São Paulo / SP"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs cursor-pointer shadow-md"
              >
                Salvar Endereço
              </button>
            </form>
          )}

          {savedAddresses.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-900/40 rounded-2xl border border-white/5 space-y-1">
              <MapPin className="w-6 h-6 text-neutral-600 mx-auto" />
              <p>Nenhum endereço cadastrado ainda.</p>
              <p className="text-[11px] text-neutral-500">Clique em &quot;Novo Endereço&quot; acima para cadastrar seu endereço de entrega.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div key={addr.id} className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{addr.recipientName}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-200">
                    {addr.street}, {addr.number} {addr.complement ? `- ${addr.complement}` : ''}
                  </p>
                  <p className="text-neutral-400">
                    {addr.neighborhood} — {addr.city}/{addr.state} • CEP {addr.cep}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Carregando painel do cliente...</div>}>
      <CustomerAccountContent />
    </Suspense>
  );
}
