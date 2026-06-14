'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, DragStartEvent, DragEndEvent, DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoardList } from '@/components/board/board-list';
import { CardItem } from '@/components/board/card-item';
import { CardModal } from '@/components/card/card-modal';
import { api } from '@/lib/api';
import { useSocket } from '@/components/socket-provider';
import type { List, Card } from '@minimills/shared';

export default function BoardPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const openCardId = searchParams.get('card');
  const qc = useQueryClient();
  const { socket } = useSocket();
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [newListName, setNewListName] = useState('');
  const [addingList, setAddingList] = useState(false);

  const { data: lists = [], isLoading } = useQuery<List[]>({
    queryKey: ['board-lists', params.id],
    queryFn: () => api.get(`/lists/board/${params.id}`),
  });

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;
    socket.emit('board:join', params.id);

    const invalidate = () => qc.invalidateQueries({ queryKey: ['board-lists', params.id] });

    socket.on('card:created', invalidate);
    socket.on('card:updated', invalidate);
    socket.on('card:deleted', invalidate);
    socket.on('card:moved', invalidate);
    socket.on('card:reordered', invalidate);
    socket.on('list:created', invalidate);
    socket.on('list:updated', invalidate);
    socket.on('list:deleted', invalidate);
    socket.on('list:reordered', invalidate);

    return () => {
      socket.emit('board:leave', params.id);
      socket.off('card:created', invalidate);
      socket.off('card:updated', invalidate);
      socket.off('card:deleted', invalidate);
      socket.off('card:moved', invalidate);
      socket.off('card:reordered', invalidate);
      socket.off('list:created', invalidate);
      socket.off('list:updated', invalidate);
      socket.off('list:deleted', invalidate);
      socket.off('list:reordered', invalidate);
    };
  }, [socket, params.id, qc]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const reorderMutation = useMutation({
    mutationFn: (data: { boardId: string; cards: { id: string; listId: string; position: number }[] }) =>
      api.post('/cards/reorder', data),
  });

  const addListMutation = useMutation({
    mutationFn: () => api.post('/lists', { boardId: params.id, name: newListName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board-lists', params.id] });
      setNewListName('');
      setAddingList(false);
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    if (active.data.current?.type === 'card') {
      const activeCard = active.data.current.card as Card;
      const overListId = over.data.current?.listId || over.data.current?.list?.id;
      const overPosition = over.data.current?.card?.position || 1000;

      if (overListId) {
        reorderMutation.mutate({
          boardId: params.id,
          cards: [{ id: activeCard.id, listId: overListId, position: overPosition }],
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 h-full overflow-x-auto items-start">
          <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <BoardList key={list.id} list={list} boardId={params.id} />
            ))}
          </SortableContext>

          {/* Add list */}
          <div className="shrink-0 w-72">
            {addingList ? (
              <div className="bg-background border rounded-xl p-3 space-y-2">
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="List name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newListName.trim()) addListMutation.mutate();
                    if (e.key === 'Escape') { setAddingList(false); setNewListName(''); }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addListMutation.mutate()} disabled={!newListName.trim()}>Add list</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAddingList(false); setNewListName(''); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setAddingList(true)}
              >
                <Plus className="mr-2 h-4 w-4" />Add a list
              </Button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && <CardItem card={activeCard} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Card modal */}
      {openCardId && <CardModal cardId={openCardId} boardId={params.id} />}
    </>
  );
}
