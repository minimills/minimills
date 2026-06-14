import { Router } from 'express';
import { searchService } from '../services/search.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';

const router = Router();

router.get('/', asyncHandler(async (req: any, res) => {
  const { q, type, boardId, workspaceId, assigneeId, priority, dueBefore, dueAfter, page, limit } = req.query;
  if (!q || (q as string).trim().length < 2) throw new AppError('Search query must be at least 2 characters', 400);

  const results = await searchService.search(q as string, req.userId, {
    type: type as 'cards' | 'boards' | 'workspaces' | 'all',
    boardId: boardId as string,
    workspaceId: workspaceId as string,
    assigneeId: assigneeId as string,
    priority: priority as string,
    dueBefore: dueBefore as string,
    dueAfter: dueAfter as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  res.json({ success: true, data: results });
}));

export default router;
