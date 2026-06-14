import { Worker, Queue, QueueScheduler } from 'bullmq';
import { getRedis } from '../config/redis';
import { prisma } from '../config/database';
import { automationService } from '../services/automation.service';

export const AUTOMATION_QUEUE = 'automation';
export let automationQueue: Queue;

class AutomationWorker {
  private worker: Worker | null = null;

  run() {
    const redis = getRedis();
    automationQueue = new Queue(AUTOMATION_QUEUE, { connection: redis });

    // Schedule due date checks every hour
    automationQueue.add(
      'due-date-check',
      { type: 'due_date_check' },
      { repeat: { pattern: '0 * * * *' }, removeOnComplete: true }
    ).catch(console.error);

    this.worker = new Worker(
      AUTOMATION_QUEUE,
      async (job) => {
        const { type, ...data } = job.data;
        switch (type) {
          case 'due_date_check':
            await this.checkDueDates();
            break;
          case 'execute_rule':
            await automationService.executeRules(data.boardId, data.trigger, data.context);
            break;
        }
      },
      { connection: redis, concurrency: 2 }
    );

    this.worker.on('failed', (job, err) => {
      console.error(`Automation job ${job?.id} failed:`, err);
    });
  }

  private async checkDueDates() {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Cards due in next 24 hours
    const dueSoon = await prisma.card.findMany({
      where: { dueDate: { gte: now, lte: in24h }, isArchived: false },
      include: {
        assignees: { include: { user: true } },
        list: { include: { board: true } },
      },
    });

    for (const card of dueSoon) {
      for (const assignee of card.assignees) {
        if (!assignee.user.notifyDueDates) continue;
        await prisma.notification.upsert({
          where: {
            // Prevent duplicate notifications
            id: `due-soon-${card.id}-${assignee.userId}`,
          },
          create: {
            id: `due-soon-${card.id}-${assignee.userId}`,
            userId: assignee.userId,
            type: 'CARD_DUE_SOON',
            title: 'Card due soon',
            message: `"${card.title}" on ${card.list.board.name} is due within 24 hours`,
            data: { cardId: card.id, boardId: card.list.boardId },
          },
          update: {},
        }).catch(() => {});
      }
    }

    // Execute scheduled automation rules
    const boards = await prisma.board.findMany({ where: { isArchived: false }, select: { id: true } });
    for (const board of boards) {
      await automationService.executeRules(board.id, 'SCHEDULED', { boardId: board.id });
    }
  }
}

export const automationWorker = new AutomationWorker();
