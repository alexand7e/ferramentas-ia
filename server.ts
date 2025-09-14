// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = Number(process.env.PORT) || 3000;
const hostname = '0.0.0.0';

// Servidor customizado com integração Socket.IO
async function createCustomServer() {
  try {
    // Criar aplicação Next.js
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // Em produção, usar o diretório atual onde .next está localizado
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Criar servidor HTTP que irá gerenciar tanto Next.js quanto Socket.IO
    const server = createServer((req, res) => {
      // Pular requisições socket.io do manipulador Next.js
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Configurar Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Iniciar o servidor
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
