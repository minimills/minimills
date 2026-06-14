import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';
import authRoutes from './auth';
import userRoutes from './users';
import workspaceRoutes from './workspaces';
import boardRoutes from './boards';
import listRoutes from './lists';
import cardRoutes from './cards';
import commentRoutes from './comments';
import notificationRoutes from './notifications';
import searchRoutes from './search';
import fileRoutes from './files';
import automationRoutes from './automation';

export const router = Router();

router.use(apiLimiter);
router.use('/auth', authRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/workspaces', authenticate, workspaceRoutes);
router.use('/boards', authenticate, boardRoutes);
router.use('/lists', authenticate, listRoutes);
router.use('/cards', authenticate, cardRoutes);
router.use('/comments', authenticate, commentRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/search', authenticate, searchRoutes);
router.use('/files', authenticate, fileRoutes);
router.use('/automation', authenticate, automationRoutes);
