'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoardCard } from '@/components/board/board-card';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { Board, Workspace } from '@minimills/shared';

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const { data: workspace } = useQuery<Workspace>({
    queryKey: ['workspace', params.id],
    queryFn: () => api.get(`/workspaces/${params.id}`),
  });

  const { data: boards } = useQuery<Board[]>({
    queryKey: ['workspace-boards', params.id],
    queryFn: () => api.get(`/workspaces/${params.id}/boards`),
  });

  if (!workspace) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl">
            {workspace.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            {workspace.description && <p className="text-muted-foreground">{workspace.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/workspaces/${params.id}/members`}>
            <Button variant="outline"><Users className="mr-2 h-4 w-4" />Members</Button>
          </Link>
          <Link href={`/workspaces/${params.id}/settings`}>
            <Button variant="outline"><Settings className="mr-2 h-4 w-4" />Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boards?.map((board) => <BoardCard key={board.id} board={board} />)}
        <Link href={`/workspaces/${params.id}/boards/new`}>
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
