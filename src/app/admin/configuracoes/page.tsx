'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Percent, ShieldCheck, DollarSign, Truck } from 'lucide-react';
import { getDatabase } from '@/lib/storage';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('RL Diecast');
  const [contactEmail, setContactEmail] = useState('contato@rldiecast.com.br');
  const [contactPhone, setContactPhone] = useState('(11) 98765-4321');
  const [pixDiscountPercent, setPixDiscountPercent] = useState(5);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(299);
  const [bannerText, setBannerText] = useState(
    '🚀 PRÉ-VENDAS 2026 MINI GT BRASIL ABERTAS • GARANTA COM ENTRADA A PARTIR DE R$ 15,00'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          Configurações da Loja & Políticas Comerciais
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Ajuste as informações da RL Diecast, descontos e parâmetros operacionais de frete e pagamento.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Store Info */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">Identidade da Loja</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Nome da Loja</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">E-mail de Contato e Cobranças</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">WhatsApp de Atendimento</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Banner Superior de Destaque</label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Commercial Policies */}
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
          <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" /> Descontos e Frete Grátis
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Desconto à vista no Pix (%)</label>
              <input
                type="number"
                value={pixDiscountPercent}
                onChange={(e) => setPixDiscountPercent(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Valor Mínimo para Frete Grátis (R$)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-white/10 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {saved && <span className="text-emerald-400 font-bold">Configurações salvas com sucesso!</span>}
          <button
            type="submit"
            className="ml-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
