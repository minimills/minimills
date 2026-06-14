import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';
import { broadcastToBoard } from '../socket';
import { activityService } from '../services/activity.service';

const router = Router();

async function assertBoardAccess(boardId: string, userId: string) {
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId, userId } } });
  if (!member) throw new AppError('Access denied', 403);
  return member;
}

router.get('/board/:boardId', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.boardId, req.userId);
  const lists = await prisma.list.findMany({
    where: { boardId: req.params.boardId, isArchived: false },
    include: {
      cards: {
        where: { isArchived: false },
        include: {
          assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
          labels: { include: { label: true } },
          _count: { select: { comments: true, attachments: true, checklists: true } },
        },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { position: 'asc' },
  });
  res.json({ success: true, data: lists });
}));

router.post('/', asyncHandler(async (req: any, res) => {
  const { boardId, name } = req.body;
  await assertBoardAccess(boardId, req.userId);
  const lastList = await prisma.list.findFirst({ where: { boardId }, orderBy: { position: 'desc' } });
  const position = (lastList?.position ?? 0) + 1000;
  const list = await prisma.list.create({ data: { boardId, name, position } });
  broadcastToBoard(boardId, 'list:created', list);
  await activityService.log(req.userId, { boardId }, 'list_created', { listName: name });
  res.status(201).json({ success: true, data: list });
}));

router.patch('/:id', asyncHandler(async (req: any, res) => {
  const list = await prisma.list.findUnique({ where: { id: req.params.id } });
  if (!list) throw new AppError('List not found', 404);
  await assertBoardAccess(list.boardId, req.userId);
  const updated = await prisma.list.update({
    where: { id: req.params.id },
    data: { ...(req.body.name && { name: req.body.name }), ...(req.body.position !== undefined && { position: req.body.position }) },
  });
  broadcastToBoard(list.boardId, 'list:updated', updated);
  res.json({ success: true, data: updated });
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
  const list = await prisma.list.findUnique({ where: { id: req.params.id } });
  if (!list) throw new AppError('List not found', 404);
  await assertBoardAccess(list.boardId, req.userId);
  await prisma.list.update({ where: { id: req.params.id }, data: { isArchived: true } });
  broadcastToBoard(list.boardId, 'list:deleted', { id: req.params.id });
  res.json({ success: true });
}));

router.post('/reorder', asyncHandler(async (req: any, res) => {
  const { boardId, lists } = req.body; // [{ id, position }]
  await assertBoardAccess(boardId, req.userId);
  await Promise.all(
    lists.map((l: { id: string; position: number }) =>
      prisma.list.update({ where: { id: l.id }, data: { position: l.position } })
    )
  );
  broadcastToBoard(boardId, 'list:reordered', { lists });
  res.json({ success: true });
}));

export default router;
