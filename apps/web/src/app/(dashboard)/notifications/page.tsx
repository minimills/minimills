'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import type { Notification } from '@minimills/shared';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data } = useQuery<{ notifications: Notification[]; total: number; unreadCount: number }>({
    queryKey: ['all-notifications'],
    queryFn: () => api.get('/notifications?limit=50'),
  });

  const readAll = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-notifications'] }),
  });

  const deleteN = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-notifications'] }),
  });

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />Notifications
          </h1>
          {(data?.unreadCount ?? 0) > 0 && (
            <p className="text-muted-foreground">{data!.unreadCount} unread</p>
          )}
        </div>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button variant="outline" onClick={() => readAll.mutate()}>
            <Check className="mr-2 h-4 w-4" />Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {data?.notifications?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>No notifications yet</p>
          </div>
        )}
        {data?.notifications?.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 p-4 border rounded-lg ${!n.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
          >
            {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
            <div className="flex-1">
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
            </div>
            <div className="flex gap-1">
              {!n.isRead && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead.mutate(n.id)}>
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => deleteN.mutate(n.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
