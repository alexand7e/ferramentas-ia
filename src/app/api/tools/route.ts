import { NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tools = await SupabaseService.getAllTools();
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Erro ao buscar ferramentas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}