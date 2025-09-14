const fs = require('fs');
const path = require('path');

// Função para gerar relatório HTML
function generateHtmlReport(results) {
  const timestamp = new Date().toLocaleString('pt-BR');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const linkResults = results.filter(r => r.type === 'link');
  const iconResults = results.filter(r => r.type === 'icon');
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Teste de URLs - AI Tools</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
        }
        .timestamp {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
        }
        .stat-card.success {
            border-left-color: #28a745;
        }
        .stat-card.error {
            border-left-color: #dc3545;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .url-list {
            display: grid;
            gap: 15px;
        }
        .url-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #dc3545;
        }
        .url-item.success {
            border-left-color: #28a745;
        }
        .url-type {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-right: 10px;
        }
        .url-type.icon {
            background: #6f42c1;
        }
        .url-link {
            color: #007bff;
            text-decoration: none;
            word-break: break-all;
        }
        .url-link:hover {
            text-decoration: underline;
        }
        .url-status {
            margin-top: 5px;
            font-size: 0.9em;
        }
        .status-ok {
            color: #28a745;
        }
        .status-error {
            color: #dc3545;
        }
        .filters {
            margin: 20px 0;
            text-align: center;
        }
        .filter-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            margin: 0 5px;
            border-radius: 4px;
            cursor: pointer;
        }
        .filter-btn:hover {
            background: #0056b3;
        }
        .filter-btn.active {
            background: #28a745;
        }
        .hidden {
            display: none;
        }
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
        
        <div class="filters">
            <button class="filter-btn active" onclick="filterResults('all')">Todas</button>
            <button class="filter-btn" onclick="filterResults('failed')">Com Problemas</button>
            <button class="filter-btn" onclick="filterResults('success')">Funcionando</button>
            <button class="filter-btn" onclick="filterResults('link')">Links</button>
            <button class="filter-btn" onclick="filterResults('icon')">Ícones</button>
        </div>
        
        ${failed.length > 0 ? `
        <div class="section">
            <h2>❌ URLs com Problemas (${failed.length})</h2>
            <div class="url-list">
                ${failed.map((result, index) => `
                <div class="url-item failed" data-type="${result.type}" data-status="failed">
                    <span class="url-type ${result.type}">${result.type.toUpperCase()}</span>
                    <a href="${result.url}" target="_blank" class="url-link">${result.url}</a>
                    <div class="url-status status-error">
                        Status: ${result.status || 'N/A'} | Erro: ${result.error || 'Status HTTP inválido'}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="section">
            <h2>✅ URLs Funcionando (${successful.length})</h2>
            <div class="url-list">
                ${successful.map((result, index) => `
                <div class="url-item success" data-type="${result.type}" data-status="success">
                    <span class="url-type ${result.type}">${result.type.toUpperCase()}</span>
                    <a href="${result.url}" target="_blank" class="url-link">${result.url}</a>
                    <div class="url-status status-ok">
                        Status: ${result.status}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <script>
        function filterResults(filter) {
            const items = document.querySelectorAll('.url-item');
            const buttons = document.querySelectorAll('.filter-btn');
            
            // Atualizar botão ativo
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Filtrar itens
            items.forEach(item => {
                const type = item.dataset.type;
                const status = item.dataset.status;
                
                let show = false;
                
                switch(filter) {
                    case 'all':
                        show = true;
                        break;
                    case 'failed':
                        show = status === 'failed';
                        break;
                    case 'success':
                        show = status === 'success';
                        break;
                    case 'link':
                        show = type === 'link';
                        break;
                    case 'icon':
                        show = type === 'icon';
                        break;
                }
                
                item.style.display = show ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>
  `;
  
  return html;
}

// Função para gerar relatório JSON
function generateJsonReport(results) {
  const timestamp = new Date().toISOString();
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const linkResults = results.filter(r => r.type === 'link');
  const iconResults = results.filter(r => r.type === 'icon');
  
  return {
    metadata: {
      generatedAt: timestamp,
      totalUrls: results.length,
      successfulUrls: successful.length,
      failedUrls: failed.length,
      successRate: ((successful.length / results.length) * 100).toFixed(1),
      linkCount: linkResults.length,
      iconCount: iconResults.length
    },
    summary: {
      links: {
        total: linkResults.length,
        working: linkResults.filter(r => r.success).length,
        broken: linkResults.filter(r => !r.success).length
      },
      icons: {
        total: iconResults.length,
        working: iconResults.filter(r => r.success).length,
        broken: iconResults.filter(r => !r.success).length
      }
    },
    results: {
      failed: failed,
      successful: successful
    }
  };
}

// Função principal para gerar relatórios
function generateReports() {
  try {
    // Ler o arquivo de resultados do teste anterior
    const testResultsPath = path.join(__dirname, 'url-test-report.txt');
    
    if (!fs.existsSync(testResultsPath)) {
      console.log('❌ Arquivo de resultados não encontrado. Execute primeiro: npm run test:urls');
      return;
    }
    
    console.log('📊 Gerando relatórios adicionais...');
    
    // Executar o teste novamente para obter dados estruturados
    const { main } = require('./test-urls.js');
    
    // Como não podemos facilmente capturar os resultados do script anterior,
    // vamos criar um relatório baseado no arquivo de texto existente
    console.log('✅ Relatórios baseados no último teste disponíveis em:');
    console.log('   📄 Texto: scripts/url-test-report.txt');
    console.log('\n💡 Para gerar relatórios HTML e JSON, execute novamente: npm run test:urls');
    
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error.message);
  }
}

// Exportar funções
module.exports = {
  generateHtmlReport,
  generateJsonReport,
  generateReports
};

// Executar se chamado diretamente
if (require.main === module) {
  generateReports();
}