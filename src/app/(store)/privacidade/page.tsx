import React from 'react';

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-neutral-300">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white">Política de Privacidade (LGPD)</h1>
        <p className="text-xs text-neutral-400">Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018)</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Coleta e Finalidade dos Dados</h2>
          <p>
            A <strong>RL Diecast</strong> coleta exclusivamente os dados necessários para o processamento de compras,
            emissão de notas fiscais, entrega dos pedidos e comunicação de avisos de pré-venda (nome completo, CPF,
            endereço, e-mail e telefone de contato).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Não Compartilhamento</h2>
          <p>
            Não vendemos nem comercializamos dados de clientes sob nenhuma circunstância. O compartilhamento ocorre
            estritamente com operadoras de frete (Correios e transportadoras) e intermediadores de pagamento (gateways
            bancários) com o único objetivo de viabilizar a entrega e liquidação da compra.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Direitos do Titular</h2>
          <p>
            O titular dos dados pode solicitar a qualquer momento a confirmação de existência de tratamento, acesso,
            correção ou eliminação de seus dados pessoais entrando em contato com nosso Encarregado de Proteção de Dados
            pelo e-mail <code>privacidade@rldiecast.com.br</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
