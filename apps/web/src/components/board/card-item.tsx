'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip, CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatDueDate, getInitials, priorityConfig } from '@/lib/utils';
import type { Card } from '@minimills/shared';

interface CardItemProps {
  card: Card;
  listId?: string;
  boardId?: string;
  isDragging?: boolean;
}

export function CardItem({ card, listId, boardId, isDragging }: CardItemProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card, listId },
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pc = priorityConfig(card.priority);
  const dueInfo = card.dueDate ? formatDueDate(card.dueDate) : null;
  const completedItems = card.checklists?.flatMap((c) => c.items).filter((i) => i.isCompleted).length ?? 0;
  const totalItems = card.checklists?.flatMap((c) => c.items).length ?? 0;

  const handleClick = () => {
    router.push(`${pathname}?card=${card.id}`, { scroll: false });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-background border rounded-lg p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow group',
        (isSortableDragging || isDragging) && 'opacity-50 rotate-3 shadow-xl'
      )}
      onClick={handleClick}
    >
      {/* Cover */}
      {card.coverColor && (
        <div className="-mx-3 -mt-3 mb-3 h-8 rounded-t-lg" style={{ background: card.coverColor }} />
      )}
      {card.coverUrl && (
        <img src={card.coverUrl} alt="" className="-mx-3 -mt-3 mb-3 h-24 w-full object-cover rounded-t-lg" />
      )}

      {/* Labels */}
      {(card.labels?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels!.map((cl) => (
            <span
              key={cl.id}
              className="h-2 w-8 rounded-full"
              style={{ background: cl.label.color }}
              title={cl.label.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium leading-snug">{card.title}</p>

      {/* Priority */}
      {card.priority !== 'NONE' && (
        <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-medium', pc.color)}>
          <AlertCircle className="h-3 w-3" />{pc.label}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          {dueInfo && (
            <span className={cn('flex items-center gap-1 text-xs', dueInfo.color)}>
              <Calendar className="h-3 w-3" />{dueInfo.label}
            </span>
          )}
          {(card._count?.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3 w-3" />{card._count!.comments}
            </span>
          )}
          {(card._count?.attachments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Paperclip className="h-3 w-3" />{card._count!.attachments}
            </span>
          )}
          {totalItems > 0 && (
            <span className={cn('flex items-center gap-1 text-xs', completedItems === totalItems && 'text-green-600')}>
              <CheckSquare className="h-3 w-3" />{completedItems}/{totalItems}
            </span>
          )}
        </div>

        {/* Assignees */}
        {(card.assignees?.length ?? 0) > 0 && (
          <div className="flex -space-x-1">
            {card.assignees!.slice(0, 3).map((a) => (
              <Avatar key={a.userId} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={a.user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs">{getInitials(a.user.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
