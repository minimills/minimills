import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';
import { broadcastToBoard } from '../socket';
import { notificationService } from '../services/notification.service';
import { activityService } from '../services/activity.service';
import { automationService } from '../services/automation.service';

const router = Router();

async function getCardWithBoard(cardId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { include: { board: true } } },
  });
  if (!card) throw new AppError('Card not found', 404);
  return card;
}

async function assertCardAccess(cardId: string, userId: string) {
  const card = await getCardWithBoard(cardId);
  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: card.list.boardId, userId } },
  });
  if (!member) throw new AppError('Access denied', 403);
  return { card, member };
}

router.post('/', asyncHandler(async (req: any, res) => {
  const { listId, title, description } = req.body;
  const list = await prisma.list.findUnique({ where: { id: listId }, include: { board: true } });
  if (!list) throw new AppError('List not found', 404);
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId: list.boardId, userId: req.userId } } });
  if (!member) throw new AppError('Access denied', 403);
  if (member.role === 'OBSERVER') throw new AppError('Observers cannot create cards', 403);

  const lastCard = await prisma.card.findFirst({ where: { listId }, orderBy: { position: 'desc' } });
  const position = (lastCard?.position ?? 0) + 1000;

  const card = await prisma.card.create({
    data: { listId, title, description, position, createdById: req.userId },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      labels: { include: { label: true } },
      _count: { select: { comments: true, attachments: true, checklists: true } },
    },
  });

  broadcastToBoard(list.boardId, 'card:created', { ...card, listId });
  await activityService.log(req.userId, { boardId: list.boardId, cardId: card.id }, 'card_created', { cardTitle: title, listName: list.name });
  await automationService.executeRules(list.boardId, 'CARD_CREATED', { cardId: card.id, listId, boardId: list.boardId });

  res.status(201).json({ success: true, data: card });
}));

router.get('/:id', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const fullCard = await prisma.card.findUnique({
    where: { id: req.params.id },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      labels: { include: { label: true } },
      attachments: true,
      checklists: { include: { items: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } },
      comments: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } }, reactions: true },
        orderBy: { createdAt: 'asc' },
      },
      customFieldValues: { include: { customField: true } },
      _count: { select: { comments: true, attachments: true, checklists: true } },
    },
  });
  res.json({ success: true, data: fullCard });
}));

router.patch('/:id', asyncHandler(async (req: any, res) => {
  const { card, member } = await assertCardAccess(req.params.id, req.userId);
  if (member.role === 'OBSERVER') throw new AppError('Observers cannot edit cards', 403);

  const prevListId = card.listId;
  const { title, description, listId, position, coverUrl, coverColor, priority, startDate, dueDate } = req.body;

  const updated = await prisma.card.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(listId !== undefined && { listId }),
      ...(position !== undefined && { position }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(coverColor !== undefined && { coverColor }),
      ...(priority !== undefined && { priority }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: {
      assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      labels: { include: { label: true } },
      _count: { select: { comments: true, attachments: true, checklists: true } },
    },
  });

  const boardId = card.list.boardId;
  if (listId && listId !== prevListId) {
    broadcastToBoard(boardId, 'card:moved', { card: updated, fromListId: prevListId, toListId: listId });
    await automationService.executeRules(boardId, 'CARD_MOVED', { cardId: req.params.id, listId, boardId, previousListId: prevListId });
  } else {
    broadcastToBoard(boardId, 'card:updated', updated);
  }

  res.json({ success: true, data: updated });
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
  const { card, member } = await assertCardAccess(req.params.id, req.userId);
  if (member.role !== 'ADMIN') throw new AppError('Admin access required', 403);
  await prisma.card.update({ where: { id: req.params.id }, data: { isArchived: true } });
  broadcastToBoard(card.list.boardId, 'card:deleted', { id: req.params.id, listId: card.listId });
  res.json({ success: true });
}));

router.post('/reorder', asyncHandler(async (req: any, res) => {
  const { boardId, cards } = req.body; // [{ id, listId, position }]
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId, userId: req.userId } } });
  if (!member) throw new AppError('Access denied', 403);
  await Promise.all(
    cards.map((c: { id: string; listId: string; position: number }) =>
      prisma.card.update({ where: { id: c.id }, data: { listId: c.listId, position: c.position } })
    )
  );
  broadcastToBoard(boardId, 'card:reordered', { cards });
  res.json({ success: true });
}));

// Assignees
router.post('/:id/assignees', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const { userId } = req.body;
  await prisma.cardAssignee.upsert({
    where: { cardId_userId: { cardId: req.params.id, userId } },
    create: { cardId: req.params.id, userId },
    update: {},
  });
  const assigner = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
  await notificationService.notifyCardAssigned(req.params.id, userId, assigner?.name || 'Someone');
  broadcastToBoard(card.list.boardId, 'card:updated', { id: req.params.id, assigneeAdded: userId });
  res.json({ success: true });
}));

