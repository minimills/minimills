'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Pencil, Calendar, Flag, Users, Tag, Paperclip, CheckSquare,
  MessageSquare, Eye, Clock, Trash2, Archive, Copy,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { cn, formatRelative, getInitials, priorityConfig, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { CardDescription } from './card-description';
import { CardChecklist } from './card-checklist';
import { CardComments } from './card-comments';
import { CardAttachments } from './card-attachments';
import { CardActivity } from './card-activity';
import type { Card } from '@minimills/shared';

export function CardModal({ cardId, boardId }: { cardId: string; boardId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: card, isLoading } = useQuery<Card>({
    queryKey: ['card', cardId],
    queryFn: () => api.get(`/cards/${cardId}`),
  });

  const { data: board } = useQuery<any>({
    queryKey: ['board', boardId],
    queryFn: () => api.get(`/boards/${boardId}`),
  });

  const close = () => router.push(pathname, { scroll: false });

  const archiveMutation = useMutation({
    mutationFn: () => api.patch(`/cards/${cardId}`, { isArchived: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['board-lists', boardId] }); close(); },
  });

  if (isLoading) return null;
  if (!card) return null;

  const pc = priorityConfig(card.priority);

  return (
    <Dialog open onOpenChange={close}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" hideCloseButton>
        {/* Cover */}
        {card.coverColor && (
          <div className="h-12 rounded-t-lg" style={{ background: card.coverColor }} />
        )}
        {card.coverUrl && (
          <img src={card.coverUrl} alt="" className="h-40 w-full object-cover rounded-t-lg" />
        )}

        <div className="flex overflow-hidden" style={{ maxHeight: card.coverUrl ? 'calc(90vh - 160px)' : 'calc(90vh - 48px)' }}>
          {/* Main content */}
          <ScrollArea className="flex-1 p-6">
            {/* Title */}
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1"><CheckSquare className="h-5 w-5 text-muted-foreground" /></div>
              <div className="flex-1">
                <CardTitle card={card} boardId={boardId} />
                <p className="text-sm text-muted-foreground mt-1">
                  In list <span className="font-medium text-foreground">{(card as any).list?.name}</span>
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={close}><X className="h-4 w-4" /></Button>
            </div>

            {/* Labels */}
            {(card.labels?.length ?? 0) > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {card.labels!.map((cl) => (
                    <span
                      key={cl.id}
                      className="px-3 py-1 rounded-full text-white text-xs font-medium"
                      style={{ background: cl.label.color }}
                    >
                      {cl.label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Due date */}
              {card.dueDate && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Due date</p>
                  <p className="text-sm">{formatDate(card.dueDate)}</p>
                </div>
              )}
              {/* Priority */}
              {card.priority !== 'NONE' && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Priority</p>
                  <span className={cn('text-sm font-medium', pc.color)}>{pc.label}</span>
                </div>
              )}
            </div>

            {/* Assignees */}
            {(card.assignees?.length ?? 0) > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Members</p>
                <div className="flex flex-wrap gap-2">
                  {card.assignees!.map((a) => (
                    <div key={a.userId} className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={a.user.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs">{getInitials(a.user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{a.user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <CardDescription card={card} boardId={boardId} />
            <CardChecklist card={card} boardId={boardId} />
            <CardAttachments card={card} boardId={boardId} />
            <CardComments card={card} boardId={boardId} />
            <CardActivity cardId={cardId} />
          </ScrollArea>

          {/* Sidebar actions */}
          <div className="w-48 border-l p-4 space-y-1 shrink-0 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Actions</p>
            <ActionButton icon={Users} label="Assign members" onClick={() => {}} />
            <ActionButton icon={Tag} label="Labels" onClick={() => {}} />
            <ActionButton icon={Flag} label="Priority" onClick={() => {}} />
            <ActionButton icon={Calendar} label="Due date" onClick={() => {}} />
            <ActionButton icon={CheckSquare} label="Checklist" onClick={() => {}} />
            <ActionButton icon={Paperclip} label="Attachment" onClick={() => {}} />
            <Separator className="my-2" />
            <ActionButton icon={Eye} label="Watch" onClick={() => {}} />
            <ActionButton icon={Copy} label="Duplicate" onClick={() => {}} />
            <ActionButton icon={Archive} label="Archive" onClick={() => archiveMutation.mutate()} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={onClick}>
      <Icon className="mr-2 h-4 w-4" />{label}
    </Button>
  );
}

function CardTitle({ card, boardId }: { card: Card; boardId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  const update = useMutation({
    mutationFn: () => api.patch(`/cards/${card.id}`, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['card', card.id] });
      qc.invalidateQueries({ queryKey: ['board-lists', boardId] });
      setEditing(false);
    },
  });

  if (editing) {
    return (
      <textarea
        className="w-full text-xl font-bold resize-none border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => update.mutate()}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); update.mutate(); } }}
        rows={2}
        autoFocus
      />
    );
  }

  return (
    <h2
      className="text-xl font-bold cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
      onClick={() => setEditing(true)}
    >
      {card.title}
    </h2>
  );
}
