import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { GarageStatus, GarageItem } from '@/lib/types';

export async function GET() {
  const db = getDatabase();
  const enrichedGarage = db.garage.map((g) => {
    const product = db.products.find((p) => p.id === g.productId);
    return {
      ...g,
      product,
    };
  });

  return NextResponse.json({
    garage: enrichedGarage,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const { productId, status, userNote } = body;

    if (!productId || !status) {
      return NextResponse.json({ success: false, error: 'Produto e status são obrigatórios' }, { status: 400 });
    }

    const existingIndex = db.garage.findIndex((g) => g.productId === productId);

    if (existingIndex >= 0) {
      db.garage[existingIndex].status = status as GarageStatus;
      if (userNote !== undefined) {
        db.garage[existingIndex].userNote = userNote;
      }
    } else {
      const newItem: GarageItem = {
        id: `gar-${Date.now()}`,
        productId,
        status: status as GarageStatus,
        userNote: userNote || '',
        addedAt: new Date().toISOString(),
      };
      db.garage.unshift(newItem);
    }

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Garagem atualizada com sucesso!',
      garage: db.garage,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const productId = searchParams.get('productId');

    const db = getDatabase();
    if (id) {
      db.garage = db.garage.filter((g) => g.id !== id);
    } else if (productId) {
      db.garage = db.garage.filter((g) => g.productId !== productId);
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, message: 'Item removido da garagem!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
