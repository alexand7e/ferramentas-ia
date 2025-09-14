import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Gerenciar mensagens
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: transmitir mensagem apenas para o cliente que enviou a mensagem
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Gerenciar desconexão
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Enviar mensagem de boas-vindas
    socket.emit('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};