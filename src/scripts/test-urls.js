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
    const filePath = path.join(__dirname, '..', 'data', 'ai-tools.ts');
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
  

}



// Executar o script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testUrl, extractUrls, main, generateAdditionalReports };