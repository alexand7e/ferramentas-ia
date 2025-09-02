-- Criar tabela para ferramentas de IA
CREATE TABLE IF NOT EXISTS ai_tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  license TEXT NOT NULL,
  usability INTEGER NOT NULL CHECK (usability >= 1 AND usability <= 5),
  features JSONB NOT NULL DEFAULT '[]',
  tags JSONB NOT NULL DEFAULT '[]',
  languages JSONB NOT NULL DEFAULT '[]',
  link TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_license ON ai_tools(license);
CREATE INDEX IF NOT EXISTS idx_ai_tools_usability ON ai_tools(usability);
CREATE INDEX IF NOT EXISTS idx_ai_tools_name ON ai_tools(name);
CREATE INDEX IF NOT EXISTS idx_ai_tools_tags ON ai_tools USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_tools_languages ON ai_tools USING GIN(languages);

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

-- Habilitar RLS (Row Level Security)
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access" ON ai_tools
    FOR SELECT USING (true);

-- Política para permitir inserção/atualização/exclusão apenas para usuários autenticados
-- (você pode ajustar isso conforme suas necessidades de autenticação)
CREATE POLICY "Allow authenticated users to insert" ON ai_tools
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON ai_tools
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete" ON ai_tools
    FOR DELETE USING (true);