'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, Flag, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatDate, getInitials, priorityConfig } from '@/lib/utils';
import type { List, Card } from '@minimills/shared';

export default function TableViewPage({ params }: { params: { id: string } }) {
  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['board-lists', params.id],
    queryFn: () => api.get(`/lists/board/${params.id}`),
  });

  const allCards = lists.flatMap((list) =>
    (list.cards ?? []).map((card) => ({ ...card, listName: list.name }))
  );

  return (
    <div className="p-4 overflow-auto h-full">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold">Card</th>
            <th className="text-left py-3 px-4 font-semibold">List</th>
            <th className="text-left py-3 px-4 font-semibold">Priority</th>
            <th className="text-left py-3 px-4 font-semibold">Due date</th>
            <th className="text-left py-3 px-4 font-semibold">Assignees</th>
            <th className="text-left py-3 px-4 font-semibold">Labels</th>
          </tr>
        </thead>
        <tbody>
          {allCards.map((card: any) => {
            const pc = priorityConfig(card.priority);
            return (
              <tr key={card.id} className="border-b hover:bg-muted/50 cursor-pointer">
                <td className="py-3 px-4 font-medium">{card.title}</td>
                <td className="py-3 px-4 text-muted-foreground">{card.listName}</td>
                <td className="py-3 px-4">
                  {card.priority !== 'NONE' && (
                    <Badge variant="outline" className={pc.color}>{pc.label}</Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {card.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{formatDate(card.dueDate, 'MMM d')}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex -space-x-1">
                    {card.assignees?.slice(0, 3).map((a: any) => (
                      <Avatar key={a.userId} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={a.user.avatarUrl} />
                        <AvatarFallback className="text-xs">{getInitials(a.user.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 flex-wrap">
                    {card.labels?.map((cl: any) => (
                      <span key={cl.id} className="px-2 py-0.5 rounded-full text-white text-xs" style={{ background: cl.label.color }}>
                        {cl.label.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {allCards.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">No cards in this board</div>
      )}
    </div>
  );
}
