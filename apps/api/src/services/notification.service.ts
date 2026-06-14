import { prisma } from '../config/database';
import { getIO } from '../socket';

type NotificationType =
  | 'CARD_ASSIGNED'
  | 'CARD_COMMENTED'
  | 'CARD_MENTIONED'
  | 'CARD_DUE_SOON'
  | 'CARD_OVERDUE'
  | 'BOARD_INVITED'
  | 'WORKSPACE_INVITED';

class NotificationService {
  async create(userId: string, type: NotificationType, title: string, message: string, data?: object) {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, data: data ?? {} },
    });

    // Emit real-time notification
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification:new', { data: notification, timestamp: new Date().toISOString() });
    } catch {
      // Socket not yet initialized
    }

    return notification;
  }

  async notifyCardAssigned(cardId: string, assigneeId: string, assignedByName: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: true } } },
    });
    if (!card) return;

    await this.create(
      assigneeId,
      'CARD_ASSIGNED',
      'You were assigned to a card',
      `${assignedByName} assigned you to "${card.title}"`,
      { cardId, boardId: card.list.boardId, boardName: card.list.board.name }
    );
  }

  async notifyCardCommented(cardId: string, commenterName: string, commenterId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        assignees: { include: { user: true } },
        watchedBy: { include: { user: true } },
        list: { include: { board: true } },
      },
    });
    if (!card) return;

    const toNotify = new Set([
      ...card.assignees.map((a) => a.userId),
      ...card.watchedBy.map((w) => w.userId),
      card.createdById,
    ]);
    toNotify.delete(commenterId);

    await Promise.all(
      [...toNotify].map((userId) =>
        this.create(
          userId,
          'CARD_COMMENTED',
          'New comment on a card',
          `${commenterName} commented on "${card.title}"`,
          { cardId, boardId: card.list.boardId }
        )
      )
    );
  }

  async notifyMentions(cardId: string, mentionedUserIds: string[], mentionerName: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: true } } },
    });
    if (!card) return;

    await Promise.all(
      mentionedUserIds.map((userId) =>
        this.create(
          userId,
          'CARD_MENTIONED',
          'You were mentioned',
          `${mentionerName} mentioned you in "${card.title}"`,
          { cardId, boardId: card.list.boardId }
        )
      )
    );
  }
}

export const notificationService = new NotificationService();
