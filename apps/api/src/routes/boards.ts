import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';
import { broadcastToBoard } from '../socket';

const router = Router();

async function assertBoardAccess(boardId: string, userId: string, minRole?: string) {
  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  if (!member) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (board?.visibility === 'PUBLIC') return { role: 'OBSERVER' };
    throw new AppError('Access denied', 403);
  }
  if (minRole === 'ADMIN' && member.role !== 'ADMIN') throw new AppError('Admin access required', 403);
  return member;
}

router.post('/', asyncHandler(async (req: any, res) => {
  const { workspaceId, name, description, visibility, backgroundColor, backgroundUrl, templateId } = req.body;
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: req.userId } },
  });
  if (!member) throw new AppError('Not a workspace member', 403);

  let board;
  if (templateId) {
    const template = await prisma.board.findUnique({ where: { id: templateId, isTemplate: true }, include: { lists: { include: { cards: true } }, labels: true } });
    if (!template) throw new AppError('Template not found', 404);
    board = await prisma.board.create({
      data: {
        workspaceId, name: name || template.name, description, visibility: visibility || template.visibility,
        backgroundColor: backgroundColor || template.backgroundColor, backgroundUrl: backgroundUrl || template.backgroundUrl,
        members: { create: { userId: req.userId, role: 'ADMIN' } },
        labels: { create: template.labels.map(l => ({ name: l.name, color: l.color })) },
        lists: { create: template.lists.map(l => ({ name: l.name, position: l.position })) },
      },
      include: { _count: { select: { lists: true, members: true } } },
    });
  } else {
    board = await prisma.board.create({
      data: {
        workspaceId, name, description, visibility: visibility || 'WORKSPACE',
        backgroundColor, backgroundUrl,
        members: { create: { userId: req.userId, role: 'ADMIN' } },
        labels: {
          create: [
            { name: 'Bug', color: '#ef4444' }, { name: 'Feature', color: '#3b82f6' },
            { name: 'Enhancement', color: '#8b5cf6' }, { name: 'Design', color: '#f59e0b' },
          ],
        },
      },
      include: { _count: { select: { lists: true, members: true } } },
    });
  }
  res.status(201).json({ success: true, data: board });
}));

router.get('/:id', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const board = await prisma.board.findUnique({
    where: { id: req.params.id },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
      members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
      labels: true,
      customFields: true,
      _count: { select: { lists: true, members: true } },
      starredBy: { where: { userId: req.userId }, select: { id: true } },
    },
  });
  if (!board) throw new AppError('Board not found', 404);
  res.json({ success: true, data: { ...board, isStarred: board.starredBy.length > 0, starredBy: undefined } });
}));

router.patch('/:id', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId, 'ADMIN');
  const { name, description, visibility, backgroundColor, backgroundUrl } = req.body;
  const board = await prisma.board.update({
    where: { id: req.params.id },
    data: { ...(name && { name }), ...(description !== undefined && { description }), ...(visibility && { visibility }), ...(backgroundColor !== undefined && { backgroundColor }), ...(backgroundUrl !== undefined && { backgroundUrl }) },
  });
  broadcastToBoard(req.params.id, 'board:updated', board);
  res.json({ success: true, data: board });
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId, 'ADMIN');
  await prisma.board.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.post('/:id/archive', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId, 'ADMIN');
  await prisma.board.update({ where: { id: req.params.id }, data: { isArchived: true } });
  res.json({ success: true });
}));

router.post('/:id/unarchive', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId, 'ADMIN');
  await prisma.board.update({ where: { id: req.params.id }, data: { isArchived: false } });
  res.json({ success: true });
}));

router.post('/:id/star', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  await prisma.starredBoard.upsert({
    where: { boardId_userId: { boardId: req.params.id, userId: req.userId } },
    create: { boardId: req.params.id, userId: req.userId },
    update: {},
  });
  res.json({ success: true });
}));

router.delete('/:id/star', asyncHandler(async (req: any, res) => {
  await prisma.starredBoard.deleteMany({ where: { boardId: req.params.id, userId: req.userId } });
  res.json({ success: true });
}));

router.post('/:id/duplicate', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const original = await prisma.board.findUnique({
    where: { id: req.params.id },
    include: { lists: { include: { cards: true } }, labels: true },
  });
  if (!original) throw new AppError('Board not found', 404);

  const copy = await prisma.board.create({
    data: {
      workspaceId: original.workspaceId, name: `${original.name} (copy)`,
      description: original.description, visibility: original.visibility,
      backgroundColor: original.backgroundColor, backgroundUrl: original.backgroundUrl,
      members: { create: { userId: req.userId, role: 'ADMIN' } },
      labels: { create: original.labels.map(l => ({ name: l.name, color: l.color })) },
    },
  });
  res.status(201).json({ success: true, data: copy });
}));

router.get('/:id/members', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const members = await prisma.boardMember.findMany({
    where: { boardId: req.params.id },
    include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
  });
  res.json({ success: true, data: members });
}));

router.post('/:id/members', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId, 'ADMIN');
  const { userId, role } = req.body;
  const bm = await prisma.boardMember.upsert({
    where: { boardId_userId: { boardId: req.params.id, userId } },
    create: { boardId: req.params.id, userId, role: role || 'MEMBER' },
    update: { role: role || 'MEMBER' },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });
  broadcastToBoard(req.params.id, 'board:member_added', bm);
  res.json({ success: true, data: bm });
}));

router.delete('/:id/members/:userId', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId, 'ADMIN');
  await prisma.boardMember.deleteMany({ where: { boardId: req.params.id, userId: req.params.userId } });
  broadcastToBoard(req.params.id, 'board:member_removed', { userId: req.params.userId });
  res.json({ success: true });
}));

router.get('/:id/labels', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const labels = await prisma.label.findMany({ where: { boardId: req.params.id } });
  res.json({ success: true, data: labels });
}));

router.post('/:id/labels', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const { name, color } = req.body;
  const label = await prisma.label.create({ data: { boardId: req.params.id, name, color } });
  res.status(201).json({ success: true, data: label });
}));

router.patch('/:id/labels/:labelId', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const label = await prisma.label.update({
    where: { id: req.params.labelId },
    data: { ...(req.body.name && { name: req.body.name }), ...(req.body.color && { color: req.body.color }) },
  });
  res.json({ success: true, data: label });
}));

router.delete('/:id/labels/:labelId', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  await prisma.label.delete({ where: { id: req.params.labelId } });
  res.json({ success: true });
}));

router.get('/:id/activity', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  const activities = await prisma.activity.findMany({
    where: { boardId: req.params.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });
  res.json({ success: true, data: activities });
}));

router.get('/:id/custom-fields', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId);
  const fields = await prisma.customField.findMany({ where: { boardId: req.params.id } });
  res.json({ success: true, data: fields });
}));

router.post('/:id/custom-fields', asyncHandler(async (req: any, res) => {
  await assertBoardAccess(req.params.id, req.userId, 'ADMIN');
  const { name, type, options } = req.body;
  const field = await prisma.customField.create({ data: { boardId: req.params.id, name, type, options } });
  res.status(201).json({ success: true, data: field });
}));

export default router;
