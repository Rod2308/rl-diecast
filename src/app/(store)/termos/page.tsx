import React from 'react';
import Link from 'next/link';

export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-neutral-300">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white">Termos e Condições de Uso</h1>
        <p className="text-xs text-neutral-400">Última atualização: Setembro de 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Identificação da Loja</h2>
          <p>
            A <strong>RL Diecast</strong> é uma loja virtual especializada no comércio de miniaturas colecionáveis diecast
            em escala (especialmente 1:64). Todas as transações são regidas pela legislação brasileira, incluindo o Código
            de Defesa do Consumidor (Lei 8.078/1990) e o Marco Civil da Internet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Autenticidade e Qualidade</h2>
          <p>
            Garantimos que todas as miniaturas comercializadas são originais, lacradas de fábrica e provenientes de canais
            de distribuição autorizados (Mini GT, Kaido House, Tarmac Works, Pop Race, Inno64, etc.).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Pré-Vendas e Entradas</h2>
          <p>
            O valor da entrada fixa a garantia de reserva do exemplar no lote solicitado. Os detalhes e prazos de
            quitação do saldo seguem estritamente a nossa{' '}
            <Link href="/regras-pre-venda" className="text-amber-400 underline font-semibold">
              Política de Pré-venda
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Fretes e Prazos</h2>
          <p>
            Os envios são efetuados via Correios (PAC ou SEDEX) ou transportadoras parceiras homologadas. O prazo de
            transporte passa a contar a partir do primeiro dia útil seguinte à postagem física e envio do código de
            rastreio.
          </p>
        </section>
      </div>
    </div>
  );
}
