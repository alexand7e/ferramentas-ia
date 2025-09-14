const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para ler os dados do ai-tools.ts
function loadAiToolsData() {
  try {
    const dataPath = path.join(__dirname, '../data/ai-tools.ts');
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    
    // Remove a exportação e avalia o conteúdo
    const dataContent = fileContent
      .replace(/export\s+const\s+aiToolsData\s*=\s*/, '')
      .replace(/;\s*$/, '');
    
    const aiToolsData = eval(`(${dataContent})`);
    return aiToolsData;
  } catch (error) {
    console.error('❌ Erro ao ler arquivo ai-tools.ts:', error.message);
    process.exit(1);
  }
}

// Função principal de migração
async function migrateData() {
  console.log('🚀 Iniciando migração de dados para o Supabase...');
  
  try {
    // Carrega os dados do arquivo
    const aiToolsData = loadAiToolsData();
    console.log(`📊 Encontrados ${aiToolsData.length} ferramentas para migrar`);
    
    // Limpa a tabela existente (opcional)
    const confirmClear = process.argv.includes('--clear');
    if (confirmClear) {
      console.log('🗑️  Limpando dados existentes...');
      const { error: deleteError } = await supabase
        .from('ai_tools')
        .delete()
        .neq('id', 0); // Deleta todos os registros
      
      if (deleteError) {
        console.error('❌ Erro ao limpar dados:', deleteError.message);
        process.exit(1);
      }
      console.log('✅ Dados existentes removidos');
    }
    
    // Insere os dados em lotes
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < aiToolsData.length; i += batchSize) {
      const batch = aiToolsData.slice(i, i + batchSize);
      
      console.log(`📤 Inserindo lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(aiToolsData.length/batchSize)} (${batch.length} itens)...`);
      
      const { data, error } = await supabase
        .from('ai_tools')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} inserido com sucesso (${data.length} itens)`);
        successCount += data.length;
      }
    }
    
    // Relatório final
    console.log('\n📋 Relatório da Migração:');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total: ${aiToolsData.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migração concluída com sucesso!');
    } else {
      console.log('\n⚠️  Migração concluída com alguns erros.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    process.exit(1);
  }
}

// Executa a migração
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };