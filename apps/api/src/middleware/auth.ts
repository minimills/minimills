import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/database';
import { AppError } from './error';

export interface AuthRequest extends Request {
  userId: string;
  user?: {
    id: string;
    email: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Unauthorized', 401));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { userId: string };
    (req as AuthRequest).userId = payload.userId;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export async function loadUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const user = await prisma.user.findUnique({
      where: { id: authReq.userId },
      select: { id: true, email: true, name: true, username: true, avatarUrl: true },
    });
    if (!user) {
      next(new AppError('User not found', 401));
      return;
    }
    authReq.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
