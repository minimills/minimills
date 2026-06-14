'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Board } from '@minimills/shared';

export function BoardCard({ board }: { board: Board }) {
  const qc = useQueryClient();

  const starMutation = useMutation({
    mutationFn: () =>
      board.isStarred ? api.delete(`/boards/${board.id}/star`) : api.post(`/boards/${board.id}/star`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-boards', board.workspaceId] });
      qc.invalidateQueries({ queryKey: ['starred-boards'] });
    },
  });

  return (
    <div className="relative group">
      <Link href={`/board/${board.id}`}>
        <div
          className="h-28 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: board.backgroundUrl
              ? `url(${board.backgroundUrl}) center/cover`
              : board.backgroundColor || '#0052cc',
          }}
        >
          <div className="h-full bg-black/20 p-3 flex flex-col justify-end">
            <p className="text-white font-semibold text-sm line-clamp-2">{board.name}</p>
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); starMutation.mutate(); }}
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded bg-black/20 hover:bg-black/40 transition-colors',
          'opacity-0 group-hover:opacity-100',
          board.isStarred && 'opacity-100'
        )}
      >
        <Star
          className={cn('h-3.5 w-3.5 text-white', board.isStarred && 'fill-yellow-400 text-yellow-400')}
        />
      </button>
    </div>
  );
}
