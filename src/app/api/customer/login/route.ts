import { NextResponse } from 'next/server';
import { authenticateCustomer, setCustomerSessionCookie } from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const { customer } = await authenticateCustomer({ email, password });

    await setCustomerSessionCookie(customer);

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso!',
      customer,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'E-mail ou senha inválidos.' },
      { status: 401 }
    );
  }
}
