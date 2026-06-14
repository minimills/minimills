'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { Card } from '@minimills/shared';

export function CardDescription({ card, boardId }: { card: Card; boardId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(card.description || '');

  const update = useMutation({
    mutationFn: () => api.patch(`/cards/${card.id}`, { description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['card', card.id] });
      setEditing(false);
    },
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlignLeft className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Description</h3>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => update.mutate()}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setDescription(card.description || ''); setEditing(false); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div
          className="min-h-[60px] cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 text-sm"
          onClick={() => setEditing(true)}
        >
          {description ? (
            <p className="whitespace-pre-wrap">{description}</p>
          ) : (
            <p className="text-muted-foreground">Add a more detailed description...</p>
          )}
        </div>
      )}
    </div>
  );
}
