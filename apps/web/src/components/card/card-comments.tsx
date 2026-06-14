'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { formatRelative, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import type { Card, Comment } from '@minimills/shared';

export function CardComments({ card, boardId }: { card: Card; boardId: string }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');

  const addComment = useMutation({
    mutationFn: () => api.post(`/comments/cards/${card.id}`, { content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['card', card.id] }); setContent(''); },
  });

  const deleteComment = useMutation({
    mutationFn: (id: string) => api.delete(`/comments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['card', card.id] }),
  });

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Comments</h3>
      </div>

      {/* Add comment */}
      <div className="flex gap-3 mb-4">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user?.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs">{getInitials(user?.name || 'U')}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Write a comment... (use @username to mention)"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey && content.trim()) addComment.mutate(); }}
          />
          <Button size="sm" onClick={() => addComment.mutate()} disabled={!content.trim() || addComment.isPending}>
            <Send className="mr-2 h-3 w-3" />Save
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {card.comments?.map((comment: Comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={comment.user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">{getInitials(comment.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">{formatRelative(comment.createdAt)}</span>
                {comment.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              {comment.userId === user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 text-xs text-muted-foreground"
                  onClick={() => deleteComment.mutate(comment.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
