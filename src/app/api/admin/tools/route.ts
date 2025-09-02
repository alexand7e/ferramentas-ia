import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
import { AITool } from '@/types/ai-tool';

const TOOLS_FILE_PATH = path.join(process.cwd(), 'src/data/ai-tools.ts');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

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
    createBackup();
    
    const fileHeader = `import { AITool } from '@/types/ai-tool';

export const aiToolsData: AITool[] = `;
    
    const toolsJson = JSON.stringify(tools, null, 2);
    const fileContent = fileHeader + toolsJson + ';\n';
    
    fs.writeFileSync(TOOLS_FILE_PATH, fileContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar ferramentas:', error);
    return false;
  }
}

// Função para criar backup
function createBackup(): void {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `ai-tools-${timestamp}.ts`);
    
    fs.copyFileSync(TOOLS_FILE_PATH, backupPath);
    
    // Manter apenas os últimos 10 backups
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('ai-tools-'))
      .sort()
      .reverse();
    
    if (backups.length > 10) {
      backups.slice(10).forEach(backup => {
        fs.unlinkSync(path.join(BACKUP_DIR, backup));
      });
    }
  } catch (error) {
    console.error('Erro ao criar backup:', error);
  }
}

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
    const tools = readToolsFromFile();
    return NextResponse.json({ tools, total: tools.length });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar ferramentas' }, { status: 500 });
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
    
    const tools = readToolsFromFile();
    
    // Verificar se já existe uma ferramenta com o mesmo nome
    if (tools.some(tool => tool.name === newTool.name)) {
      return NextResponse.json({ error: 'Já existe uma ferramenta com este nome' }, { status: 409 });
    }
    
    // Adicionar ID único
    const newId = Math.max(...tools.map(t => parseInt(t.id) || 0), 0) + 1;
    newTool.id = newId.toString();
    
    tools.push(newTool);
    
    if (saveToolsToFile(tools)) {
      return NextResponse.json({ message: 'Ferramenta adicionada com sucesso', tool: newTool });
    } else {
      return NextResponse.json({ error: 'Erro ao salvar ferramenta' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}