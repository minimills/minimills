import { notificationWorker } from './notification.worker';
import { automationWorker } from './automation.worker';
import { emailWorker } from './email.worker';

export function startWorkers(): void {
  notificationWorker.run();
  automationWorker.run();
  emailWorker.run();
  console.log('Workers started');
}
