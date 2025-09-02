import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

export const dynamic = 'force-dynamic';

const execAsync = promisify(exec);
const REPORT_DIR = path.join(process.cwd(), 'scripts');
const JSON_REPORT_PATH = path.join(REPORT_DIR, 'url-test-report.json');

interface URLTestResult {
  url: string;
  normalizedUrl: string;
  status: number;
  success: boolean;
  error: string | null;
  type: 'link' | 'icon';
}

interface URLReport {
  metadata: {
    generatedAt: string;
    totalUrls: number;
    successfulUrls: number;
    failedUrls: number;
    successRate: string;
  };
  results: URLTestResult[];
}

// Verificar autenticação
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer admin-authenticated';
}

// Ler relatório existente
function readExistingReport(): URLReport | null {
  try {
    if (fs.existsSync(JSON_REPORT_PATH)) {
      const reportContent = fs.readFileSync(JSON_REPORT_PATH, 'utf-8');
      return JSON.parse(reportContent);
    }
    return null;
  } catch (error) {
    console.error('Erro ao ler relatório:', error);
    return null;
  }
}

// Executar teste de URLs
async function runUrlTest(): Promise<URLReport | null> {
  try {
    const { stdout, stderr } = await execAsync('npm run test:urls', {
      cwd: process.cwd(),
      timeout: 300000 // 5 minutos timeout
    });
    
    console.log('Teste de URLs executado:', stdout);
    if (stderr) {
      console.warn('Avisos do teste:', stderr);
    }
    
    // Ler o relatório gerado
    return readExistingReport();
  } catch (error) {
    console.error('Erro ao executar teste de URLs:', error);
    return null;
  }
}

// GET - Obter relatório de URLs
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    
    let report: URLReport | null = null;
    
    if (refresh) {
      // Executar novo teste
      report = await runUrlTest();
      if (!report) {
        return NextResponse.json({ error: 'Erro ao executar teste de URLs' }, { status: 500 });
      }
    } else {
      // Ler relatório existente
      report = readExistingReport();
      if (!report) {
        return NextResponse.json({ 
          error: 'Nenhum relatório encontrado. Execute um teste primeiro.',
          needsRefresh: true 
        }, { status: 404 });
      }
    }
    
    // Processar dados para o frontend
    const processedReport = {
      ...report,
      summary: {
        total: report.metadata.totalUrls,
        successful: report.metadata.successfulUrls,
        failed: report.metadata.failedUrls,
        successRate: parseFloat(report.metadata.successRate),
        lastUpdated: report.metadata.generatedAt
      },
      failedUrls: report.results.filter(r => !r.success),
      successfulUrls: report.results.filter(r => r.success),
      linkResults: report.results.filter(r => r.type === 'link'),
      iconResults: report.results.filter(r => r.type === 'icon')
    };
    
    return NextResponse.json(processedReport);
  } catch (error) {
    console.error('Erro ao processar relatório:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Executar novo teste de URLs
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  try {
    const report = await runUrlTest();
    
    if (!report) {
      return NextResponse.json({ error: 'Erro ao executar teste de URLs' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Teste de URLs executado com sucesso',
      summary: {
        total: report.metadata.totalUrls,
        successful: report.metadata.successfulUrls,
        failed: report.metadata.failedUrls,
        successRate: parseFloat(report.metadata.successRate),
        lastUpdated: report.metadata.generatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao executar teste:', error);
    return NextResponse.json({ error: 'Erro ao executar teste de URLs' }, { status: 500 });
  }
}