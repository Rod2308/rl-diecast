export interface ShippingOption {
  serviceId: string;
  serviceName: string;
  carrier: string;
  price: number;
  deliveryDays: string;
  isFree?: boolean;
}

export function calculateShippingQuotes(cep: string, orderTotal: number): ShippingOption[] {
  // Higieniza o CEP
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length < 8) return [];

  // Identifica a região pelo primeiro dígito do CEP brasileiro
  const firstDigit = cleanCep[0];
  let basePricePac = 22.0;
  let basePriceSedex = 38.0;
  let basePriceTransp = 29.0;
  let pacDays = '6 a 9 dias úteis';
  let sedexDays = '2 a 4 dias úteis';
  let transpDays = '3 a 5 dias úteis';

  // Região Sudeste (SP, RJ, MG, ES: CEP 0 a 3)
  if (['0', '1', '2', '3'].includes(firstDigit)) {
    basePricePac = 17.5;
    basePriceSedex = 26.9;
    basePriceTransp = 19.9;
    pacDays = '4 a 6 dias úteis';
    sedexDays = '1 a 3 dias úteis';
    transpDays = '2 a 4 dias úteis';
  } else if (['4', '5'].includes(firstDigit)) {
    // Nordeste
    basePricePac = 28.5;
    basePriceSedex = 54.0;
    basePriceTransp = 39.0;
    pacDays = '8 a 14 dias úteis';
    sedexDays = '3 a 6 dias úteis';
    transpDays = '5 a 8 dias úteis';
  } else if (['8', '9'].includes(firstDigit)) {
    // Sul
    basePricePac = 21.0;
    basePriceSedex = 34.0;
    basePriceTransp = 24.5;
    pacDays = '5 a 8 dias úteis';
    sedexDays = '2 a 4 dias úteis';
    transpDays = '3 a 5 dias úteis';
  }

  const isFreeEligible = orderTotal >= 299.0;

  return [
    {
      serviceId: 'pac',
      serviceName: 'Correios PAC',
      carrier: 'Correios',
      price: isFreeEligible ? 0 : basePricePac,
      deliveryDays: pacDays,
      isFree: isFreeEligible,
    },
    {
      serviceId: 'sedex',
      serviceName: 'Correios SEDEX (Recomendado)',
      carrier: 'Correios',
      price: basePriceSedex,
      deliveryDays: sedexDays,
      isFree: false,
    },
    {
      serviceId: 'transportadora',
      serviceName: 'Jadlog / Transportadora Expressa',
      carrier: 'Melhor Envio',
      price: basePriceTransp,
      deliveryDays: transpDays,
      isFree: false,
    },
    {
      serviceId: 'retirada',
      serviceName: 'Retirada Combinada no Showroom RL Diecast (São Paulo)',
      carrier: 'RL Diecast',
      price: 0,
      deliveryDays: 'Disponível no dia útil seguinte',
      isFree: true,
    },
  ];
}