router.delete('/:id/assignees/:userId', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  await prisma.cardAssignee.deleteMany({ where: { cardId: req.params.id, userId: req.params.userId } });
  broadcastToBoard(card.list.boardId, 'card:updated', { id: req.params.id, assigneeRemoved: req.params.userId });
  res.json({ success: true });
}));

// Labels
router.post('/:id/labels', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const { labelId } = req.body;
  await prisma.cardLabel.upsert({
    where: { cardId_labelId: { cardId: req.params.id, labelId } },
    create: { cardId: req.params.id, labelId },
    update: {},
  });
  broadcastToBoard(card.list.boardId, 'card:updated', { id: req.params.id, labelAdded: labelId });
  res.json({ success: true });
}));

router.delete('/:id/labels/:labelId', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  await prisma.cardLabel.deleteMany({ where: { cardId: req.params.id, labelId: req.params.labelId } });
  broadcastToBoard(card.list.boardId, 'card:updated', { id: req.params.id, labelRemoved: req.params.labelId });
  res.json({ success: true });
}));

// Checklists
router.post('/:id/checklists', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const { name } = req.body;
  const lastChecklist = await prisma.checklist.findFirst({ where: { cardId: req.params.id }, orderBy: { position: 'desc' } });
  const checklist = await prisma.checklist.create({
    data: { cardId: req.params.id, name, position: (lastChecklist?.position ?? 0) + 1000 },
    include: { items: true },
  });
  broadcastToBoard(card.list.boardId, 'checklist:created', checklist);
  res.status(201).json({ success: true, data: checklist });
}));

router.patch('/:id/checklists/:checklistId', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const updated = await prisma.checklist.update({
    where: { id: req.params.checklistId },
    data: { name: req.body.name },
    include: { items: true },
  });
  broadcastToBoard(card.list.boardId, 'checklist:updated', updated);
  res.json({ success: true, data: updated });
}));

router.delete('/:id/checklists/:checklistId', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  await prisma.checklist.delete({ where: { id: req.params.checklistId } });
  broadcastToBoard(card.list.boardId, 'checklist:deleted', { id: req.params.checklistId, cardId: req.params.id });
  res.json({ success: true });
}));

router.post('/:id/checklists/:checklistId/items', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const { title } = req.body;
  const lastItem = await prisma.checklistItem.findFirst({ where: { checklistId: req.params.checklistId }, orderBy: { position: 'desc' } });
  const item = await prisma.checklistItem.create({
    data: { checklistId: req.params.checklistId, title, position: (lastItem?.position ?? 0) + 1000 },
  });
  broadcastToBoard(card.list.boardId, 'checklist_item:updated', { checklistId: req.params.checklistId, item });
  res.status(201).json({ success: true, data: item });
}));

router.patch('/:id/checklists/:checklistId/items/:itemId', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const item = await prisma.checklistItem.update({
    where: { id: req.params.itemId },
    data: {
      ...(req.body.title !== undefined && { title: req.body.title }),
      ...(req.body.isCompleted !== undefined && { isCompleted: req.body.isCompleted }),
    },
  });
  broadcastToBoard(card.list.boardId, 'checklist_item:updated', { checklistId: req.params.checklistId, item });
  res.json({ success: true, data: item });
}));

router.delete('/:id/checklists/:checklistId/items/:itemId', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  await prisma.checklistItem.delete({ where: { id: req.params.itemId } });
  res.json({ success: true });
}));

// Watchers
router.post('/:id/watch', asyncHandler(async (req: any, res) => {
  await assertCardAccess(req.params.id, req.userId);
  await prisma.cardWatcher.upsert({
    where: { cardId_userId: { cardId: req.params.id, userId: req.userId } },
    create: { cardId: req.params.id, userId: req.userId },
    update: {},
  });
  res.json({ success: true });
}));

router.delete('/:id/watch', asyncHandler(async (req: any, res) => {
  await prisma.cardWatcher.deleteMany({ where: { cardId: req.params.id, userId: req.userId } });
  res.json({ success: true });
}));

// Custom fields
router.patch('/:id/custom-fields/:fieldId', asyncHandler(async (req: any, res) => {
  const { card } = await assertCardAccess(req.params.id, req.userId);
  const value = await prisma.customFieldValue.upsert({
    where: { cardId_customFieldId: { cardId: req.params.id, customFieldId: req.params.fieldId } },
    create: { cardId: req.params.id, customFieldId: req.params.fieldId, value: req.body.value },
    update: { value: req.body.value },
  });
  broadcastToBoard(card.list.boardId, 'card:updated', { id: req.params.id, customFieldUpdated: value });
  res.json({ success: true, data: value });
}));

export default router;
