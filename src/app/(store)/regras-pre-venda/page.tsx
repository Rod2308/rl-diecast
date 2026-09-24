import React from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, HelpCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegrasPreVendaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-neutral-300">
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
          <Flame className="w-4 h-4" />
          <span>REGULAMENTO OFICIAL RL DIECAST</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Política e Regras de Pré-Venda</h1>
        <p className="text-sm text-neutral-400">
          Entenda como funciona o sistema de reserva antecipada com pagamento fracionado (Entrada + Saldo).
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-3 bg-neutral-900/60 p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">
              1
            </span>
            O que é a Pré-venda com Entrada?
          </h2>
          <p>
            Para garantir que os colecionadores tenham acesso garantido às miniaturas mais disputadas sem comprometer
            todo o orçamento antecipadamente, a <strong>RL Diecast</strong> oferece a modalidade de{' '}
            <strong>Reserva com Entrada</strong>.
          </p>
          <p>
            O cliente paga uma entrada fixa ou percentual (geralmente entre R$ 15,00 e R$ 25,00) no momento do pedido.
            Esse valor assegura uma unidade nominal no pedido oficial do lote junto ao importador oficial (como Mini GT
            Brasil).
          </p>
        </section>

        <section className="space-y-3 bg-neutral-900/60 p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">
              2
            </span>
            Previsões de Chegada e Prazos
          </h2>
          <p>
            As previsões de chegada (ex: <em>&quot;Julho de 2026&quot;</em>) são informadas oficialmente pelas fábricas e
            distribuidores autorizados. Por se tratarem de produtos importados sujeitos a transporte marítimo/aéreo e
            desembaraço aduaneiro na Receita Federal do Brasil, as datas podem sofrer variações ou adiamentos alheios à
            nossa vontade.
          </p>
          <p>
            Qualquer alteração relevante de previsão é atualizada automaticamente em nosso sistema e notificada ao
            comprador na aba <strong>Minhas Pré-vendas</strong>.
          </p>
        </section>

        <section className="space-y-3 bg-neutral-900/60 p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">
              3
            </span>
            Como é feito o pagamento do Saldo Restante?
          </h2>
          <p>
            Assim que a carga física é entregue em nosso centro de distribuição e conferida pela nossa equipe técnica:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
            <li>O status da sua pré-venda muda para <strong>&quot;Chegou ao Estoque&quot;</strong>;</li>
            <li>Você recebe uma notificação via e-mail e WhatsApp com o aviso de cobrança;</li>
            <li>
              Você acessa sua conta e visualiza o botão <strong>&quot;Pagar Saldo Restante&quot;</strong>, podendo quitar via
              Pix Copia e Cola instantâneo ou Cartão de Crédito;
            </li>
            <li>O prazo para quitação do saldo é de até <strong>10 (dez) dias corridos</strong> após a notificação.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-neutral-900/60 p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">
              4
            </span>
            Envio e Embalagem Blindada
          </h2>
          <p>
            Assim que o saldo restante for compensado, sua miniatura é embalada no padrão especial para colecionadores:
            caixa dupla de papelão resistente, plástico bolha de alta gramatura e proteção nas quinas para evitar
            qualquer amassado ou vinco na cartela/blister.
          </p>
        </section>

        <section className="space-y-3 bg-neutral-900/60 p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center">
              5
            </span>
            Regras de Cancelamento e Reembolso
          </h2>
          <p>
            - <strong>Cancelamento por descontinuidade do fabricante:</strong> Caso o fabricante cancele a produção ou o
            distribuidor corte as cotas do lote, o valor pago (incluindo 100% da entrada) é estornado imediatamente ao
            comprador.
          </p>
          <p>
            - <strong>Cancelamento por iniciativa do comprador:</strong> O cliente pode solicitar o cancelamento antes
            do lote chegar, hipótese em que o valor da entrada poderá sofrer retenção operacional de 15% para cobertura de
            custos de reserva do lote já pago ao distribuidor.
          </p>
        </section>
      </div>

      <div className="pt-6 border-t border-white/10 flex justify-between items-center text-xs">
        <Link href="/catalogo" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
          ← Ir para o Catálogo
        </Link>
        <Link href="/pre-vendas" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
          Ver Pré-vendas Disponíveis <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
