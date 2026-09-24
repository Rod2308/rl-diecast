import { NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminSessionCookie } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'A senha de administrador é obrigatória.' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Senha de administrador incorreta.' },
        { status: 401 }
      );
    }

    await setAdminSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Autenticado com sucesso no perfil de administrador.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro na autenticação' },
      { status: 500 }
    );
  }
}
