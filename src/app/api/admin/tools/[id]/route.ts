import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AITool } from '@/types/ai-tool';

const TOOLS_FILE_PATH = path.join(process.cwd(), 'src/data/ai-tools.ts');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Função para verificar autenticação
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  return authHeader === 'Bearer admin-authenticated';
}

// Função para ler as ferramentas do arquivo
function readToolsFromFile(): AITool[] {
  try {
    const fileContent = fs.readFileSync(TOOLS_FILE_PATH, 'utf-8');
    // Extrair o array de ferramentas do arquivo TypeScript
    const match = fileContent.match(/export const aiToolsData: AITool\[\] = (\[[\s\S]*?\]);/);
    if (match) {
      // Usar eval de forma segura para extrair os dados
      const toolsString = match[1];
      return eval(`(${toolsString})`);
    }
    return [];
  } catch (error) {
    console.error('Erro ao ler ferramentas:', error);
    return [];
  }
}

// Função para salvar as ferramentas no arquivo
function saveToolsToFile(tools: AITool[]): boolean {
  try {
    // Criar backup antes de salvar
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `ai-tools-${timestamp}.ts`);
    fs.copyFileSync(TOOLS_FILE_PATH, backupPath);
    
    // Gerar o conteúdo do arquivo
    const fileContent = `import { AITool } from '@/types/ai-tool';

export const aiToolsData: AITool[] = ${JSON.stringify(tools, null, 2)};
`;
    
    fs.writeFileSync(TOOLS_FILE_PATH, fileContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar ferramentas:', error);
    return false;
  }
}

// PUT - Atualizar ferramenta existente
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const updatedTool: AITool = await request.json();
    const { id: toolId } = await params;
    
    if (!toolId) {
      return NextResponse.json({ error: 'ID da ferramenta é obrigatório' }, { status: 400 });
    }
    
    const tools = readToolsFromFile();
    const toolIndex = tools.findIndex(tool => tool.id === toolId);
    
    if (toolIndex === -1) {
      return NextResponse.json({ error: 'Ferramenta não encontrada' }, { status: 404 });
    }
    
    // Manter o ID original
    updatedTool.id = toolId;
    tools[toolIndex] = updatedTool;
    
    if (saveToolsToFile(tools)) {
      return NextResponse.json({ message: 'Ferramenta atualizada com sucesso', tool: updatedTool });
    } else {
      return NextResponse.json({ error: 'Erro ao salvar ferramenta' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao atualizar ferramenta:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}

// DELETE - Remover ferramenta
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const { id: toolId } = await params;
    
    if (!toolId) {
      return NextResponse.json({ error: 'ID da ferramenta é obrigatório' }, { status: 400 });
    }
    
    const tools = readToolsFromFile();
    const toolIndex = tools.findIndex(tool => tool.id === toolId);
    
    if (toolIndex === -1) {
      return NextResponse.json({ error: 'Ferramenta não encontrada' }, { status: 404 });
    }
    
    const removedTool = tools.splice(toolIndex, 1)[0];
    
    if (saveToolsToFile(tools)) {
      return NextResponse.json({ message: 'Ferramenta removida com sucesso', tool: removedTool });
    } else {
      return NextResponse.json({ error: 'Erro ao salvar alterações' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao remover ferramenta:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}