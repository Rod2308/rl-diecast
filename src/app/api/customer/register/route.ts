import { NextResponse } from 'next/server';
import { createCustomerAccount, setCustomerSessionCookie } from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, cpf } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const { customer } = await createCustomerAccount({
      email,
      password,
      name,
      phone,
      cpf,
    });

    await setCustomerSessionCookie(customer);

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso!',
      customer,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao criar conta.' },
      { status: 400 }
    );
  }
}
