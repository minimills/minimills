'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Card, ChecklistWithItems, ChecklistItem } from '@minimills/shared';

export function CardChecklist({ card, boardId }: { card: Card; boardId: string }) {
  const qc = useQueryClient();
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [checklistName, setChecklistName] = useState('');

  const createChecklist = useMutation({
    mutationFn: () => api.post(`/cards/${card.id}/checklists`, { name: checklistName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['card', card.id] }); setChecklistName(''); setAddingChecklist(false); },
  });

  if (!card.checklists?.length && !addingChecklist) return null;

  return (
    <div className="mb-6">
      {card.checklists?.map((cl) => (
        <ChecklistBlock key={cl.id} checklist={cl} cardId={card.id} />
      ))}

      {addingChecklist && (
        <div className="mt-4 space-y-2">
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Checklist name..."
            value={checklistName}
            onChange={(e) => setChecklistName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && checklistName.trim()) createChecklist.mutate(); if (e.key === 'Escape') setAddingChecklist(false); }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => createChecklist.mutate()} disabled={!checklistName.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingChecklist(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistBlock({ checklist, cardId }: { checklist: ChecklistWithItems; cardId: string }) {
  const qc = useQueryClient();
  const [addingItem, setAddingItem] = useState(false);
  const [itemTitle, setItemTitle] = useState('');

  const completed = checklist.items.filter((i) => i.isCompleted).length;
  const total = checklist.items.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const addItem = useMutation({
    mutationFn: () => api.post(`/cards/${cardId}/checklists/${checklist.id}/items`, { title: itemTitle }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['card', cardId] }); setItemTitle(''); },
  });

  const toggleItem = useMutation({
    mutationFn: ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) =>
      api.patch(`/cards/${cardId}/checklists/${checklist.id}/items/${itemId}`, { isCompleted }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', cardId] }),
  });

  const deleteChecklist = useMutation({
    mutationFn: () => api.delete(`/cards/${cardId}/checklists/${checklist.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', cardId] }),
  });

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold flex-1">{checklist.name}</h3>
        <Button variant="ghost" size="sm" onClick={() => deleteChecklist.mutate()}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground w-6">{progress}%</span>
          <Progress value={progress} className="flex-1 h-2" />
        </div>
      )}

      <div className="space-y-1">
        {checklist.items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 hover:bg-muted/50 rounded p-1 cursor-pointer">
            <input
              type="checkbox"
              checked={item.isCompleted}
              onChange={(e) => toggleItem.mutate({ itemId: item.id, isCompleted: e.target.checked })}
              className="rounded"
            />
            <span className={cn('text-sm flex-1', item.isCompleted && 'line-through text-muted-foreground')}>
              {item.title}
            </span>
          </label>
        ))}
      </div>

      {addingItem ? (
        <div className="mt-2 space-y-2">
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Add an item..."
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && itemTitle.trim()) addItem.mutate(); if (e.key === 'Escape') setAddingItem(false); }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addItem.mutate()} disabled={!itemTitle.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingItem(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="mt-1 text-muted-foreground" onClick={() => setAddingItem(true)}>
          <Plus className="mr-1 h-3 w-3" />Add item
        </Button>
      )}
    </div>
  );
}
