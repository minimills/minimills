import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  const unreadOnly = req.query.unread === 'true';

  const where = { userId: req.userId, ...(unreadOnly && { isRead: false }) };
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: (page - 1) * limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.userId, isRead: false } }),
  ]);

  res.json({ success: true, data: { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) } });
}));

router.post('/read-all', asyncHandler(async (req: any, res) => {
  await prisma.notification.updateMany({ where: { userId: req.userId, isRead: false }, data: { isRead: true } });
  res.json({ success: true });
}));

router.patch('/:id/read', asyncHandler(async (req: any, res) => {
  await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.userId }, data: { isRead: true } });
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
  await prisma.notification.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  res.json({ success: true });
}));

export default router;
