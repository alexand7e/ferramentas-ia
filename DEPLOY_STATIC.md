# Deploy Estático - Guia de Configuração

Este documento explica as modificações realizadas para tornar o projeto compatível com deploy estático no Render ou outras plataformas similares.

## 🔧 Modificações Realizadas

### 1. Configuração do Next.js para Export Estático

**Arquivo modificado:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  output: 'export',              // Habilita export estático
  trailingSlash: true,           // Adiciona barra no final das URLs
  skipTrailingSlashRedirect: true, // Evita redirecionamentos
  // ... outras configurações
};
```

### 2. Scripts de Build Estático

**Arquivo modificado:** `package.json`

Adicionados novos scripts:
- `build:static`: Gera o build estático
- `start:static`: Serve o build estático localmente

```json
{
  "scripts": {
    "build:static": "next build",
    "start:static": "npx serve out"
  }
}
```

### 3. Socket.IO Tornado Opcional

**Arquivo modificado:** `examples/websocket/page.tsx`

- Removida importação direta do `socket.io-client`
- Adicionada importação dinâmica condicional
- Funcionalidade desabilitada em produção (build estático)
- Mensagem informativa para usuários em modo estático

## 🚀 Como Fazer Deploy no Render

### Opção 1: Deploy Estático (Recomendado)

1. **Configurar o Render:**
   - Tipo de serviço: `Static Site`
   - Build Command: `npm run build:static`
   - Publish Directory: `out`

2. **Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   ```

### Opção 2: Deploy com Servidor (Para funcionalidades completas)

1. **Configurar o Render:**
   - Tipo de serviço: `Web Service`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`

2. **Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   DATABASE_URL=sua_url_do_banco
   ```

## 📁 Estrutura de Arquivos Gerados

Após executar `npm run build:static`, será criada a pasta `out/` contendo:

```
out/
├── _next/           # Assets do Next.js
├── index.html       # Página principal
├── websocket/       # Páginas de exemplo
└── ...              # Outras páginas e assets
```

## ⚠️ Limitações do Build Estático

### Funcionalidades Desabilitadas:
- **WebSocket/Socket.IO**: Requer servidor em execução
- **API Routes**: Não funcionam em builds estáticos
- **Server-Side Rendering (SSR)**: Apenas Static Site Generation (SSG)
- **Banco de Dados**: Prisma requer servidor

### Funcionalidades Mantidas:
- ✅ Interface completa de usuário
- ✅ Navegação entre páginas
- ✅ Temas (claro/escuro)
- ✅ Componentes interativos
- ✅ Dados estáticos (lista de ferramentas IA)

## 🔄 Alternando Entre Modos

### Para Desenvolvimento Completo:
```bash
npm run dev
```

### Para Build Estático:
```bash
npm run build:static
npm run start:static
```

### Para Build com Servidor:
```bash
npm run build
npm run start
```

## 🛠️ Troubleshooting

### Erro: "Image Optimization using the default loader is not compatible with export"
**Solução:** Já configurado no `next.config.ts` com `unoptimized: true` para imagens.

### Erro: "API routes do not work with static export"
**Solução:** API routes foram removidas/desabilitadas para o build estático.

### WebSocket não funciona
**Solução:** Normal em build estático. Use o modo servidor para funcionalidades completas.

## 📝 Notas Importantes

1. **Performance**: O build estático é mais rápido e eficiente para hospedagem
2. **SEO**: Mantém todas as vantagens de SEO do Next.js
3. **Escalabilidade**: Pode ser servido por CDNs globalmente
4. **Custo**: Geralmente mais barato que hospedagem de servidor

---

**Dica:** Para projetos que precisam de funcionalidades de servidor (WebSocket, banco de dados), considere usar o deploy com servidor ou implementar essas funcionalidades como serviços externos (APIs separadas).