import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';
import { broadcastToBoard } from '../socket';
import { notificationService } from '../services/notification.service';

const router = Router();

async function getCommentWithBoard(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: { card: { include: { list: { include: { board: true } } } } },
  });
}

router.post('/cards/:cardId', asyncHandler(async (req: any, res) => {
  const card = await prisma.card.findUnique({
    where: { id: req.params.cardId },
    include: { list: { include: { board: true } } },
  });
  if (!card) throw new AppError('Card not found', 404);
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId: card.list.boardId, userId: req.userId } } });
  if (!member) throw new AppError('Access denied', 403);
  if (member.role === 'OBSERVER') throw new AppError('Observers cannot comment', 403);

  const comment = await prisma.comment.create({
    data: { cardId: req.params.cardId, userId: req.userId, content: req.body.content },
    include: { user: { select: { id: true, name: true, avatarUrl: true } }, reactions: true },
  });

  broadcastToBoard(card.list.boardId, 'comment:created', comment);

  // Notify mentions (@username)
  const mentions = req.body.content.match(/@([a-zA-Z0-9_]+)/g) || [];
  if (mentions.length > 0) {
    const usernames = mentions.map((m: string) => m.slice(1));
    const mentionedUsers = await prisma.user.findMany({ where: { username: { in: usernames } }, select: { id: true } });
    const commenter = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
    await notificationService.notifyMentions(req.params.cardId, mentionedUsers.map(u => u.id), commenter?.name || 'Someone');
  }

  const commenter = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
  await notificationService.notifyCardCommented(req.params.cardId, commenter?.name || 'Someone', req.userId);

  res.status(201).json({ success: true, data: comment });
}));

router.patch('/:id', asyncHandler(async (req: any, res) => {
  const comment = await getCommentWithBoard(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.userId !== req.userId) throw new AppError('Can only edit own comments', 403);

  const updated = await prisma.comment.update({
    where: { id: req.params.id },
    data: { content: req.body.content, isEdited: true },
    include: { user: { select: { id: true, name: true, avatarUrl: true } }, reactions: true },
  });
  broadcastToBoard(comment.card.list.boardId, 'comment:updated', updated);
  res.json({ success: true, data: updated });
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
  const comment = await getCommentWithBoard(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId: comment.card.list.boardId, userId: req.userId } } });
  if (comment.userId !== req.userId && member?.role !== 'ADMIN') throw new AppError('Cannot delete this comment', 403);
  await prisma.comment.delete({ where: { id: req.params.id } });
  broadcastToBoard(comment.card.list.boardId, 'comment:deleted', { id: req.params.id, cardId: comment.cardId });
  res.json({ success: true });
}));

router.post('/:id/reactions', asyncHandler(async (req: any, res) => {
  const comment = await getCommentWithBoard(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);
  const { emoji } = req.body;
  await prisma.reaction.upsert({
    where: { commentId_userId_emoji: { commentId: req.params.id, userId: req.userId, emoji } },
    create: { commentId: req.params.id, userId: req.userId, emoji },
    update: {},
  });
  broadcastToBoard(comment.card.list.boardId, 'reaction:added', { commentId: req.params.id, userId: req.userId, emoji });
  res.json({ success: true });
}));

router.delete('/:id/reactions/:emoji', asyncHandler(async (req: any, res) => {
  const comment = await getCommentWithBoard(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);
  await prisma.reaction.deleteMany({ where: { commentId: req.params.id, userId: req.userId, emoji: req.params.emoji } });
  broadcastToBoard(comment.card.list.boardId, 'reaction:removed', { commentId: req.params.id, userId: req.userId, emoji: req.params.emoji });
  res.json({ success: true });
}));

export default router;
