import { Router } from 'express';
import { z } from 'zod';
import { authLimiter } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    name: z.string().min(1).max(100),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
    totpCode: z.string().optional(),
  }),
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(async (req, res) => {
  const tokens = await authService.register(
    req.body.email,
    req.body.password,
    req.body.name,
    req.body.username
  );
  res.status(201).json({ success: true, data: tokens });
}));

router.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { tokens, user } = await authService.login(req.body.email, req.body.password, req.body.totpCode);
  res.json({ success: true, data: { ...tokens, user } });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) { res.status(400).json({ success: false, error: 'Refresh token required' }); return; }
  const tokens = await authService.refreshToken(refreshToken);
  res.json({ success: true, data: tokens });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await authService.logout(refreshToken);
  res.json({ success: true, message: 'Logged out successfully' });
}));

router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) { res.status(400).json({ success: false, error: 'Token required' }); return; }
  await authService.verifyEmail(token);
  res.json({ success: true, message: 'Email verified successfully' });
}));

router.post('/forgot-password', authLimiter, asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400).json({ success: false, error: 'Token and password required' }); return; }
  await authService.resetPassword(token, password);
  res.json({ success: true, message: 'Password reset successfully' });
}));

router.post('/2fa/setup', authenticate, asyncHandler(async (req: any, res) => {
  const result = await authService.setupTwoFactor(req.userId);
  res.json({ success: true, data: result });
}));

router.post('/2fa/enable', authenticate, asyncHandler(async (req: any, res) => {
  await authService.enableTwoFactor(req.userId, req.body.code);
  res.json({ success: true, message: '2FA enabled' });
}));

router.post('/2fa/disable', authenticate, asyncHandler(async (req: any, res) => {
  await authService.disableTwoFactor(req.userId, req.body.code);
  res.json({ success: true, message: '2FA disabled' });
}));

export default router;
