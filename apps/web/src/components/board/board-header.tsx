'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, LayoutGrid, Calendar, Table2, GitBranch, Settings, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Board } from '@minimills/shared';

export function BoardHeader({ boardId }: { boardId: string }) {
  const pathname = usePathname();
  const { data: board } = useQuery<Board>({
    queryKey: ['board', boardId],
    queryFn: () => api.get(`/boards/${boardId}`),
  });

  const views = [
    { href: `/board/${boardId}`, icon: LayoutGrid, label: 'Board' },
    { href: `/board/${boardId}/timeline`, icon: GitBranch, label: 'Timeline' },
    { href: `/board/${boardId}/calendar`, icon: Calendar, label: 'Calendar' },
    { href: `/board/${boardId}/table`, icon: Table2, label: 'Table' },
  ];

  return (
    <header
      className="flex items-center gap-4 px-4 py-3 border-b shrink-0"
      style={{ background: board?.backgroundColor ? `${board.backgroundColor}22` : undefined }}
    >
      <Link href="/dashboard">
        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
      </Link>

      <div className="flex items-center gap-2">
        <h1 className="font-bold text-lg">{board?.name}</h1>
      </div>

      {/* Views */}
      <nav className="flex gap-1 ml-4">
        {views.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <Button
              variant={pathname === href ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-1.5"
            >
              <Icon className="h-4 w-4" />{label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex gap-2">
        <Link href={`/board/${boardId}/members`}>
          <Button variant="outline" size="sm"><Users className="mr-1.5 h-4 w-4" />Members</Button>
        </Link>
        <Link href={`/board/${boardId}/settings`}>
          <Button variant="outline" size="sm"><Settings className="mr-1.5 h-4 w-4" />Settings</Button>
        </Link>
      </div>
    </header>
  );
}
