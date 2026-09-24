import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Package, CreditCard, QrCode, Truck, RefreshCw, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#05070a] border-t border-white/10 text-neutral-400 text-sm mt-24">
      {/* Guarantees / Value Proposition Bar */}
      <div className="border-b border-white/5 bg-[#090c13] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0e121b] border border-white/5">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">100% Original e Lacrado</h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Importação oficial dos maiores fabricantes de 1:64 do mundo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0e121b] border border-white/5">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Embalagem Blindada</h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Plástico bolha de alta gramatura e caixa dupla para proteção máxima do blister.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0e121b] border border-white/5">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Pré-Venda Garantida</h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Pague apenas a entrada e o saldo restante somente quando o produto chegar ao Brasil.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0e121b] border border-white/5">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Envio Rápido & Seguro</h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Despacho para todo o Brasil via Correios (PAC/SEDEX) e Transportadoras com seguro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black shadow-md">
                RL
              </div>
              <span className="font-black text-xl text-white tracking-wider gold-gradient-text">RL DIECAST</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm">
              Sua loja especializada em miniaturas diecast 1:64 para colecionadores exigentes. Mini GT, Kaido House, Tarmac Works, Pop Race e edições exclusivas com procedência garantida.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>contato@rldiecast.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>(11) 98765-4321 (Seg. a Sex. das 09h às 18h)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-amber-300">Navegação</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalogo" className="hover:text-amber-300 transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/pre-vendas" className="hover:text-amber-300 transition-colors">
                  Lançamentos e Pré-Vendas
                </Link>
              </li>
              <li>
                <Link href="/pronta-entrega" className="hover:text-amber-300 transition-colors">
                  Pronta-Entrega
                </Link>
              </li>
              <li>
                <Link href="/garagem" className="hover:text-amber-300 transition-colors">
                  Minha Garagem (Coleção)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-amber-400 hover:text-amber-300 font-bold">
                  Acesso Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Special Categories */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-white">Marcas em Destaque</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalogo?marca=Mini+GT" className="hover:text-amber-400 transition-colors">
                  Mini GT 1:64
                </Link>
              </li>
              <li>
                <Link href="/catalogo?marca=Kaido+House" className="hover:text-amber-400 transition-colors">
                  Kaido House Series
                </Link>
              </li>
              <li>
                <Link href="/catalogo?marca=Tarmac+Works" className="hover:text-amber-400 transition-colors">
                  Tarmac Works
                </Link>
              </li>
              <li>
                <Link href="/catalogo?marca=Pop+Race" className="hover:text-amber-400 transition-colors">
                  Pop Race Models
                </Link>
              </li>
              <li>
                <Link href="/catalogo?marca=Inno64" className="hover:text-amber-400 transition-colors">
                  Inno64 Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal and Terms */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-white">Políticas & Ajuda</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/regras-pre-venda" className="hover:text-amber-400 transition-colors">
                  Como Funciona a Pré-Venda
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-amber-400 transition-colors">
                  Termos e Condições de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-amber-400 transition-colors">
                  Política de Privacidade (LGPD)
                </Link>
              </li>
              <li>
                <Link href="/conta" className="hover:text-amber-400 transition-colors">
                  Acompanhar Meus Pedidos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment & Security Badges */}
        <div className="border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-neutral-300">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Formas de Pagamento:</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              <QrCode className="w-3.5 h-3.5" /> Pix (5% OFF)
            </span>
            <span className="flex items-center gap-1 font-semibold text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded border border-white/10">
              <CreditCard className="w-3.5 h-3.5" /> Cartão até 12x
            </span>
            <span className="font-semibold text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded border border-white/10">
              Boleto
            </span>
          </div>

          <div className="text-neutral-400 text-center md:text-right text-[11px]">
            © {new Date().getFullYear()} RL Diecast. Todos os direitos reservados. CNPJ: 00.000.000/0001-00.
          </div>
        </div>
      </div>
    </footer>
  );
}
