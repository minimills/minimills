import { Worker, Queue } from 'bullmq';
import { getRedis } from '../config/redis';
import { emailService } from '../services/email.service';

export const EMAIL_QUEUE = 'emails';
export let emailQueue: Queue;

class EmailWorker {
  private worker: Worker | null = null;

  run() {
    const redis = getRedis();
    emailQueue = new Queue(EMAIL_QUEUE, {
      connection: redis,
      defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    });

    this.worker = new Worker(
      EMAIL_QUEUE,
      async (job) => {
        const { type, ...data } = job.data;
        switch (type) {
          case 'verification':
            await emailService.sendVerificationEmail(data.email, data.token);
            break;
          case 'password_reset':
            await emailService.sendPasswordResetEmail(data.email, data.token);
            break;
          case 'workspace_invitation':
            await emailService.sendWorkspaceInvitationEmail(data.email, data.workspaceName, data.inviterName, data.token);
            break;
          case 'due_date_reminder':
            await emailService.sendDueDateReminderEmail(data.email, data.cardTitle, data.boardName, new Date(data.dueDate));
            break;
          default:
            console.warn(`Unknown email type: ${type}`);
        }
      },
      { connection: redis, concurrency: 3 }
    );

    this.worker.on('failed', (job, err) => {
      console.error(`Email job ${job?.id} failed:`, err);
    });
  }
}

export const emailWorker = new EmailWorker();
