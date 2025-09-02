# Configuração do Supabase

Este guia explica como configurar o Supabase para gerenciar as ferramentas de IA no banco de dados.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Defina um nome para o projeto (ex: "ferramentas-ia")
6. Escolha uma senha forte para o banco
7. Selecione uma região próxima
8. Clique em "Create new project"

## 2. Obter Credenciais

Após criar o projeto:

1. Vá para **Settings** > **API**
2. Copie a **Project URL**
3. Copie a **anon public** key

## 3. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores pelas suas credenciais:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## 4. Criar Tabela no Banco

1. No painel do Supabase, vá para **SQL Editor**
2. Execute o seguinte SQL:

```sql
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
```

## 5. Configurar Políticas de Segurança (RLS)

Para permitir acesso público de leitura e restringir escrita:

```sql
-- Habilitar RLS
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos
CREATE POLICY "Permitir leitura pública" ON ai_tools
    FOR SELECT USING (true);

-- Permitir escrita apenas para usuários autenticados (opcional)
CREATE POLICY "Permitir escrita para autenticados" ON ai_tools
    FOR ALL USING (auth.role() = 'authenticated');
```

## 6. Testar Configuração

Execute o script de teste:

```bash
node scripts/setup-supabase.js
```

Se tudo estiver correto, você verá:
```
✅ Conexão com Supabase estabelecida!
📊 Ferramentas na base de dados: 0
```

## 7. Migrar Dados Existentes

Para transferir os dados do arquivo local para o Supabase:

```bash
node scripts/migrate-to-supabase.js
```

## 8. Verificar no Painel

1. Vá para **Table Editor** no painel do Supabase
2. Selecione a tabela `ai_tools`
3. Verifique se os dados foram inseridos corretamente

## Troubleshooting

### Erro de Conexão
- Verifique se as URLs e chaves estão corretas
- Confirme que o projeto está ativo no Supabase

### Erro de Permissão
- Verifique as políticas RLS
- Confirme que a chave anon tem as permissões necessárias

### Dados Não Aparecem
- Verifique se a migração foi executada com sucesso
- Confirme que a tabela foi criada corretamente

## Próximos Passos

Após a configuração:

1. As rotas da API em `/api/admin/tools-supabase` estarão funcionais
2. Você pode criar, editar e excluir ferramentas via API
3. Os dados serão persistidos no Supabase
4. Acesse `/admin/tools` para gerenciar as ferramentas via interface