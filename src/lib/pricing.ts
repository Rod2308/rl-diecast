import { PricingRule } from './types';

export const DEFAULT_PRICING_RULES: Record<string, PricingRule> = {
  DEFAULT: {
    brand: 'DEFAULT',
    profitMarginPercent: 35,
    fixedProfit: 12.0,
    gatewayFeePercent: 4.99,
    packagingCost: 5.5,
    safetyMargin: 4.5,
    defaultDownPaymentPercent: 15,
    minPrice: 59.9,
  },
  'Mini GT': {
    brand: 'Mini GT',
    profitMarginPercent: 35,
    fixedProfit: 14.0,
    gatewayFeePercent: 4.99,
    packagingCost: 6.0,
    safetyMargin: 5.0,
    defaultDownPaymentPercent: 15,
    minPrice: 89.9,
  },
  'Kaido House': {
    brand: 'Kaido House',
    profitMarginPercent: 40,
    fixedProfit: 22.0,
    gatewayFeePercent: 4.99,
    packagingCost: 7.0,
    safetyMargin: 8.0,
    defaultDownPaymentPercent: 15,
    minPrice: 139.9,
  },
  'Tarmac Works': {
    brand: 'Tarmac Works',
    profitMarginPercent: 38,
    fixedProfit: 18.0,
    gatewayFeePercent: 4.99,
    packagingCost: 6.5,
    safetyMargin: 6.0,
    defaultDownPaymentPercent: 15,
    minPrice: 129.9,
  },
  'Pop Race': {
    brand: 'Pop Race',
    profitMarginPercent: 35,
    fixedProfit: 15.0,
    gatewayFeePercent: 4.99,
    packagingCost: 6.0,
    safetyMargin: 5.0,
    defaultDownPaymentPercent: 15,
    minPrice: 119.9,
  },
  'Inno64': {
    brand: 'Inno64',
    profitMarginPercent: 38,
    fixedProfit: 19.0,
    gatewayFeePercent: 4.99,
    packagingCost: 6.5,
    safetyMargin: 6.0,
    defaultDownPaymentPercent: 15,
    minPrice: 139.9,
  },
  'Hot Wheels': {
    brand: 'Hot Wheels',
    profitMarginPercent: 30,
    fixedProfit: 8.0,
    gatewayFeePercent: 4.5,
    packagingCost: 4.5,
    safetyMargin: 3.5,
    defaultDownPaymentPercent: 20,
    minPrice: 49.9,
  },
  'BBR': {
    brand: 'BBR',
    profitMarginPercent: 45,
    fixedProfit: 45.0,
    gatewayFeePercent: 4.99,
    packagingCost: 15.0,
    safetyMargin: 15.0,
    defaultDownPaymentPercent: 20,
    minPrice: 199.9,
  },
};

export interface PricingCalculationResult {
  costPrice: number;
  salePrice: number;
  downPaymentValue: number;
  balanceValue: number;
  profitEstimated: number;
  ruleApplied: PricingRule;
}

/**
 * Fórmula padrão solicitada:
 * Preço de venda = preço de custo + margem de lucro + custos operacionais + taxas de pagamento + custos de embalagem + margem de segurança.
 */
export function calculatePricing(
  costPrice: number,
  brand: string,
  customRule?: PricingRule,
  customDownPaymentPercent?: number
): PricingCalculationResult {
  const rule = customRule || DEFAULT_PRICING_RULES[brand] || DEFAULT_PRICING_RULES.DEFAULT;

  const cost = Math.max(0, costPrice);
  const marginMultiplier = rule.profitMarginPercent / 100;
  const gatewayMultiplier = rule.gatewayFeePercent / 100;

  // Custo base + margem sobre custo + custos fixos operacionais e embalagem
  const rawProfit = cost * marginMultiplier + rule.fixedProfit;
  const operationalCosts = rule.packagingCost + rule.safetyMargin;

  // Preço com taxas do gateway embutidas
  let salePrice = (cost + rawProfit + operationalCosts) / (1 - gatewayMultiplier);

  // Arredondamento elegante para colecionador (terminando em .90 ou .00)
  salePrice = Math.ceil(salePrice) - 0.1;
  if (rule.minPrice && salePrice < rule.minPrice) {
    salePrice = rule.minPrice;
  }
  if (rule.maxPrice && salePrice > rule.maxPrice) {
    salePrice = rule.maxPrice;
  }

  // Cálculo da entrada e saldo
  const downPaymentPercent = customDownPaymentPercent || rule.defaultDownPaymentPercent;
  // Arredonda a entrada para um valor amigável (múltiplo de 5, ex: R$ 15, R$ 20)
  let downPayment = Math.round((salePrice * (downPaymentPercent / 100)) / 5) * 5;
  if (downPayment < 10) downPayment = 10;
  if (downPayment >= salePrice) downPayment = Math.floor(salePrice * 0.2);

  const balance = Math.round((salePrice - downPayment) * 100) / 100;
  const estimatedProfit = Math.round((salePrice - cost - operationalCosts - salePrice * gatewayMultiplier) * 100) / 100;

  return {
    costPrice: Math.round(cost * 100) / 100,
    salePrice: Math.round(salePrice * 100) / 100,
    downPaymentValue: downPayment,
    balanceValue: balance,
    profitEstimated: estimatedProfit,
    ruleApplied: rule,
  };
}
