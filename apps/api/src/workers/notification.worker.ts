import { Worker, Queue } from 'bullmq';
import { getRedis } from '../config/redis';
import { prisma } from '../config/database';
import { notificationService } from '../services/notification.service';

export const NOTIFICATION_QUEUE = 'notifications';

export let notificationQueue: Queue;

class NotificationWorker {
  private worker: Worker | null = null;

  run() {
    const redis = getRedis();
    notificationQueue = new Queue(NOTIFICATION_QUEUE, { connection: redis });

    this.worker = new Worker(
      NOTIFICATION_QUEUE,
      async (job) => {
        const { type, ...data } = job.data;
        switch (type) {
          case 'card_assigned':
            await notificationService.notifyCardAssigned(data.cardId, data.assigneeId, data.assignedByName);
            break;
          case 'card_commented':
            await notificationService.notifyCardCommented(data.cardId, data.commenterName, data.commenterId);
            break;
          case 'card_mentioned':
            await notificationService.notifyMentions(data.cardId, data.mentionedUserIds, data.mentionerName);
            break;
          default:
            console.warn(`Unknown notification type: ${type}`);
        }
      },
      { connection: redis, concurrency: 5 }
    );

    this.worker.on('failed', (job, err) => {
      console.error(`Notification job ${job?.id} failed:`, err);
    });
  }
}

export const notificationWorker = new NotificationWorker();
