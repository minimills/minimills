'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { List } from '@minimills/shared';

export default function CalendarViewPage({ params }: { params: { id: string } }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: lists = [] } = useQuery<List[]>({
    queryKey: ['board-lists', params.id],
    queryFn: () => api.get(`/lists/board/${params.id}`),
  });

  const allCards = lists.flatMap((list) =>
    (list.cards ?? []).filter((card) => card.dueDate)
  );

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

  const cardsForDay = (day: Date) =>
    allCards.filter((c) => c.dueDate && isSameDay(new Date(c.dueDate), day));

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="bg-muted/50 py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
        {days.map((day) => {
          const dayCards = cardsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'bg-background p-2 min-h-[100px]',
                !isSameMonth(day, currentDate) && 'bg-muted/30',
              )}
            >
              <div className={cn(
                'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                isToday(day) && 'bg-primary text-primary-foreground'
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayCards.map((card) => (
                  <div key={card.id} className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 truncate cursor-pointer hover:bg-primary/20">
                    {card.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
