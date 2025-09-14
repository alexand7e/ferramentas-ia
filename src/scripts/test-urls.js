const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Função para normalizar URL
function normalizeUrl(url) {
  // Se não tem protocolo, adiciona https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

// Função para fazer requisição HTTP/HTTPS
function testUrl(originalUrl) {
  return new Promise((resolve) => {
    try {
      const url = normalizeUrl(originalUrl);
      const protocol = url.startsWith('https:') ? https : http;
      const timeout = 10000; // 10 segundos
      
      const req = protocol.get(url, { timeout }, (res) => {
        resolve({
          url: originalUrl,
          normalizedUrl: url,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
          error: null
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url: originalUrl,
          normalizedUrl: url,
          status: null,
          success: false,
          error: 'Timeout'
        });
      });
      
      req.on('error', (err) => {
        resolve({
          url: originalUrl,
          normalizedUrl: url,
          status: null,
          success: false,
          error: err.message
        });
      });
    } catch (error) {
      resolve({
        url: originalUrl,
        normalizedUrl: null,
        status: null,
        success: false,
        error: `URL inválida: ${error.message}`
      });
    }
  });
}

// Função para extrair URLs do arquivo ai-tools.ts
function extractUrls() {
  try {
    const filePath = path.join(__dirname, '..', 'src', 'data', 'ai-tools.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Regex para encontrar URLs de link e icon
    const linkRegex = /"link":\s*"([^"]+)"/g;
    const iconRegex = /"icon":\s*"([^"]+)"/g;
    
    const urls = new Set();
    let match;
    
    // Extrair links
    while ((match = linkRegex.exec(content)) !== null) {
      urls.add({ url: match[1], type: 'link' });
    }
    
    // Extrair ícones
    while ((match = iconRegex.exec(content)) !== null) {
      urls.add({ url: match[1], type: 'icon' });
    }
    
    return Array.from(urls);
  } catch (error) {
    console.error('Erro ao ler o arquivo ai-tools.ts:', error.message);
    return [];
  }
}

