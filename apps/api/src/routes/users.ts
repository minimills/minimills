import { Router } from 'express';
import { prisma } from '../config/database';
import { storageService } from '../services/storage.service';
import { authService } from '../services/auth.service';
import { avatarUpload } from '../middleware/upload';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/me', asyncHandler(async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true, email: true, emailVerified: true, name: true, username: true,
      avatarUrl: true, bio: true, twoFactorEnabled: true, lastSeenAt: true,
      notifyEmail: true, notifyAssigned: true, notifyMentioned: true,
      notifyDueDates: true, notifyComments: true, createdAt: true, updatedAt: true,
    },
  });
  res.json({ success: true, data: user });
}));

router.patch('/me', asyncHandler(async (req: any, res) => {
  const { name, username, bio } = req.body;
  if (username) {
    const exists = await prisma.user.findFirst({ where: { username, NOT: { id: req.userId } } });
    if (exists) throw new AppError('Username already taken', 409);
  }
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { ...(name && { name }), ...(username && { username }), ...(bio !== undefined && { bio }) },
    select: { id: true, name: true, username: true, bio: true, avatarUrl: true, updatedAt: true },
  });
  res.json({ success: true, data: user });
}));

router.patch('/me/notifications', asyncHandler(async (req: any, res) => {
  const { notifyEmail, notifyAssigned, notifyMentioned, notifyDueDates, notifyComments } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(notifyEmail !== undefined && { notifyEmail }),
      ...(notifyAssigned !== undefined && { notifyAssigned }),
      ...(notifyMentioned !== undefined && { notifyMentioned }),
      ...(notifyDueDates !== undefined && { notifyDueDates }),
      ...(notifyComments !== undefined && { notifyComments }),
    },
  });
  res.json({ success: true, data: user });
}));

router.post('/me/avatar', avatarUpload.single('avatar'), asyncHandler(async (req: any, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const { url, key } = await storageService.uploadAvatar(req.userId, req.file.buffer, req.file.mimetype);
  await prisma.user.update({ where: { id: req.userId }, data: { avatarUrl: url, avatarKey: key } });
  res.json({ success: true, data: { avatarUrl: url } });
}));

router.delete('/me/avatar', asyncHandler(async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.avatarKey) await storageService.deleteFile(user.avatarKey);
  await prisma.user.update({ where: { id: req.userId }, data: { avatarUrl: null, avatarKey: null } });
  res.json({ success: true });
}));

router.post('/me/change-password', asyncHandler(async (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user?.passwordHash) throw new AppError('No password set', 400);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Current password is incorrect', 401);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });
  res.json({ success: true, message: 'Password changed successfully' });
}));

router.get('/me/sessions', asyncHandler(async (req: any, res) => {
  const sessions = await prisma.session.findMany({
    where: { userId: req.userId },
    orderBy: { lastActiveAt: 'desc' },
  });
  res.json({ success: true, data: sessions });
}));

router.delete('/me/sessions/:id', asyncHandler(async (req: any, res) => {
  await prisma.session.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  res.json({ success: true });
}));

router.get('/:username', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: { id: true, name: true, username: true, avatarUrl: true, bio: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
}));

export default router;
