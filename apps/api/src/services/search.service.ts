import { prisma } from '../config/database';

class SearchService {
  async search(query: string, userId: string, options: {
    type?: 'cards' | 'boards' | 'workspaces' | 'all';
    boardId?: string;
    workspaceId?: string;
    assigneeId?: string;
    priority?: string;
    dueBefore?: string;
    dueAfter?: string;
    page?: number;
    limit?: number;
  }) {
    const { type = 'all', page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Get user's accessible board IDs
    const boardMembers = await prisma.boardMember.findMany({
      where: { userId },
      select: { boardId: true },
    });
    const accessibleBoardIds = boardMembers.map((bm) => bm.boardId);

    const results: {
      cards?: unknown[];
      boards?: unknown[];
      workspaces?: unknown[];
      total: number;
    } = { total: 0 };

    if (type === 'all' || type === 'cards') {
      const cardWhere = {
        isArchived: false,
        list: { board: { id: { in: options.boardId ? [options.boardId] : accessibleBoardIds } } },
        title: { contains: query, mode: 'insensitive' as const },
        ...(options.assigneeId && { assignees: { some: { userId: options.assigneeId } } }),
        ...(options.priority && { priority: options.priority }),
        ...(options.dueBefore && { dueDate: { lte: new Date(options.dueBefore) } }),
        ...(options.dueAfter && { dueDate: { gte: new Date(options.dueAfter) } }),
      };

      const [cards, cardTotal] = await Promise.all([
        prisma.card.findMany({
          where: cardWhere,
          include: {
            list: { include: { board: { select: { id: true, name: true } } } },
            assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
            labels: { include: { label: true } },
          },
          take: limit,
          skip,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.card.count({ where: cardWhere }),
      ]);

      results.cards = cards;
      results.total += cardTotal;
    }

    if (type === 'all' || type === 'boards') {
      const boardWhere = {
        isArchived: false,
        id: { in: accessibleBoardIds },
        name: { contains: query, mode: 'insensitive' as const },
        ...(options.workspaceId && { workspaceId: options.workspaceId }),
      };

      const [boards, boardTotal] = await Promise.all([
        prisma.board.findMany({
          where: boardWhere,
          include: { workspace: { select: { id: true, name: true, slug: true } } },
          take: limit,
          skip,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.board.count({ where: boardWhere }),
      ]);

      results.boards = boards;
      results.total += boardTotal;
    }

    if (type === 'all' || type === 'workspaces') {
      const workspaceWhere = {
        members: { some: { userId } },
        name: { contains: query, mode: 'insensitive' as const },
      };

      const [workspaces, wsTotal] = await Promise.all([
        prisma.workspace.findMany({
          where: workspaceWhere,
          include: { _count: { select: { members: true, boards: true } } },
          take: limit,
          skip,
        }),
        prisma.workspace.count({ where: workspaceWhere }),
      ]);

      results.workspaces = workspaces;
      results.total += wsTotal;
    }

    return results;
  }
}

export const searchService = new SearchService();