// Função principal
async function main() {
  console.log('🔍 Iniciando teste de URLs do ai-tools.ts...');
  console.log('=' .repeat(50));
  
  const urlsToTest = extractUrls();
  console.log(`📊 Total de URLs encontradas: ${urlsToTest.length}`);
  console.log('');
  
  const results = [];
  const batchSize = 5; // Testar 5 URLs por vez para não sobrecarregar
  
  for (let i = 0; i < urlsToTest.length; i += batchSize) {
    const batch = urlsToTest.slice(i, i + batchSize);
    console.log(`🧪 Testando URLs ${i + 1}-${Math.min(i + batchSize, urlsToTest.length)}...`);
    
    const batchPromises = batch.map(({ url, type }) => 
      testUrl(url).then(result => ({ ...result, type }))
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Pequena pausa entre batches
    if (i + batchSize < urlsToTest.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Gerar relatório
  generateReport(results);
  generateAdditionalReports(results);
}

// Função para gerar relatório
function generateReport(results) {
  console.log('\n' + '=' .repeat(50));
  console.log('📋 RELATÓRIO DE TESTE DE URLs');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const linkResults = results.filter(r => r.type === 'link');
  const iconResults = results.filter(r => r.type === 'icon');
  
  console.log(`\n📈 RESUMO:`);
  console.log(`   Total testadas: ${results.length}`);
  console.log(`   ✅ Funcionando: ${successful.length} (${((successful.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Com problemas: ${failed.length} (${((failed.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`   🔗 Links: ${linkResults.length} (${linkResults.filter(r => r.success).length} OK)`);
  console.log(`   🎨 Ícones: ${iconResults.length} (${iconResults.filter(r => r.success).length} OK)`);
  
  if (failed.length > 0) {
    console.log(`\n❌ URLs COM PROBLEMAS:`);
    console.log('-' .repeat(50));
    
    failed.forEach((result, index) => {
      console.log(`${index + 1}. [${result.type.toUpperCase()}] ${result.url}`);
      console.log(`   Status: ${result.status || 'N/A'}`);
      console.log(`   Erro: ${result.error || 'Status HTTP inválido'}`);
      console.log('');
    });
  }
  
  // Salvar relatório em arquivo
  const reportPath = path.join(__dirname, 'url-test-report.txt');
  const reportContent = generateTextReport(results);
  
  try {
    fs.writeFileSync(reportPath, reportContent);
    console.log(`💾 Relatório salvo em: ${reportPath}`);
  } catch (error) {
    console.error('Erro ao salvar relatório:', error.message);
  }
  
  console.log('\n✨ Teste concluído!');
}

// Função para gerar relatório em texto
function generateTextReport(results) {
  const timestamp = new Date().toLocaleString('pt-BR');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  let report = `RELATÓRIO DE TESTE DE URLs - AI TOOLS\n`;
  report += `Gerado em: ${timestamp}\n`;
  report += `${'='.repeat(60)}\n\n`;
  
  report += `RESUMO:\n`;
  report += `Total de URLs testadas: ${results.length}\n`;
  report += `URLs funcionando: ${successful.length} (${((successful.length / results.length) * 100).toFixed(1)}%)\n`;
  report += `URLs com problemas: ${failed.length} (${((failed.length / results.length) * 100).toFixed(1)}%)\n\n`;
  
  if (failed.length > 0) {
    report += `URLS COM PROBLEMAS:\n`;
    report += `${'-'.repeat(40)}\n`;
    
    failed.forEach((result, index) => {
      report += `${index + 1}. [${result.type.toUpperCase()}] ${result.url}\n`;
      report += `   Status: ${result.status || 'N/A'}\n`;
      report += `   Erro: ${result.error || 'Status HTTP inválido'}\n\n`;
    });
  }
  
  report += `\nURLs FUNCIONANDO:\n`;
  report += `${'-'.repeat(40)}\n`;
  successful.forEach((result, index) => {
    report += `${index + 1}. [${result.type.toUpperCase()}] ${result.url} (Status: ${result.status})\n`;
  });
  
  return report;
}

// Função para gerar relatórios adicionais
function generateAdditionalReports(results) {
  const timestamp = new Date().toISOString();
  
  // Gerar relatório JSON
  const jsonReport = {
    metadata: {
      generatedAt: timestamp,
      totalUrls: results.length,
      successfulUrls: results.filter(r => r.success).length,
      failedUrls: results.filter(r => !r.success).length,
      successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(1)
    },
    results: results
  };
  
  try {
    const jsonPath = path.join(__dirname, 'url-test-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`📄 Relatório JSON salvo em: ${jsonPath}`);
  } catch (error) {
    console.error('Erro ao salvar relatório JSON:', error.message);
  }
  
  // Gerar relatório HTML
  try {
    const htmlPath = path.join(__dirname, 'url-test-report.html');
    const htmlContent = generateHtmlReport(results);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`🌐 Relatório HTML salvo em: ${htmlPath}`);
  } catch (error) {
    console.error('Erro ao salvar relatório HTML:', error.message);
  }
}

// Função para gerar relatório HTML
function generateHtmlReport(results) {
  const timestamp = new Date().toLocaleString('pt-BR');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const linkResults = results.filter(r => r.type === 'link');
  const iconResults = results.filter(r => r.type === 'icon');
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Teste de URLs - AI Tools</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 10px; }
        .timestamp { text-align: center; color: #666; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat-card.success { border-left-color: #28a745; }
        .stat-card.error { border-left-color: #dc3545; }
        .stat-number { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .url-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #dc3545; }
        .url-item.success { border-left-color: #28a745; }
        .url-type { display: inline-block; background: #007bff; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-right: 10px; }
        .url-type.icon { background: #6f42c1; }
        .url-link { color: #007bff; text-decoration: none; word-break: break-all; }
        .url-status { margin-top: 5px; font-size: 0.9em; }
        .status-ok { color: #28a745; }
        .status-error { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Relatório de Teste de URLs - AI Tools</h1>
        <div class="timestamp">Gerado em: ${timestamp}</div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${results.length}</div>
                <div class="stat-label">Total de URLs</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number">${successful.length}</div>
                <div class="stat-label">URLs Funcionando (${((successful.length / results.length) * 100).toFixed(1)}%)</div>
            </div>
            <div class="stat-card error">
                <div class="stat-number">${failed.length}</div>
                <div class="stat-label">URLs com Problemas (${((failed.length / results.length) * 100).toFixed(1)}%)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${linkResults.length}</div>
                <div class="stat-label">Links (${linkResults.filter(r => r.success).length} OK)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${iconResults.length}</div>
                <div class="stat-label">Ícones (${iconResults.filter(r => r.success).length} OK)</div>
            </div>
        </div>
        
        ${failed.length > 0 ? `
        <div class="section">
            <h2>❌ URLs com Problemas (${failed.length})</h2>
            ${failed.map((result, index) => `
            <div class="url-item">
                <span class="url-type ${result.type}">${result.type.toUpperCase()}</span>
                <a href="${result.url}" target="_blank" class="url-link">${result.url}</a>
                <div class="url-status status-error">
                    Status: ${result.status || 'N/A'} | Erro: ${result.error || 'Status HTTP inválido'}
                </div>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="section">
            <h2>✅ URLs Funcionando (${successful.length})</h2>
            ${successful.slice(0, 20).map((result, index) => `
            <div class="url-item success">
                <span class="url-type ${result.type}">${result.type.toUpperCase()}</span>
                <a href="${result.url}" target="_blank" class="url-link">${result.url}</a>
                <div class="url-status status-ok">
                    Status: ${result.status}
                </div>
            </div>
            `).join('')}
            ${successful.length > 20 ? `<p><em>... e mais ${successful.length - 20} URLs funcionando</em></p>` : ''}
        </div>
    </div>
</body>
</html>`;
}

// Executar o script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testUrl, extractUrls, main, generateAdditionalReports, generateHtmlReport };