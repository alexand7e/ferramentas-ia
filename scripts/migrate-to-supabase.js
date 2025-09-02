const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carrega as variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciais do Supabase não encontradas no arquivo .env.local');
  console.log('\n📝 Configure as seguintes variáveis no arquivo .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para mapear dados locais para formato Supabase
function mapAIToolToSupabase(tool) {
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
    icon: tool.icon || '',
    created_at: tool.createdAt || new Date().toISOString(),
    updated_at: tool.updatedAt || new Date().toISOString()
  };
}

async function migrateData() {
  try {
    console.log('🚀 Iniciando migração dos dados para Supabase...');
    
    // Carrega os dados locais
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'ai-tools.ts');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Arquivo ai-tools.ts não encontrado');
      return;
    }
    
    // Lê e processa o arquivo TypeScript
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    
    // Extrai o array de dados (método simples - pode precisar de ajustes)
    const dataMatch = fileContent.match(/export const aiToolsData[^=]*=\s*(\[[\s\S]*?\]);/);
    
    if (!dataMatch) {
      console.error('❌ Não foi possível extrair os dados do arquivo');
      return;
    }
    
    // Avalia o JavaScript (cuidado: só use com dados confiáveis)
    const aiToolsData = eval(dataMatch[1]);
    
    console.log(`📊 Encontradas ${aiToolsData.length} ferramentas para migrar`);
    
    // Verifica se já existem dados no Supabase
    const { count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true });
    
    if (count > 0) {
      console.log(`⚠️  Já existem ${count} registros no Supabase.`);
      console.log('Deseja continuar? Isso pode criar duplicatas. (y/N)');
      
      // Para automação, vamos pular se já houver dados
      console.log('❌ Migração cancelada para evitar duplicatas.');
      return;
    }
    
    // Mapeia os dados para o formato Supabase
    const supabaseData = aiToolsData.map(mapAIToolToSupabase);
    
    // Insere os dados em lotes
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < supabaseData.length; i += batchSize) {
      const batch = supabaseData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('ai_tools')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1}:`, error.message);
        continue;
      }
      
      inserted += batch.length;
      console.log(`✅ Inserido lote ${Math.floor(i/batchSize) + 1} (${inserted}/${supabaseData.length})`);
    }
    
    console.log(`\n🎉 Migração concluída! ${inserted} ferramentas inseridas no Supabase.`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
  }
}

migrateData();