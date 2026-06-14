'use client';

import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { List } from '@minimills/shared';

export default function TimelineViewPage({ params }: { params: { id: string } }) {
  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['board-lists', params.id],
    queryFn: () => api.get(`/lists/board/${params.id}`),
  });

  const allCards = lists
    .flatMap((list) => (list.cards ?? []).map((c) => ({ ...c, listName: list.name })))
    .filter((c) => c.startDate || c.dueDate);

  const today = startOfDay(new Date());
  const DAYS = 60;
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i - 10);
    return d;
  });

  return (
    <div className="p-6 overflow-auto h-full">
      <h2 className="text-xl font-bold mb-6">Timeline</h2>
      <div className="overflow-x-auto">
        {/* Days header */}
        <div className="flex gap-px mb-2">
          <div className="w-48 shrink-0" />
          {days.map((d) => (
            <div key={d.toISOString()} className="w-10 shrink-0 text-center text-xs text-muted-foreground">
              {format(d, 'd')}
            </div>
          ))}
        </div>

        {/* Cards */}
        {allCards.map((card: any) => {
          const start = card.startDate ? startOfDay(new Date(card.startDate)) : today;
          const end = card.dueDate ? startOfDay(new Date(card.dueDate)) : start;
          const offsetDays = differenceInDays(start, days[0]);
          const durationDays = Math.max(1, differenceInDays(end, start) + 1);

          return (
            <div key={card.id} className="flex items-center gap-px mb-2">
              <div className="w-48 shrink-0 text-sm truncate pr-2">{card.title}</div>
              <div className="relative flex" style={{ width: `${DAYS * 40}px` }}>
                <div
                  className="absolute h-7 bg-primary/80 rounded text-xs text-white flex items-center px-2 cursor-pointer hover:bg-primary"
                  style={{ left: `${offsetDays * 40}px`, width: `${durationDays * 40 - 2}px` }}
                >
                  <span className="truncate">{card.title}</span>
                </div>
              </div>
            </div>
          );
        })}

        {allCards.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No cards with dates. Add start/due dates to see them here.
          </div>
        )}
      </div>
    </div>
  );
}
