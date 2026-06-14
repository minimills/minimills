import { prisma } from '../config/database';

class ActivityService {
  async log(
    userId: string,
    target: { boardId?: string; cardId?: string },
    type: string,
    data: Record<string, unknown>
  ) {
    await prisma.activity.create({
      data: { userId, boardId: target.boardId, cardId: target.cardId, type, data },
    });
  }
}

export const activityService = new ActivityService();
