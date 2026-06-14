import nodemailer from 'nodemailer';
import { config } from '../config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
    });
  }

  private async send(to: string, subject: string, html: string) {
    if (config.nodeEnv === 'development') {
      console.log(`[Email] To: ${to}, Subject: ${subject}`);
      return;
    }
    await this.transporter.sendMail({ from: config.smtp.from, to, subject, html });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${config.frontendUrl}/verify-email?token=${token}`;
    await this.send(
      email,
      'Verify your MinIMills account',
      `<h2>Welcome to MinIMills!</h2>
       <p>Click the link below to verify your email address:</p>
       <a href="${url}" style="background:#0052cc;color:white;padding:12px 24px;border-radius:4px;text-decoration:none;">Verify Email</a>
       <p>This link expires in 24 hours.</p>`
    );
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${config.frontendUrl}/reset-password?token=${token}`;
    await this.send(
      email,
      'Reset your MinIMills password',
      `<h2>Password Reset</h2>
       <p>Click the link below to reset your password:</p>
       <a href="${url}" style="background:#0052cc;color:white;padding:12px 24px;border-radius:4px;text-decoration:none;">Reset Password</a>
       <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>`
    );
  }

  async sendWorkspaceInvitationEmail(email: string, workspaceName: string, inviterName: string, token: string) {
    const url = `${config.frontendUrl}/invite/workspace?token=${token}`;
    await this.send(
      email,
      `${inviterName} invited you to join ${workspaceName}`,
      `<h2>You're invited!</h2>
       <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on MinIMills.</p>
       <a href="${url}" style="background:#0052cc;color:white;padding:12px 24px;border-radius:4px;text-decoration:none;">Accept Invitation</a>
       <p>This invitation expires in 7 days.</p>`
    );
  }

  async sendDueDateReminderEmail(email: string, cardTitle: string, boardName: string, dueDate: Date) {
    await this.send(
      email,
      `Reminder: "${cardTitle}" is due soon`,
      `<h2>Due Date Reminder</h2>
       <p>The card <strong>"${cardTitle}"</strong> on board <strong>${boardName}</strong> is due on <strong>${dueDate.toLocaleDateString()}</strong>.</p>
       <p>Log in to MinIMills to view and update this card.</p>`
    );
  }

  async sendCardFromEmail(boardEmailAddress: string, from: string, subject: string, body: string) {
    // Process incoming email to create card
    console.log(`[Email Integration] Card from: ${from}, Subject: ${subject}, Board: ${boardEmailAddress}`);
  }
}

export const emailService = new EmailService();
