const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Socket server up');
});

const io = new Server(server, {
  cors: {
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-chat', (chatId) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat:${chatId}`);
  });

  socket.on('send-message', (data) => {
    socket.to(`chat:${data.chatId}`).emit('new-message', data.message);
  });

  socket.on('typing', (data) => {
    socket.to(`chat:${data.chatId}`).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });

  socket.on('user-online', (userId) => {
    socket.broadcast.emit('user-status', { userId, isOnline: true });
  });

  socket.on('message-read', (data) => {
    socket.to(`chat:${data.chatId}`).emit('message-read', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on http://localhost:${PORT}`);
});
