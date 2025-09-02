# Migração para Supabase

Este documento descreve o processo de migração das ferramentas de IA do sistema de arquivos local para o Supabase.

## 📋 Pré-requisitos

1. **Conta no Supabase**: Crie uma conta em [supabase.com](https://supabase.com)
2. **Projeto Supabase**: Crie um novo projeto
3. **Credenciais**: Configure as variáveis de ambiente no arquivo `.env`

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2. Criar Tabela no Supabase

Execute o SQL contido em `supabase/schema.sql` no SQL Editor do Supabase:

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Cole e execute o conteúdo do arquivo `supabase/schema.sql`

Este script irá:
- Criar a tabela `ai_tools`
- Configurar índices para melhor performance
- Configurar RLS (Row Level Security)
- Criar políticas de acesso

## 🚀 Processo de Migração

### 1. Executar Script de Migração

```bash
npm run migrate:supabase
```

Este comando irá:
- Ler os dados do arquivo `src/data/ai-tools.ts`
- Converter para o formato do Supabase
- Inserir os dados na tabela `ai_tools`
- Exibir relatório de progresso

### 2. Verificar Migração

Após a execução, verifique:
- Se todas as ferramentas foram migradas
- Se não há erros no console
- Se os dados estão corretos no painel do Supabase

## 🔄 Novas APIs

Foram criadas novas rotas de API que usam o Supabase:

### Rotas Principais

- `GET /api/admin/tools-supabase` - Listar todas as ferramentas
- `POST /api/admin/tools-supabase` - Criar nova ferramenta
- `GET /api/admin/tools-supabase/[id]` - Buscar ferramenta por ID
- `PUT /api/admin/tools-supabase/[id]` - Atualizar ferramenta
- `DELETE /api/admin/tools-supabase/[id]` - Deletar ferramenta

### Autenticação

Todas as rotas requerem autenticação:
```
Authorization: Bearer admin-authenticated
```

## 📊 Estrutura da Tabela

```sql
ai_tools (
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
)
```

## 🔍 Testando a Migração

### 1. Testar Conexão

```bash
# Verificar se as credenciais estão corretas
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### 2. Testar APIs

Use um cliente HTTP (Postman, curl, etc.) para testar as novas rotas:

```bash
# Listar ferramentas
curl -H "Authorization: Bearer admin-authenticated" \
     http://localhost:3000/api/admin/tools-supabase
```

### 3. Verificar no Painel Admin

Acesse `/admin/tools` e verifique se as operações funcionam corretamente.

## 🚨 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis estão no arquivo `.env`
- Reinicie o servidor de desenvolvimento

### Erro: "relation 'ai_tools' does not exist"
- Execute o script SQL em `supabase/schema.sql`
- Verifique se está no projeto correto do Supabase

### Erro: "Row Level Security"
- Verifique se as políticas RLS foram criadas
- Confirme se as políticas permitem as operações necessárias

### Erro de Autenticação
- Verifique se o header `Authorization` está correto
- Confirme se está usando `Bearer admin-authenticated`

## 📝 Próximos Passos

1. **Atualizar Frontend**: Modificar componentes para usar as novas APIs
2. **Remover APIs Antigas**: Após confirmar que tudo funciona
3. **Otimizações**: Implementar cache, paginação, etc.
4. **Backup**: Configurar backups automáticos no Supabase

## 🔒 Segurança

- As políticas RLS estão configuradas para permitir leitura pública
- Operações de escrita requerem autenticação
- Considere implementar autenticação mais robusta para produção

## 📚 Recursos

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript)