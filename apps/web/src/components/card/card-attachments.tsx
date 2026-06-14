'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Paperclip, Upload, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { fileSize, formatDate } from '@/lib/utils';
import type { Card, Attachment } from '@minimills/shared';

export function CardAttachments({ card, boardId }: { card: Card; boardId: string }) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.upload(`/files/cards/${card.id}/attachments`, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', card.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/files/attachments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', card.id] }),
  });

  if (!card.attachments?.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Attachments</h3>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-1 h-3 w-3" />Upload
        </Button>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0]); }} />

      <div className="space-y-2">
        {card.attachments?.map((att: Attachment) => (
          <div key={att.id} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50">
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center shrink-0">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{att.name}</p>
              <p className="text-xs text-muted-foreground">{fileSize(att.size)} · {formatDate(att.createdAt)}</p>
            </div>
            <div className="flex gap-1">
              <a href={att.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3 w-3" /></Button>
              </a>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(att.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
