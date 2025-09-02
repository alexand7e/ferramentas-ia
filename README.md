# 🚀 Ferramentas IA

Um catálogo de ferramentas de inteligência artificial para ajudar desenvolvedores, designers, escritores e profissionais de diversas áreas a encontrar as melhores soluções para seus projetos.

## 📋 Sobre o Projeto

Ferramentas IA é uma plataforma web que reúne e categoriza as melhores ferramentas de inteligência artificial disponíveis no mercado. Nosso objetivo é facilitar a descoberta de recursos que podem aumentar sua produtividade e criatividade.

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
- **🗄️ Prisma** - ORM para Node.js e TypeScript
- **📊 SQLite** - Banco de dados leve para armazenamento local

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

Adoraríamos receber sua contribuição para o projeto! Consulte nosso arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para obter informações sobre como contribuir.

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.