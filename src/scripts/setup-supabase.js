const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carrega as variáveis de ambiente
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Credenciais do Supabase não encontradas no arquivo .env');
  console.log('\n📝 Configure as seguintes variáveis no arquivo .env:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL para criar a tabela ai_tools
const createTableSQL = `
CREATE TABLE IF NOT EXISTS ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  license TEXT NOT NULL,
  usability INTEGER NOT NULL CHECK (usability >= 0 AND usability <= 5),
  features JSONB NOT NULL DEFAULT '[]',
  tags JSONB NOT NULL DEFAULT '[]',
  languages JSONB NOT NULL DEFAULT '[]',
  link TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_license ON ai_tools(license);
CREATE INDEX IF NOT EXISTS idx_ai_tools_usability ON ai_tools(usability);
CREATE INDEX IF NOT EXISTS idx_ai_tools_created_at ON ai_tools(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_tools_updated_at
    BEFORE UPDATE ON ai_tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

async function setupSupabase() {
  try {
    console.log('🚀 Configurando Supabase...');
    
    // Testa a conexão
    const { data, error } = await supabase.from('ai_tools').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📋 Tabela ai_tools não existe. Execute o SQL abaixo no Supabase SQL Editor:');
      console.log('\n' + '='.repeat(80));
      console.log(createTableSQL);
      console.log('='.repeat(80));
      console.log('\n💡 Após executar o SQL, rode este script novamente.');
      return;
    }
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    
    // Verifica se há dados na tabela
    const { count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Ferramentas na base de dados: ${count || 0}`);
    
    if (count === 0) {
      console.log('\n💡 Para migrar os dados locais para o Supabase, execute:');
      console.log('node scripts/migrate-to-supabase.js');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
  }
}

setupSupabase();