# 🚀 Ferramentas IA

Um catálogo curado de ferramentas de inteligência artificial para ajudar desenvolvedores, designers, escritores e profissionais de diversas áreas a encontrar as melhores soluções para seus projetos.

## 💡 A História Por Trás do Projeto

Este projeto nasceu da frustração de passar horas procurando a ferramenta de IA certa para cada tarefa. Com o crescimento exponencial de novas ferramentas surgindo diariamente, criar um catálogo organizado e sempre atualizado se tornou uma necessidade real.

## 📋 Sobre o Projeto

Ferramentas IA é uma plataforma web que reúne e categoriza as melhores ferramentas de inteligência artificial disponíveis no mercado. Nosso objetivo é facilitar a descoberta de recursos que podem aumentar sua produtividade e criatividade - sem perder tempo navegando por dezenas de sites.

## ✨ Tecnologias Utilizadas

Este projeto foi desenvolvido com as seguintes tecnologias:

### 🎯 Framework Principal
- **⚡ Next.js** - Framework React para produção com App Router
- **📘 TypeScript** - JavaScript com tipagem para melhor experiência de desenvolvimento
- **🎨 Tailwind CSS** - Framework CSS utilitário para desenvolvimento rápido de interfaces

### 🧩 Componentes e Estilização
- **🧩 shadcn/ui** - Componentes acessíveis de alta qualidade construídos com Radix UI
- **🎯 Lucide React** - Biblioteca de ícones consistente e bonita
- **🎨 Next Themes** - Suporte a tema escuro de forma simples

### 🔄 Gerenciamento de Estado
- **🐻 Zustand** - Gerenciamento de estado simples e escalável

### 🗄️ Banco de Dados
- **🗄️ Supabase** - Plataforma de banco de dados PostgreSQL como serviço
- **📊 PostgreSQL** - Banco de dados relacional robusto e escalável

### 🌐 Recursos Adicionais
- **🔌 Socket.IO** - Comunicação em tempo real para recursos interativos

## 🚀 Como Iniciar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Iniciar servidor de produção
npm run start:win  # Para Windows
# OU
npm run start      # Para Linux/Mac (requer cross-env)
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação em funcionamento.

## 🗄️ Migração de Dados

Para povoar um banco Supabase novo com os dados das ferramentas de IA:

### 📋 Pré-requisitos

1. Configure as variáveis de ambiente no arquivo `.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

2. Certifique-se de que a tabela `ai_tools` existe no seu banco Supabase

### 🚀 Comandos de Migração

```bash
# Migrar dados do arquivo ai-tools.ts para o Supabase
npm run migrate:data

# Migrar dados limpando a tabela antes (remove dados existentes)
npm run migrate:data:clear
```

### 📊 O que a migração faz:

- ✅ Lê os dados do arquivo `src/data/ai-tools.ts`
- ✅ Conecta ao Supabase usando as credenciais de ambiente
- ✅ Insere os dados em lotes de 50 itens para melhor performance
- ✅ Fornece relatório detalhado do processo
- ✅ Opção para limpar dados existentes antes da migração

### ⚠️ Importante:

- Use `--clear` apenas se quiser substituir todos os dados existentes
- A migração requer a chave de serviço do Supabase (não a chave pública)
- Certifique-se de ter backup dos dados importantes antes de usar `--clear`

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Páginas Next.js com App Router
├── components/          # Componentes React reutilizáveis
│   └── ui/              # Componentes shadcn/ui
├── data/                # Dados das ferramentas de IA
├── hooks/               # Hooks React personalizados
├── lib/                 # Funções utilitárias e configurações
├── stores/              # Gerenciamento de estado com Zustand
└── types/               # Definições de tipos TypeScript
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes sobre como contribuir com o projeto.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

*README escrito com auxílio de inteligência artificial*