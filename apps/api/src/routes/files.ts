import { Router } from 'express';
import { prisma } from '../config/database';
import { storageService } from '../services/storage.service';
import { attachmentUpload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';
import { broadcastToBoard } from '../socket';

const router = Router();

router.post('/cards/:cardId/attachments', uploadLimiter, attachmentUpload.single('file'), asyncHandler(async (req: any, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const card = await prisma.card.findUnique({
    where: { id: req.params.cardId },
    include: { list: { include: { board: true } } },
  });
  if (!card) throw new AppError('Card not found', 404);
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId: card.list.boardId, userId: req.userId } } });
  if (!member) throw new AppError('Access denied', 403);

  const { url, key, name } = await storageService.uploadAttachment(
    req.params.cardId, req.file.buffer, req.file.originalname, req.file.mimetype, req.file.size
  );

  const attachment = await prisma.attachment.create({
    data: { cardId: req.params.cardId, name, url, key, size: req.file.size, mimeType: req.file.mimetype },
  });

  broadcastToBoard(card.list.boardId, 'card:updated', { id: req.params.cardId, attachmentAdded: attachment });
  res.status(201).json({ success: true, data: attachment });
}));

router.delete('/attachments/:id', asyncHandler(async (req: any, res) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id: req.params.id },
    include: { card: { include: { list: { include: { board: true } } } } },
  });
  if (!attachment) throw new AppError('Attachment not found', 404);
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId: attachment.card.list.boardId, userId: req.userId } } });
  if (!member) throw new AppError('Access denied', 403);

  await storageService.deleteFile(attachment.key);
  await prisma.attachment.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

export default router;
