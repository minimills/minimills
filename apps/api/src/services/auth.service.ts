import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { config } from '../config';
import { AppError } from '../middleware/error';
import { emailService } from './email.service';

class AuthService {
  async register(email: string, password: string, name: string, username: string) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      if (existing.email === email) throw new AppError('Email already registered', 409);
      throw new AppError('Username already taken', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, username, passwordHash },
    });

    await this.sendVerificationEmail(user.id, email);
    return this.generateTokens(user.id);
  }

  async login(email: string, password: string, totpCode?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    if (user.twoFactorEnabled) {
      if (!totpCode) throw new AppError('2FA code required', 401);
      const isValid = this.verifyTOTP(user.twoFactorSecret!, totpCode);
      if (!isValid) throw new AppError('Invalid 2FA code', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    return { tokens: await this.generateTokens(user.id), user };
  }

  async refreshToken(token: string) {
    let payload: { userId: string };
    try {
      payload = jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const stored = await prisma.token.findFirst({
      where: { token, type: 'REFRESH', userId: payload.userId },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token expired or revoked', 401);
    }

    await prisma.token.delete({ where: { id: stored.id } });
    return this.generateTokens(payload.userId);
  }

  async logout(refreshToken: string) {
    await prisma.token.deleteMany({ where: { token: refreshToken, type: 'REFRESH' } });
  }

  async sendVerificationEmail(userId: string, email: string) {
    await prisma.token.deleteMany({ where: { userId, type: 'EMAIL_VERIFICATION' } });
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.token.create({
      data: {
        userId,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await emailService.sendVerificationEmail(email, token);
  }

  async verifyEmail(token: string) {
    const record = await prisma.token.findFirst({
      where: { token, type: 'EMAIL_VERIFICATION' },
      include: { user: true },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new AppError('Invalid or expired verification token', 400);
    }
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });
    await prisma.token.delete({ where: { id: record.id } });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal if email exists

    await prisma.token.deleteMany({ where: { userId: user.id, type: 'PASSWORD_RESET' } });
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.token.create({
      data: {
        userId: user.id,
        token,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await emailService.sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await prisma.token.findFirst({
      where: { token, type: 'PASSWORD_RESET' },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await prisma.token.deleteMany({ where: { userId: record.userId, type: 'PASSWORD_RESET' } });
    await prisma.token.deleteMany({ where: { userId: record.userId, type: 'REFRESH' } });
  }

  async setupTwoFactor(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const totp = new OTPAuth.TOTP({
      issuer: config.totp.appName,
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;
    const qrCodeUrl = await QRCode.toDataURL(totp.toString());
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex')
    );

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, backupCodes },
    });

    return { secret, qrCodeUrl, backupCodes };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) throw new AppError('2FA not set up', 400);

    const valid = this.verifyTOTP(user.twoFactorSecret, code);
    if (!valid) throw new AppError('Invalid 2FA code', 400);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  }

  async disableTwoFactor(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled) throw new AppError('2FA not enabled', 400);

    const valid = this.verifyTOTP(user.twoFactorSecret!, code);
    if (!valid) throw new AppError('Invalid 2FA code', 400);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null, backupCodes: [] },
    });
  }

  private verifyTOTP(secret: string, code: string): boolean {
    const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 });
    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  }

  async generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    });
    const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as string,
    });

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);

    await prisma.token.create({
      data: { userId, token: refreshToken, type: 'REFRESH', expiresAt: refreshExpiry },
    });

    return { accessToken, refreshToken, expiresIn: 900 };
  }
}

export const authService = new AuthService();
