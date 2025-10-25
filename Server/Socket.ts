import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface UserSocket {
  userId: string;
  socketId: string;
}

const userSockets = new Map<string, string>();

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  });

 
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}`);

 
    userSockets.set(userId, socket.id);
    socket.join(userId);

  
    socket.broadcast.emit('user_online', { userId });

  
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      userSockets.delete(userId);
      socket.broadcast.emit('user_offline', { userId });
    });

   
    socket.on('typing', ({ conversationId, recipientId }) => {
      io.to(recipientId).emit('user_typing', {
        conversationId,
        userId
      });
    });

    socket.on('stop_typing', ({ conversationId, recipientId }) => {
      io.to(recipientId).emit('user_stop_typing', {
        conversationId,
        userId
      });
    });

 
    socket.on('message_read', ({ conversationId, recipientId }) => {
      io.to(recipientId).emit('messages_read', {
        conversationId,
        userId
      });
    });
  });

  return io;
};

export const getOnlineUsers = () => {
  return Array.from(userSockets.keys());
};