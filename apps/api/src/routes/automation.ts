import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';

const router = Router();

async function assertBoardAdmin(boardId: string, userId: string) {
  const member = await prisma.boardMember.findUnique({ where: { boardId_userId: { boardId, userId } } });
  if (!member || member.role !== 'ADMIN') throw new AppError('Admin access required', 403);
}

router.get('/boards/:boardId', asyncHandler(async (req: any, res) => {
  await assertBoardAdmin(req.params.boardId, req.userId);
  const rules = await prisma.automationRule.findMany({
    where: { boardId: req.params.boardId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: rules });
}));

router.post('/boards/:boardId', asyncHandler(async (req: any, res) => {
  await assertBoardAdmin(req.params.boardId, req.userId);
  const { name, trigger, conditions, actions } = req.body;
  const rule = await prisma.automationRule.create({
    data: { boardId: req.params.boardId, name, trigger, conditions: conditions || [], actions },
  });
  res.status(201).json({ success: true, data: rule });
}));

router.patch('/:id', asyncHandler(async (req: any, res) => {
  const rule = await prisma.automationRule.findUnique({ where: { id: req.params.id } });
  if (!rule) throw new AppError('Rule not found', 404);
  await assertBoardAdmin(rule.boardId, req.userId);
  const updated = await prisma.automationRule.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.isEnabled !== undefined && { isEnabled: req.body.isEnabled }),
      ...(req.body.trigger && { trigger: req.body.trigger }),
      ...(req.body.conditions && { conditions: req.body.conditions }),
      ...(req.body.actions && { actions: req.body.actions }),
    },
  });
  res.json({ success: true, data: updated });
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
  const rule = await prisma.automationRule.findUnique({ where: { id: req.params.id } });
  if (!rule) throw new AppError('Rule not found', 404);
  await assertBoardAdmin(rule.boardId, req.userId);
  await prisma.automationRule.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

export default router;
