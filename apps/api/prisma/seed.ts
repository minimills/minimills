import { PrismaClient, WorkspaceRole, BoardRole, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      emailVerified: true,
      name: 'Alice Johnson',
      username: 'alice',
      passwordHash,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      emailVerified: true,
      name: 'Bob Smith',
      username: 'bob',
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'The main workspace for Acme Corp',
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: WorkspaceRole.OWNER },
          { userId: bob.id, role: WorkspaceRole.MEMBER },
        ],
      },
    },
  });

  const board = await prisma.board.create({
    data: {
      workspaceId: workspace.id,
      name: 'Product Roadmap',
      description: 'Track our product development',
      backgroundColor: '#0052cc',
      members: {
        create: [
          { userId: alice.id, role: BoardRole.ADMIN },
          { userId: bob.id, role: BoardRole.MEMBER },
        ],
      },
      labels: {
        create: [
          { name: 'Bug', color: '#ef4444' },
          { name: 'Feature', color: '#3b82f6' },
          { name: 'Enhancement', color: '#8b5cf6' },
          { name: 'Urgent', color: '#f97316' },
          { name: 'Docs', color: '#10b981' },
        ],
      },
    },
  });

  const [backlog, inProgress, done] = await Promise.all([
    prisma.list.create({ data: { boardId: board.id, name: 'Backlog', position: 1 } }),
    prisma.list.create({ data: { boardId: board.id, name: 'In Progress', position: 2 } }),
    prisma.list.create({ data: { boardId: board.id, name: 'Done', position: 3 } }),
  ]);

  await prisma.card.createMany({
    data: [
      {
        listId: backlog.id,
        createdById: alice.id,
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        position: 1,
        priority: Priority.HIGH,
      },
      {
        listId: backlog.id,
        createdById: bob.id,
        title: 'Design new onboarding flow',
        position: 2,
        priority: Priority.MEDIUM,
      },
      {
        listId: inProgress.id,
        createdById: alice.id,
        title: 'Implement user authentication',
        position: 1,
        priority: Priority.URGENT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        listId: done.id,
        createdById: alice.id,
        title: 'Project setup and architecture',
        position: 1,
        priority: Priority.NONE,
      },
    ],
  });

  console.log('Seeding complete!');
  console.log('Demo accounts:');
  console.log('  alice@example.com / password123');
  console.log('  bob@example.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
