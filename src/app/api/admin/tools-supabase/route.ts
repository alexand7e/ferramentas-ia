import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';
import { AITool } from '@/types/ai-tool';

export const dynamic = 'force-dynamic';

// Função para verificar autenticação
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  return authHeader === 'Bearer admin-authenticated';
}

// GET - Listar todas as ferramentas
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

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

// POST - Criar nova ferramenta
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const toolData = await request.json();
    
    // Validação básica
    if (!toolData.name || !toolData.description || !toolData.category) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, description, category' },
        { status: 400 }
      );
    }

    const newTool = await SupabaseService.createTool(toolData);
    return NextResponse.json(newTool, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar ferramenta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}