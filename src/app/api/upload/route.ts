import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nome de arquivo limpo e único
    const ext = path.extname(file.name) || '.webp';
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    const fileName = `${Date.now()}-${cleanBase}${ext}`;
    const filePath = `${folder}/${fileName}`;

    // 1. Tenta upload no Supabase Storage (Bucket "catalog")
    if (isSupabaseConfigured()) {
      try {
        // Garante que o bucket existe
        await supabaseAdmin.storage.createBucket('catalog', { public: true });

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('catalog')
          .upload(filePath, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabaseAdmin.storage.from('catalog').getPublicUrl(filePath);
          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            storagePath: filePath,
            source: 'supabase-storage',
          });
        } else if (uploadError) {
          console.warn('Erro ao enviar para Supabase Storage:', uploadError.message);
        }
      } catch (storageErr) {
        console.warn('Falha no Supabase Storage, usando fallback local:', storageErr);
      }
    }

    // 2. Fallback: Grava em public/uploads localmente
    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }

    const localFilePath = path.join(localUploadsDir, fileName);
    fs.writeFileSync(localFilePath, buffer);

    const publicLocalUrl = `/uploads/${folder}/${fileName}`;
    return NextResponse.json({
      success: true,
      url: publicLocalUrl,
      storagePath: filePath,
      source: 'local-disk',
    });
  } catch (err: any) {
    console.error('Erro na rota de upload:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
