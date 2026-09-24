import { NextResponse } from 'next/server';
import { calculateShippingQuotes } from '@/lib/shipping';

export async function POST(request: Request) {
  try {
    const { cep, subtotal } = await request.json();
    if (!cep) {
      return NextResponse.json({ success: false, error: 'CEP obrigatório' }, { status: 400 });
    }

    const quotes = calculateShippingQuotes(cep, Number(subtotal) || 0);
    return NextResponse.json({ success: true, quotes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
