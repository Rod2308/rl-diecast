'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Truck, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import { Order, PaymentStatus } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const filteredOrders = orders.filter((o) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.code.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerCpf.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Gestão de Pedidos
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Controle de pedidos recebidos, conciliação bancária e despachos com transportadoras.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por código, cliente ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Código / Data</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Itens</th>
                <th className="p-4">Pago Agora</th>
                <th className="p-4">Saldo Posterior</th>
                <th className="p-4">Pagamento</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-800/40">
                  <td className="p-4">
                    <span className="font-mono font-bold text-amber-400 text-sm block">#{ord.code}</span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-white block">{ord.customerName}</span>
                    <span className="text-[10px] text-neutral-400">{ord.customerEmail}</span>
                  </td>

                  <td className="p-4">
                    <span className="text-white block font-medium">
                      {ord.items.length} {ord.items.length === 1 ? 'miniatura' : 'miniaturas'}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate max-w-xs block">
                      {ord.items.map((it) => it.title).join(', ')}
                    </span>
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400">{formatMoney(ord.totalPaidNow)}</td>

                  <td className="p-4 font-mono">
                    {ord.totalBalanceLater > 0 ? (
                      <span className="font-bold text-amber-400">{formatMoney(ord.totalBalanceLater)}</span>
                    ) : (
                      <span className="text-neutral-500 text-[10px]">Sem saldo</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-neutral-200 block">{ord.paymentMethod}</span>
                    <span className="text-[10px] text-neutral-400">{ord.shippingService}</span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono ${
                        ord.paymentStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ord.paymentStatus === 'APPROVED' ? 'PAGO' : 'PENDENTE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
