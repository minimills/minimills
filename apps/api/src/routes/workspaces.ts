import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { emailService } from '../services/email.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error';

const router = Router();

// Helpers
async function assertWorkspaceMember(workspaceId: string, userId: string, minRole?: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new AppError('Access denied', 403);
  if (minRole === 'ADMIN' && !['OWNER', 'ADMIN'].includes(member.role)) throw new AppError('Insufficient permissions', 403);
  if (minRole === 'OWNER' && member.role !== 'OWNER') throw new AppError('Only owner can do this', 403);
  return member;
}

router.get('/', asyncHandler(async (req: any, res) => {
  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: req.userId } } },
    include: { _count: { select: { members: true, boards: true } }, owner: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: workspaces });
}));

router.post('/', asyncHandler(async (req: any, res) => {
  const { name, description, visibility } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
  const workspace = await prisma.workspace.create({
    data: {
      name, slug, description, visibility: visibility || 'PRIVATE', ownerId: req.userId,
      members: { create: { userId: req.userId, role: 'OWNER' } },
    },
    include: { _count: { select: { members: true, boards: true } } },
  });
  res.status(201).json({ success: true, data: workspace });
}));

router.get('/:id', asyncHandler(async (req: any, res) => {
  await assertWorkspaceMember(req.params.id, req.userId);
  const workspace = await prisma.workspace.findUnique({
    where: { id: req.params.id },
    include: {
      _count: { select: { members: true, boards: true } },
      owner: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
  if (!workspace) throw new AppError('Workspace not found', 404);
  res.json({ success: true, data: workspace });
}));

router.patch('/:id', asyncHandler(async (req: any, res) => {
  await assertWorkspaceMember(req.params.id, req.userId, 'ADMIN');
  const { name, description, visibility } = req.body;
  const workspace = await prisma.workspace.update({
    where: { id: req.params.id },
    data: { ...(name && { name }), ...(description !== undefined && { description }), ...(visibility && { visibility }) },
  });
  res.json({ success: true, data: workspace });
}));

router.delete('/:id', asyncHandler(async (req: any, res) => {
  await assertWorkspaceMember(req.params.id, req.userId, 'OWNER');
  await prisma.workspace.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/:id/members', asyncHandler(async (req: any, res) => {
  await assertWorkspaceMember(req.params.id, req.userId);
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: req.params.id },
    include: { user: { select: { id: true, name: true, username: true, email: true, avatarUrl: true } } },
    orderBy: { joinedAt: 'asc' },
  });
  res.json({ success: true, data: members });
}));

router.post('/:id/members/invite', asyncHandler(async (req: any, res) => {
  const member = await assertWorkspaceMember(req.params.id, req.userId, 'ADMIN');
  const { email, role } = req.body;
  const inviter = await prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } });
  const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
  if (!workspace) throw new AppError('Workspace not found', 404);

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.workspaceInvitation.create({
    data: {
      workspaceId: req.params.id, email, role: role || 'MEMBER', token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await emailService.sendWorkspaceInvitationEmail(email, workspace.name, inviter?.name || 'Someone', token);
  res.json({ success: true, message: 'Invitation sent' });
}));

router.post('/invitations/accept', asyncHandler(async (req: any, res) => {
  const { token } = req.body;
  const invitation = await prisma.workspaceInvitation.findUnique({ where: { token } });
  if (!invitation || invitation.expiresAt < new Date()) throw new AppError('Invalid or expired invitation', 400);
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.email !== invitation.email) throw new AppError('Invitation is for a different email', 403);
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId: req.userId } },
    create: { workspaceId: invitation.workspaceId, userId: req.userId, role: invitation.role },
    update: {},
  });
  await prisma.workspaceInvitation.delete({ where: { id: invitation.id } });
  res.json({ success: true, data: { workspaceId: invitation.workspaceId } });
}));

router.patch('/:id/members/:userId', asyncHandler(async (req: any, res) => {
  await assertWorkspaceMember(req.params.id, req.userId, 'ADMIN');
  const { role } = req.body;
  if (role === 'OWNER') throw new AppError('Cannot set role to OWNER', 400);
  await prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId: req.params.id, userId: req.params.userId } },
    data: { role },
  });
  res.json({ success: true });
}));

router.delete('/:id/members/:userId', asyncHandler(async (req: any, res) => {
  const callerMember = await assertWorkspaceMember(req.params.id, req.userId, 'ADMIN');
  if (req.params.userId === req.userId && callerMember.role === 'OWNER') throw new AppError('Owner cannot leave workspace', 400);
  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId: req.params.id, userId: req.params.userId } },
  });
  res.json({ success: true });
}));

router.get('/:id/boards', asyncHandler(async (req: any, res) => {
  await assertWorkspaceMember(req.params.id, req.userId);
  const boards = await prisma.board.findMany({
    where: { workspaceId: req.params.id, isArchived: false },
    include: {
      _count: { select: { lists: true, members: true } },
      starredBy: { where: { userId: req.userId }, select: { id: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: boards.map((b) => ({ ...b, isStarred: b.starredBy.length > 0, starredBy: undefined })) });
}));

export default router;
