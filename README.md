# MinIMills

A full-featured, self-hosted project management SaaS — a Trello clone built with modern technologies.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, shadcn/ui, Tailwind CSS |
| Backend | Node.js, TypeScript, Express, Prisma ORM |
| Database | PostgreSQL |
| Cache / Queue | Redis + BullMQ |
| Real-time | Socket.io |
| File Storage | MinIO (S3-compatible) |
| Deployment | Docker + Docker Compose |

## Features

- ✅ **Authentication** — Register, login, JWT tokens, refresh tokens, email verification, password reset, 2FA (TOTP), session management
- ✅ **Workspaces** — Multi-tenant workspaces, role-based access (Owner/Admin/Member/Observer), member invitations
- ✅ **Boards** — Create/edit/duplicate/archive boards, visibility controls, star boards, backgrounds, templates
- ✅ **Lists & Cards** — Full Kanban board with drag-and-drop, card descriptions, covers, labels, priorities, due dates, checklists, assignees, attachments, custom fields
- ✅ **Comments & Reactions** — Rich comments with @mentions, emoji reactions
- ✅ **Real-time** — Socket.io live updates, presence indicators, collaborative editing
- ✅ **Notifications** — In-app notifications, email notifications, due date reminders
- ✅ **Automation** — Trigger-condition-action workflow engine (Butler clone)
- ✅ **Search** — Full-text search across cards, boards, workspaces
- ✅ **Views** — Kanban, Calendar, Timeline/Gantt, Table views
- ✅ **File Uploads** — Attachments, avatars stored in MinIO
- ✅ **Settings** — Profile, password, 2FA, notification preferences, board/workspace settings

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+

### Development

```bash
# 1. Clone and set up environment
cp .env.example .env
# Edit .env with your settings

# 2. Start infrastructure (PostgreSQL, Redis, MinIO)
docker compose up postgres redis minio -d

# 3. Install dependencies
npm install

# 4. Run database migrations and seed
npm run db:migrate
npm run db:seed

# 5. Start development servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### Demo accounts (after seeding)

```
alice@example.com / password123
bob@example.com / password123
```

### Full Docker Stack

```bash
# Start everything
docker compose up -d

# Run migrations
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run db:seed
```

## Project Structure

```
minimills/
├── apps/
│   ├── api/                    # Node.js + TypeScript backend
│   │   ├── prisma/             # Database schema & migrations
│   │   └── src/
│   │       ├── config/         # Database, Redis, MinIO, app config
│   │       ├── middleware/     # Auth, validation, error handling, rate limiting
│   │       ├── routes/         # REST API endpoints
│   │       ├── services/       # Business logic (auth, notifications, automation, etc.)
│   │       ├── socket/         # Socket.io real-time layer
│   │       └── workers/        # BullMQ background workers
│   └── web/                    # Next.js 14 frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components (board, card, UI)
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # API client, utilities
│       │   └── store/          # Zustand state management
│       └── public/
├── packages/
│   └── shared/                 # Shared TypeScript types
├── nginx/                      # Nginx config for production
├── docker-compose.yml          # Development Docker Compose
├── docker-compose.prod.yml     # Production Docker Compose
└── .env.example                # Environment variable template
```

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT |
| GET | `/api/users/me` | Get current user |
| GET | `/api/workspaces` | List user workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/boards/:id` | Get board details |
| POST | `/api/boards` | Create board |
| GET | `/api/lists/board/:id` | Get lists with cards |
| POST | `/api/cards` | Create card |
| PATCH | `/api/cards/:id` | Update card |
| POST | `/api/cards/reorder` | Reorder cards (DnD) |
| POST | `/api/comments/cards/:id` | Add comment |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/search` | Search everything |
| POST | `/api/files/cards/:id/attachments` | Upload attachment |
| GET | `/api/automation/boards/:id` | Get automation rules |

## Environment Variables

See `.env.example` for all available configuration options.

## Production Deployment

1. Copy `.env.example` to `.env.production` and fill in production values
2. Set strong secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Configure your SMTP server for email delivery
4. Set up SSL certificates in `nginx/ssl/`
5. Run: `docker compose -f docker-compose.prod.yml up -d`

## License

MIT
