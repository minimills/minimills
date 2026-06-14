'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Star, Clock, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BoardCard } from '@/components/board/board-card';
import { api } from '@/lib/api';
import type { Board, Workspace } from '@minimills/shared';

export default function DashboardPage() {
  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces'),
  });

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Boards</h1>
          <p className="text-muted-foreground mt-1">All your workspaces and boards in one place</p>
        </div>
      </div>

      {/* Workspaces + Boards */}
      {workspaces?.map((ws) => (
        <WorkspaceSection key={ws.id} workspace={ws} />
      ))}

      {!workspaces?.length && (
        <div className="text-center py-20">
          <LayoutGrid className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
          <p className="text-muted-foreground mb-6">Create a workspace to start managing your projects.</p>
          <Button asChild><Link href="/workspaces/new"><Plus className="mr-2 h-4 w-4" />Create workspace</Link></Button>
        </div>
      )}
    </div>
  );
}

function WorkspaceSection({ workspace }: { workspace: Workspace }) {
  const { data: boards } = useQuery<Board[]>({
    queryKey: ['workspace-boards', workspace.id],
    queryFn: () => api.get(`/workspaces/${workspace.id}/boards`),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">
            {workspace.name[0].toUpperCase()}
          </div>
          <Link href={`/workspaces/${workspace.id}`} className="font-semibold hover:underline">{workspace.name}</Link>
          <span className="text-muted-foreground text-sm">{workspace._count?.members} members</span>
        </div>
        <Link href={`/workspaces/${workspace.id}/boards/new`}>
          <Button variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />New board</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boards?.map((board) => <BoardCard key={board.id} board={board} />)}
        <Link href={`/workspaces/${workspace.id}/boards/new`}>
          <Card className="h-28 flex items-center justify-center border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="text-center text-muted-foreground">
              <Plus className="mx-auto h-6 w-6 mb-1" />
              <span className="text-sm">New board</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
