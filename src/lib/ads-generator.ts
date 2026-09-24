export interface AdGeneratorParams {
  brand: string;
  scale: string;
  vehicleModel: string;
  colorOrEdition?: string;
  code?: string;
  isPreOrder: boolean;
  material?: string;
  packagingType?: string;
  arrivalForecast?: string;
  salePrice: number;
  downPaymentValue: number;
  balanceValue: number;
  stockLimit?: number;
}

/**
 * Padrão de Título Exigido:
 * “Pré-venda [Marca] • 1/64 [Modelo completo] [Cor ou edição] [Código]”
 * Exemplo: “Pré-venda Mini GT • 1/64 BMW Z3 Hellrot MGT01386”
 */
export function generateStandardTitle(params: {
  brand: string;
  scale: string;
  vehicleModel: string;
  colorOrEdition?: string;
  code?: string;
  isPreOrder: boolean;
}): string {
  const prefix = params.isPreOrder ? 'Pré-venda ' : '';
  const scalePart = params.scale ? ` • ${params.scale}` : ' • 1/64';
  const colorPart = params.colorOrEdition ? ` ${params.colorOrEdition}` : '';
  const codePart = params.code ? ` ${params.code}` : '';

  return `${prefix}${params.brand}${scalePart} ${params.vehicleModel}${colorPart}${codePart}`.trim();
}

/**
 * Padrão de Descrição Técnica e Comercial para Colecionadores
 */
export function generateStandardDescription(params: AdGeneratorParams): string {
  const formatMoney = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  const material = params.material || 'Carroceria em Diecast (metal), pneus de borracha real e chassi detalhado';
  const packaging = params.packagingType || 'Embalagem original lacrada de fábrica (Caixa / Blister de colecionador)';
  const forecast = params.arrivalForecast || 'Sob consulta / Previsão do fabricante';

  let preOrderBlock = '';
  if (params.isPreOrder) {
    preOrderBlock = `
🔥 **CONDIÇÕES ESPECIAIS DE PRÉ-VENDA**
• **Status**: Pré-venda oficial garantida
• **Previsão de Chegada no Brasil**: ${forecast} *(Previsão informada pelo fabricante/importador oficial, sujeita a alterações de logística e desembaraço aduaneiro)*
• **Valor Total**: ${formatMoney(params.salePrice)}
• **Opção de Entrada**: ${formatMoney(params.downPaymentValue)} (garante a sua unidade)
• **Saldo Restante**: ${formatMoney(params.balanceValue)} (a ser quitado via Pix ou Cartão assim que a miniatura chegar ao nosso estoque)

⚠️ **POLÍTICA DE PRÉ-VENDA E CANCELAMENTO**
1. O valor da entrada é intransferível e assegura a reserva prioritária do seu exemplar no lote oficial.
2. Assim que o lote for liberado e conferido em nosso depósito, você receberá uma notificação automática por e-mail e WhatsApp com o link para quitação do saldo restante.
3. O envio da miniatura é realizado imediatamente após a confirmação da quitação do saldo e escolha da modalidade de frete.
4. Em caso de cancelamento unilateral pelo comprador antes da chegada do lote, a taxa de reserva pode sofrer retenção de custos operacionais conforme os Termos da RL Diecast. Em caso de cancelamento da produção pelo fabricante, o reembolso é 100% integral e imediato.
`;
  } else {
    preOrderBlock = `
⚡ **PRONTA-ENTREGA - ENVIO IMEDIATO**
• **Status**: Em estoque físico na RL Diecast
• **Valor Total**: ${formatMoney(params.salePrice)}
• **Envio**: Despacho em até 24h úteis em embalagem blindada para colecionador.
`;
  }

  return `
🚗 **${params.vehicleModel.toUpperCase()}${params.colorOrEdition ? ` - ${params.colorOrEdition.toUpperCase()}` : ''}**

📋 **FICHA TÉCNICA DO COLECIONÁVEL**
• **Marca / Fabricante**: ${params.brand}
• **Escala**: ${params.scale}
• **Código / SKU**: ${params.code || 'Não informado'}
• **Material**: ${material}
• **Embalagem**: ${packaging}
• **Disponibilidade**: ${params.stockLimit ? `Lote limitado a ${params.stockLimit} unidades` : 'Lote limitado de colecionador'}
${preOrderBlock}
🛡️ **COMPROMISSO RL DIECAST**
• Miniatura 100% nova, lacrada e original.
• Embalagem de envio profissional com plástico bolha de alta densidade e caixa dupla de papelão rígido para máxima proteção do blister/caixa.
• Nota fiscal e rastreamento ponto a ponto.
• *Nota: Imagens oficiais fornecidas pelo fabricante podem conter detalhes protótipos sujeitos a pequenos aprimoramentos no produto final.*
`.trim();
}
