import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';
import { AITool } from '@/types/ai-tool';

// Função para verificar autenticação
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  return authHeader === 'Bearer admin-authenticated';
}

// GET - Buscar ferramenta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const tool = await SupabaseService.getToolById(id);
    
    if (!tool) {
      return NextResponse.json(
        { error: 'Ferramenta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error('Erro ao buscar ferramenta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar ferramenta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const toolData = await request.json();
    
    // Verificar se a ferramenta existe
    const existingTool = await SupabaseService.getToolById(id);
    if (!existingTool) {
      return NextResponse.json(
        { error: 'Ferramenta não encontrada' },
        { status: 404 }
      );
    }

    const updatedTool = await SupabaseService.updateTool(id, toolData);
    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error('Erro ao atualizar ferramenta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar ferramenta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Verificar se a ferramenta existe
    const existingTool = await SupabaseService.getToolById(id);
    if (!existingTool) {
      return NextResponse.json(
        { error: 'Ferramenta não encontrada' },
        { status: 404 }
      );
    }

    await SupabaseService.deleteTool(id);
    return NextResponse.json(
      { message: 'Ferramenta deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar ferramenta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}