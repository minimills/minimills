'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Archive, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CardItem } from './card-item';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { List } from '@minimills/shared';

export function BoardList({ list, boardId }: { list: List; boardId: string }) {
  const qc = useQueryClient();
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [listName, setListName] = useState(list.name);

  const { setNodeRef, isDragging } = useSortable({
    id: list.id,
    data: { type: 'list', list },
  });

  const addCard = useMutation({
    mutationFn: () => api.post('/cards', { listId: list.id, title: cardTitle }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board-lists', boardId] });
      setCardTitle('');
      setAddingCard(false);
    },
  });

  const renameList = useMutation({
    mutationFn: () => api.patch(`/lists/${list.id}`, { name: listName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['board-lists', boardId] }); setEditingName(false); },
  });

  const archiveList = useMutation({
    mutationFn: () => api.delete(`/lists/${list.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board-lists', boardId] }),
  });

  const cards = list.cards ?? [];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'shrink-0 w-72 bg-muted/50 rounded-xl flex flex-col max-h-full',
        isDragging && 'opacity-40'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 pb-2">
        {editingName ? (
          <input
            className="flex-1 font-semibold text-sm bg-transparent border-b border-primary focus:outline-none"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onBlur={() => renameList.mutate()}
            onKeyDown={(e) => { if (e.key === 'Enter') renameList.mutate(); if (e.key === 'Escape') { setListName(list.name); setEditingName(false); } }}
            autoFocus
          />
        ) : (
          <h3
            className="flex-1 font-semibold text-sm cursor-pointer"
            onClick={() => setEditingName(true)}
          >
            {list.name}
          </h3>
        )}
        <span className="text-xs text-muted-foreground">{cards.length}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingName(true)}><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAddingCard(true)}><Plus className="mr-2 h-4 w-4" />Add card</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => archiveList.mutate()}><Archive className="mr-2 h-4 w-4" />Archive list</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-2">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem key={card.id} card={card} listId={list.id} boardId={boardId} />
          ))}
        </SortableContext>

        {addingCard && (
          <div className="space-y-2">
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Card title..."
              rows={3}
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && cardTitle.trim()) { e.preventDefault(); addCard.mutate(); }
                if (e.key === 'Escape') { setAddingCard(false); setCardTitle(''); }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => addCard.mutate()} disabled={!cardTitle.trim()}>Add card</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAddingCard(false); setCardTitle(''); }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Add card button */}
      {!addingCard && (
        <div className="p-3 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setAddingCard(true)}
          >
            <Plus className="mr-2 h-4 w-4" />Add a card
          </Button>
        </div>
      )}
    </div>
  );
}
