import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export function initSocket(server: HttpServer): Server {
    io = new Server(server, {
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a chat room
        socket.on('join-chat', (chatId: string) => {
            socket.join(`chat:${chatId}`);
            console.log(`Socket ${socket.id} joined chat:${chatId}`);
        });

        // Leave a chat room
        socket.on('leave-chat', (chatId: string) => {
            socket.leave(`chat:${chatId}`);
            console.log(`Socket ${socket.id} left chat:${chatId}`);
        });

        // Handle sending a message
        socket.on('send-message', (data: { chatId: string; message: unknown }) => {
            // Broadcast the message to everyone in the chat room except the sender
            socket.to(`chat:${data.chatId}`).emit('new-message', data.message);
        });

        // Handle typing indicator
        socket.on('typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
            socket.to(`chat:${data.chatId}`).emit('user-typing', {
                userId: data.userId,
                isTyping: data.isTyping,
            });
        });

        // Handle user going online
        socket.on('user-online', (userId: string) => {
            socket.broadcast.emit('user-status', { userId, isOnline: true });
        });

        // Handle read receipts
        socket.on('message-read', (data: { chatId: string; messageId: string; readBy: string }) => {
            socket.to(`chat:${data.chatId}`).emit('message-read', data);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO(): Server {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initSocket first.');
    }
    return io;
}
