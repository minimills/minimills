import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/database';

let io: SocketServer;

export function initializeSocket(server: HTTPServer): SocketServer {
  io = new SocketServer(server, {
    cors: {
      origin: config.frontendUrl,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, config.jwt.secret) as { userId: string };
      (socket as AuthenticatedSocket).userId = payload.userId;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, avatarUrl: true },
      });
      if (!user) return next(new Error('User not found'));
      (socket as AuthenticatedSocket).user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Update last seen
    prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } }).catch(console.error);

    // Board room management
    socket.on('board:join', async (boardId: string) => {
      const member = await prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId } },
      });
      if (!member) {
        const board = await prisma.board.findUnique({ where: { id: boardId } });
        if (board?.visibility !== 'PUBLIC') return;
      }
      socket.join(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit('presence:join', {
        data: { userId, name: authSocket.user.name, avatarUrl: authSocket.user.avatarUrl, joinedAt: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('board:leave', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit('presence:leave', {
        data: { userId },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('presence:update', (data: { boardId: string; activeCardId?: string }) => {
      socket.to(`board:${data.boardId}`).emit('presence:update', {
        data: { userId, activeCardId: data.activeCardId },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      // Notify all board rooms this user was in
      const rooms = [...socket.rooms].filter((r) => r.startsWith('board:'));
      rooms.forEach((room) => {
        socket.to(room).emit('presence:leave', {
          data: { userId },
          timestamp: new Date().toISOString(),
        });
      });
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function broadcastToBoard(boardId: string, event: string, data: unknown): void {
  try {
    getIO().to(`board:${boardId}`).emit(event, {
      data,
      boardId,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Socket not initialized yet
  }
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  try {
    getIO().to(`user:${userId}`).emit(event, {
      data,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Socket not initialized yet
  }
}

interface AuthenticatedSocket extends Socket {
  userId: string;
  user: { id: string; name: string; avatarUrl: string | null };
}
