const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciais do Supabase não encontradas no arquivo .env');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Caminho para o arquivo de dados
const TOOLS_FILE_PATH = path.join(process.cwd(), 'src/data/ai-tools.ts');

// Função para ler as ferramentas do arquivo
function readToolsFromFile() {
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
    console.error('❌ Erro ao ler ferramentas do arquivo:', error.message);
    return [];
  }
}

// Função para converter AITool para formato Supabase
function convertToSupabaseFormat(tool) {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    license: tool.license,
    usability: tool.usability,
    features: tool.features,
    tags: tool.tags,
    languages: tool.languages,
    link: tool.link,
    icon: tool.icon
  };
}

// Função principal de migração
async function migrateToSupabase() {
  console.log('🚀 Iniciando migração para Supabase...');
  
  try {
    // 1. Ler dados do arquivo
    console.log('📖 Lendo dados do arquivo ai-tools.ts...');
    const tools = readToolsFromFile();
    
    if (tools.length === 0) {
      console.log('⚠️  Nenhuma ferramenta encontrada no arquivo.');
      return;
    }
    
    console.log(`📊 Encontradas ${tools.length} ferramentas para migrar.`);
    
    // 2. Verificar se a tabela existe e está acessível
    console.log('🔍 Verificando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('ai_tools')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro ao conectar com Supabase:', testError.message);
      console.error('Certifique-se de que:');
      console.error('1. A tabela ai_tools foi criada no Supabase');
      console.error('2. As credenciais estão corretas');
      console.error('3. As políticas RLS estão configuradas corretamente');
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida.');
    
    // 3. Verificar quantas ferramentas já existem
    const { count: existingCount } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📋 Ferramentas já existentes no Supabase: ${existingCount || 0}`);
    
    // 4. Converter dados para formato Supabase
    console.log('🔄 Convertendo dados para formato Supabase...');
    const supabaseTools = tools.map(convertToSupabaseFormat);
    
    // 5. Inserir dados em lotes
    console.log('💾 Inserindo dados no Supabase...');
    const batchSize = 50; // Inserir em lotes de 50
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < supabaseTools.length; i += batchSize) {
      const batch = supabaseTools.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('ai_tools')
          .upsert(batch, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select();
        
        if (error) {
          console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, error.message);
          errorCount += batch.length;
        } else {
          console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} inserido com sucesso (${data.length} itens)`);
          successCount += data.length;
        }
      } catch (batchError) {
        console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, batchError.message);
        errorCount += batch.length;
      }
    }
    
    // 6. Verificar resultado final
    const { count: finalCount } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📊 Resultado da migração:');
    console.log(`✅ Ferramentas inseridas com sucesso: ${successCount}`);
    console.log(`❌ Ferramentas com erro: ${errorCount}`);
    console.log(`📋 Total de ferramentas no Supabase: ${finalCount || 0}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Migração concluída com sucesso!');
      console.log('Você pode agora atualizar as APIs para usar o Supabase.');
    } else {
      console.log('\n⚠️  Nenhuma ferramenta foi migrada. Verifique os erros acima.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Executar migração
if (require.main === module) {
  migrateToSupabase()
    .then(() => {
      console.log('\n🏁 Script de migração finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateToSupabase };