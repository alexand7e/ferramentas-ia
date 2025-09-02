import { NextRequest, NextResponse } from 'next/server';
import { SupabaseToolsService } from '@/lib/supabase-service';
import { AITool } from '@/types/ai-tool';

// Função para verificar autenticação
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  return authHeader === 'Bearer admin-authenticated';
}

// PUT - Atualizar ferramenta existente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const updatedTool: AITool = await request.json();
    const toolId = params.id;
    
    if (!toolId) {
      return NextResponse.json({ error: 'ID da ferramenta é obrigatório' }, { status: 400 });
    }
    
    // Verificar se a ferramenta existe
    const existingTool = await SupabaseToolsService.getToolById(toolId);
    if (!existingTool) {
      return NextResponse.json({ error: 'Ferramenta não encontrada' }, { status: 404 });
    }
    
    // Manter o ID original e atualizar updatedAt
    updatedTool.id = toolId;
    updatedTool.updatedAt = new Date().toISOString().split('T')[0];
    
    const result = await SupabaseToolsService.updateTool(toolId, updatedTool);
    
    return NextResponse.json({ 
      message: 'Ferramenta atualizada com sucesso', 
      tool: result,
      source: 'supabase'
    });
  } catch (error: any) {
    console.error('Erro ao atualizar ferramenta no Supabase:', error);
    
    if (error.message.includes('não encontrada')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    if (error.message.includes('nome')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Erro ao processar solicitação',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Remover ferramenta
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const toolId = params.id;
    
    if (!toolId) {
      return NextResponse.json({ error: 'ID da ferramenta é obrigatório' }, { status: 400 });
    }
    
    // Verificar se a ferramenta existe antes de deletar
    const existingTool = await SupabaseToolsService.getToolById(toolId);
    if (!existingTool) {
      return NextResponse.json({ error: 'Ferramenta não encontrada' }, { status: 404 });
    }
    
    const success = await SupabaseToolsService.deleteTool(toolId);
    
    if (success) {
      return NextResponse.json({ 
        message: 'Ferramenta removida com sucesso', 
        tool: existingTool,
        source: 'supabase'
      });
    } else {
      return NextResponse.json({ error: 'Erro ao remover ferramenta' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro ao remover ferramenta do Supabase:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar solicitação',
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Buscar ferramenta por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const toolId = params.id;
    
    if (!toolId) {
      return NextResponse.json({ error: 'ID da ferramenta é obrigatório' }, { status: 400 });
    }
    
    const tool = await SupabaseToolsService.getToolById(toolId);
    
    if (!tool) {
      return NextResponse.json({ error: 'Ferramenta não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      tool,
      source: 'supabase'
    });
  } catch (error: any) {
    console.error('Erro ao buscar ferramenta no Supabase:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar solicitação',
      details: error.message 
    }, { status: 500 });
  }
}