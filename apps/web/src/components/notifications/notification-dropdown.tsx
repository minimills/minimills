'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import type { Notification } from '@minimills/shared';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=10'),
    refetchInterval: 30000,
  });

  const readAll = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {(data?.unreadCount ?? 0) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
              {data!.unreadCount > 9 ? '9+' : data!.unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {(data?.unreadCount ?? 0) > 0 && (
            <Button variant="ghost" size="sm" onClick={() => readAll.mutate()}>
              <Check className="mr-1 h-3 w-3" />Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {data?.notifications?.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No notifications</p>
          )}
          {data?.notifications?.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b last:border-0 ${!n.isRead ? 'bg-primary/5' : ''}`}
            >
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
