'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatRelative, getInitials } from '@/lib/utils';
import type { Activity } from '@minimills/shared';

const activityMessages: Record<string, (data: any) => string> = {
  card_created: (d) => `created this card in ${d.listName}`,
  card_moved: (d) => `moved this card to ${d.toListName}`,
  list_created: (d) => `created list "${d.listName}"`,
};

export function CardActivity({ cardId }: { cardId: string }) {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['card-activity', cardId],
    queryFn: () => api.get(`/boards/activity?cardId=${cardId}`),
    enabled: false, // Load on demand
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Activity</h3>
      </div>
      {activities?.map((a) => (
        <div key={a.id} className="flex gap-3 mb-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={a.user.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs">{getInitials(a.user.name)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <span className="font-medium">{a.user.name}</span>{' '}
            <span className="text-muted-foreground">{activityMessages[a.type]?.(a.data) || a.type}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{formatRelative(a.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
