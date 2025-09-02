import { NextRequest, NextResponse } from 'next/server';
import { SupabaseToolsService } from '@/lib/supabase-service';
import { AITool } from '@/types/ai-tool';

export const dynamic = 'force-dynamic';

// Verificar autenticação
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer admin-authenticated';
}

// GET - Listar todas as ferramentas
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const tools = await SupabaseToolsService.getAllTools();
    const total = await SupabaseToolsService.getToolsCount();
    
    return NextResponse.json({ 
      tools, 
      total,
      source: 'supabase'
    });
  } catch (error: any) {
    console.error('Erro ao carregar ferramentas do Supabase:', error);
    return NextResponse.json({ 
      error: 'Erro ao carregar ferramentas',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Adicionar nova ferramenta
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const newTool: AITool = await request.json();
    
    // Validar dados obrigatórios
    if (!newTool.name || !newTool.description || !newTool.link || !newTool.category) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }
    
    // Gerar ID único se não fornecido
    if (!newTool.id) {
      const tools = await SupabaseToolsService.getAllTools();
      const maxId = Math.max(...tools.map(t => parseInt(t.id) || 0), 0);
      newTool.id = (maxId + 1).toString();
    }
    
    // Definir datas se não fornecidas
    if (!newTool.createdAt) {
      newTool.createdAt = new Date().toISOString().split('T')[0];
    }
    if (!newTool.updatedAt) {
      newTool.updatedAt = new Date().toISOString().split('T')[0];
    }
    
    const createdTool = await SupabaseToolsService.createTool(newTool);
    
    return NextResponse.json({ 
      message: 'Ferramenta adicionada com sucesso', 
      tool: createdTool,
      source: 'supabase'
    });
  } catch (error: any) {
    console.error('Erro ao criar ferramenta no Supabase:', error);
    
    if (error.message.includes('nome')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Erro ao processar solicitação',
      details: error.message 
    }, { status: 500 });
  }
}